import { Toast } from "antd-mobile";
import { makeAutoObservable, toJS } from "mobx";
import { getDistance, Optional, Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import EmployeesStore from "./employees.store";
import MenuStore from "./menu.store";
import RootStore from "./root.store";
import IconBtnDelivery from '../assets/icon_btn_delivery@2x.png'
import IconBtnPickup from '../assets/icon_btn_pickup@2x.png'
import _ from 'lodash'

export const apikey = 'b76c1fb9-de2c-4f5a-8621-46681c107466'
export class ReceptionStore {
  root: RootStore;

  /** выбранный тип обслуживания: доставка или самовывоз */
  receptionType: ReceptionType = localStorage.getItem('receptionType')
    ? localStorage.getItem('receptionType') as ReceptionType
    : 'initial'
  
  setReceptionType(rt: ReceptionType) {
    this.receptionType = rt
    localStorage.setItem('receptionType', rt)
    logger.log('reception changed to ' + rt, 'reception-store')
  }

  /**
   * когда надо показать подсказку что местоположение и тип обслуживания
   * не выбраны
   */
  get needAskLocation() {
    const userLoaded = this.root.user.loadUserInfo.state === 'COMPLETED'
    return [this.receptionType === 'initial',
      !this.address.road && this.receptionType === 'delivery' && userLoaded,
      !this.currentOrganizaion && this.receptionType === 'pickup' && userLoaded
    ].includes(true)
  }

  /**
   * находится ли юзер в злне обслуживания доставки
   */
  get isInServiceArea() {
    return this.nearestOrgDistance && this.nearestOrgDistance < 10
  }

  /** попап для выбора локации и типа обслуживания */
  selectLocationPopup = new Popup()

  /** доступные опции обслуживания */
  options = [{
    label: 'Доставка',
    value: receptionTypes.delivery,
    text: 'Доставка',
    prependImage: IconBtnDelivery,
    prependImageMargin: '3px',
    prependImageWidth: '29px',
    prependImageHeight: '17px',
    minWidth: '134px',
  }, {
    label: 'Самовывоз',
    value: receptionTypes.pickup,
    text: 'Заберу сам',
    prependImage: IconBtnPickup,
    prependImageMargin: '8px',
    prependImageWidth: '20px',
    prependImageHeight: '21px',
    minWidth: '134px',
  }]

  location: Optional<Location> = localStorage.getItem('lctn')
    ? JSON.parse(localStorage.getItem('lctn') as string) as Location
    : null
  setLocation = (l: Location) => {
    localStorage.setItem('lctn', JSON.stringify(l))
    this.location = l
  }

  address = localStorage.getItem('data')
    ? JSON.parse(localStorage.getItem('data') as string) as Address
    : {
      road: '',
      house_number: '',
      multiapartment: true,
      frame: '',
      entrance: '',
      doorCode: '',
      storey: '',
      apartment: '',
      addrComment: '',
      incorrectAddr: false,
    }
  setAddressForAdditionalFields = (address: Address) => {
    this.address = address
    localStorage.setItem('data', JSON.stringify(address))
  }
  setAddress = (address: Address) => {
    this.address = address
    localStorage.setItem('data', JSON.stringify(address))
  }
  /**
   * by [lat, lon]
   * @param cord 
   */
  setAddrByCordinates = async (cord: Location) => {
    const { nearestDeliveryPoint, distance } = this.getNearestDeliveryPoint(cord.lat, cord.lon)
    
    if(nearestDeliveryPoint && distance) {
      if(distance < 10) {
        const { lon,lat } = cord
        const address = await this.reverseGeocoderApi.run(lat, lon)
        if(address?.Components.length
          && address.Components.find(comp => comp.kind === 'street')
          && address.Components.find(comp => comp.kind === 'house')
        ) {
          const road = address.Components.find(comp => comp.kind === 'street')?.name as string
          const house_number = address.Components.find(comp => comp.kind === 'house')?.name as string
          this.setLocation(cord)
          this.setAddress({ road, house_number })
          this.setNearestOrg(nearestDeliveryPoint.Id)
          this.setNearestOrgDistance(distance)
          console.log('найдена ближ. точка ' 
            + nearestDeliveryPoint?.Name 
            + ' для доставки в '
            + road + ' ' + house_number
            + ' на расстоянии ' 
            + distance
          )
        } else {
          Toast.show('Местоположение не найдено')
        }
      } else {
        Toast.show("Адрес вне зоны обслуживания Gurmag")
      }
    } else {
      Toast.show("Не удалось найти ближающее заведение для доставки")
    }
  }

  /** by address */
  setCordinatesByAddress = async (address: Address) => {
    const { road, house_number } = address
    const result = await this.geocoderApi.run('Уфа, ' + road + ' ' + house_number)
    if(result) {
      const { lat, lon } = result
      const { nearestDeliveryPoint, distance } = this.getNearestDeliveryPoint(lat, lon)
      if(nearestDeliveryPoint && distance) {
        if(distance < 10) {
          this.setLocation(result)
          this.setAddress(address)
          this.setNearestOrg(nearestDeliveryPoint.Id)
          this.setNearestOrgDistance(distance)
          console.log('найдена ближ. точка ' 
            + nearestDeliveryPoint?.Name 
            + ' для доставки в '
            + road + ' ' + house_number
            + ' на расстоянии ' 
            + distance
          )
        } else {
          Toast.show("Адрес вне зоны обслуживания Gurmag")
        }
      } else {
        Toast.show("Не удалось найти ближающее заведение для доставки")
      }
    } else {
      this.setAddress({ road, house_number, incorrectAddr: true })
    }
  }

  /**
   * найти ближ точку для доставки и расстояние до нее
   * @param targetlat this.location[1]
   * @param targetlon this.location[0]
   */
  private getNearestDeliveryPoint = (targetlat: number, targetlon: number) => {
    let resultOrganization
    let minDistance
    let deliveryPoints: Organization[] = _.clone(this.root.reception.organizations);
    for (const org of deliveryPoints) {
      // для каждой организации захардкодил кординаты 
      // каждый раз их узнавать заного смысла нет
      const pointCords = this.addrsBindings
        .find(o => o.Id === org.Id) as { Id: number, pos: string }


      let lon, lat
      
      [lon, lat] = pointCords.pos
        .split(' ')
        .map(Number)

      /** расстояние */
      const distance = getDistance(targetlat, targetlon, lat, lon)
      if (minDistance) {
        if (distance < minDistance) {
          minDistance = distance
          resultOrganization = org
        }
      } else {
        minDistance = distance
        resultOrganization = org
      }
    }
    return { nearestDeliveryPoint: resultOrganization, distance: minDistance }
  }

  
  /** все организации */
  organizations: Array<Organization> = [];
  setOrgs = (o: Organization[]) => { this.organizations = o }

  /** точки с которых ведется доставка */
  /* deliveryPoints: Organization[] = [
    {
      Id: 2,
      Name: "Рабкоров_20",
      isCK: false
    },
    {
      Id: 140,
      Name: "Российская_43",
      isCK: false
    }
  ] */

  /** текущая организация */
  selectedOrgID: number = localStorage.getItem('currentOrg')
    ? Number(localStorage.getItem('currentOrg'))
    : 0
  
  /** ближ точка для доставки */
  nearestOrgForDelivery: Optional<number> = localStorage.getItem('nearestOrg')
    ? Number(localStorage.getItem('nearestOrg'))
    : null
  
  nearestOrgDistance: Optional<number> = localStorage.getItem('nearestOrgDistance')
    ? Number(localStorage.getItem('nearestOrgDistance'))
    : null
  
  setNearestOrg(orgId: number) { 
    this.nearestOrgForDelivery = orgId 
    localStorage.setItem('nearestOrg', orgId.toString())
  }
  setNearestOrgDistance(distance: number) { 
    this.nearestOrgDistance = distance 
    localStorage.setItem('nearestOrgDistance', distance.toString())
  }
  
  set currentOrgID(val: number) {
    this.selectedOrgID = val
    localStorage.setItem('currentOrg', val.toString())
  }

  /** апишка сохранения точки на сервере, возможно бесполезна уже */
  saveCurrentOrg = new Request(async (state, setState, newOrgId: number) => {
    setState('LOADING')
    const { ID } = this.root.user
    try {
      const response: Undef<string> = await http.post(
        '/setUserOrg', 
        { userId: ID, newOrgId }
      )
      if(response) {
        logger.log('Организация успешно сменена', 'Reception-Store');
        setState('COMPLETED')
      }
    } catch(err) {
      setState('FAILED')
    }
  })

  get currentOrgID() {
    return this.selectedOrgID
  }

  get OrgForMenu() {
    let deliveryPoints: Organization[] = _.clone(this.root.reception.organizations);
    const defaultMenuOrg = deliveryPoints[0]?.Id
    return (this.receptionType === 'delivery'
      ? this.nearestOrgForDelivery
      : this.currentOrgID
    ) || defaultMenuOrg
  }
  get currentOrganizaion() {
    return this.organizations.find(org => 
      org.Id == this.selectedOrgID
    )
  }
  
  loadOrganizations = new Request(async (state, setState) => {
    setState('LOADING');
    try {
      let orgs: Organization[] = await http.get('/GetOrgForWeb');
      this.setOrgs(orgs)
      setState('COMPLETED')
    } catch (err) {
      setState('FAILED')
      const errStr = 'Не удалось загрузить организации'
      logger.error(errStr, 'User-Info-Store')
      Toast.show({
        content: errStr, 
        position: 'center'
      })
    }
  })

  get needAskAdress() {
    return this.selectedOrgID === 142 || this.selectedOrgID === 0
  }


  constructor(root: RootStore) {
    this.root = root; 
    makeAutoObservable(this, {}, { autoBind: true }) 

    /** кажду минуту будем проверять не закрылся ли гурмаг 
     * чтобы заблочить некоторые фичи и все работало как надо  */
    setInterval(this.checkWorkTime, 1000)
  }

  /** работает ли гурмаг сейчас */
  isWorkingNow = true
  setWorkingNow = (b: boolean) => { this.isWorkingNow = b }

  checkWorkTime = () => {
    const [startH, startM] = '9:30'.split(':').map(Number)
    const [endH, endM] = '21:30'.split(':').map(Number)
    const now = new Date()
    const nowM = now.getMinutes()
    const nowH = now.getHours()

    const cond = (startH * 60 + startM) <= (nowH * 60 + nowM)
      && (nowH * 60 + nowM) <= (endH * 60 + endM)
    
    cond
      ? this.setWorkingNow(true)
      : this.setWorkingNow(false)
  };

  /** известные кординаты точек выдачи */
  addrsBindings = [
    {
      Id: 2,
      pos: "56.002691 54.70186"
    },
    {
      Id: 115,
      pos: "56.059599 54.770162"
    },
    {
      Id: 140,
      pos: "56.03653 54.77791"
    },
    {
      Id: 141,
      pos: "55.928068 54.723413"
    },
    {
      Id: 144,
      pos: "56.131958 54.781597"
    },
    {
      Id: 147,
      pos: "56.099008 54.810361"
    }
  ]

  /** get cordinates by address api */
  geocoderApi = new Request(async (state, setState, address: string) => {
    try {
      setState('LOADING')
      const result: YandexGeocodeResponse = await http.get(
        'https://geocode-maps.yandex.ru/1.x', {
        apikey,
        geocode: address,
        format: 'json',
        lang: 'ru_RU',
        kind: 'house'
      })
      if (result?.response?.GeoObjectCollection?.featureMember?.length) {
        const { GeoObject } = result.response.GeoObjectCollection.featureMember[0]
        const [lon, lat] = GeoObject.Point.pos.split(' ')
        logger.log(`geocoderApi: Нашли кординаты lat = ${lat} lon = ${lon} для ${address}`, 'Reception-Store')
        setState('COMPLETED')
        return { lat: Number(lat), lon: Number(lon)}
      } else {
        throw new Error('геокодер не вернул кординаты')
      }
    } catch (e) {
      setState('FAILED')
      logger.error('Не нашли кординаты ' + e, 'geocoderApi')
      return undefined
    }
  })
  /** get address by cordinates api */
  reverseGeocoderApi = new Request(async (state, setState, lat: number, lon: number) => {
    try {
      setState('LOADING')
      const result: YandexGeocodeResponse = await http.get(
        'https://geocode-maps.yandex.ru/1.x', {
        apikey,
        geocode: `${lon}, ${lat}`,
        format: 'json',
        lang: 'ru_RU',
        kind: 'house'
      })
      if (result?.response?.GeoObjectCollection?.featureMember?.length) {
        const { GeoObject } = result.response.GeoObjectCollection.featureMember[0]
        setState('COMPLETED')
        return GeoObject.metaDataProperty.GeocoderMetaData.Address
      } else {
        throw new Error('адрес не нашли')
      }
    } catch (e) {
      setState('FAILED')
      logger.error('не нашли адрес ' + e, 'reverseGeocoderApi')
      return null
    }
  })

  requestGeolocation = () => {
    if (navigator && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        this.setAddrByCordinates({
          lon: coords.longitude,
          lat: coords.latitude, 
        })
      })
      logger.log('местоположение разрешено', 'reception')
    } else {
      logger.log('местоположение не доступно', 'reception')
    }
  }

  selectOrgPopup = new Popup()

  employees = new EmployeesStore(this)
  menu = new MenuStore(this)
}


export const receptionTypes = {
  pickup: 'pickup',
  delivery: 'delivery',
  initial: 'initial',
} as const;

export type ReceptionType = typeof receptionTypes[
  keyof typeof receptionTypes
];

export const receptionCodes = {
  [receptionTypes.delivery]: 2,
  [receptionTypes.pickup]: 1,
  [receptionTypes.initial]: undefined,
}


/** Организация */
export type Organization = {
  Id: number,
  Name: string,
  isCK: boolean,
}


type YandexGeocodeResponse = {
  response: {
    GeoObjectCollection: {
      metaDataProperty: {
        GeocoderResponseMetaData: {
          Point: {
            /** example "56.002691 54.70186" */
            pos: string
          },
          /** example "56.002691,54.70186" */
          request: string,
          /** example "10" */
          results: string,
          /** example "10" */
          found: string
        }
      },
      featureMember: Array<GeoObject>
    }
  }
}
type GeoObject = {
  GeoObject: {
    metaDataProperty: {
      GeocoderMetaData: {
        /** example "exact" */
        precision: string,
        /** example "Россия, Республика Башкортостан, Уфа, улица Рабкоров, 20" */
        text: string,
        /** example "house" */
        kind: string,
        Address: {
          /** example "RU" */
          country_code: string,
          /** example "Россия, Республика Башкортостан, Уфа, улица Рабкоров, 20" */
          formatted: string,
          /** example "450092" */
          postal_code?: string,
          Components: Array<{
            /** example "house" */
            kind: string,
            /** example "20" */
            name: string
          }>
        },
        AddressDetails: {
          Country: {
            /** example "Россия, Республика Башкортостан, Уфа, улица Рабкоров, 20" */
            AddressLine: string,
            /** example "RU" */
            CountryNameCode: string,
            /** example "Россия" */
            CountryName: string,
            AdministrativeArea?: {
              /** example "Республика Башкортостан" */
              AdministrativeAreaName: string,
              SubAdministrativeArea?: {
                /** example "городской округ Уфа" */
                SubAdministrativeAreaName?: string,
                /** example "Республика Башкортостан" */
                AdministrativeAreaName?: string,
                Locality?: {
                  /** example "Уфа" */
                  LocalityName: string,
                  Thoroughfare?: {
                    /** example "улица Рабкоров" */
                    ThoroughfareName: string,
                    Premise?: {
                      /** example "20" */
                      PremiseNumber: string,
                      PostalCode: {
                        /** example "450092" */
                        PostalCodeNumber: string
                      }
                    }
                  },
                  DependentLocality?: {
                    /** example "Кировский район" */
                    DependentLocalityName: string,
                    DependentLocality?: {
                      /** example "Кировский район" */
                      DependentLocalityName: string,
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    /** example "улица Рабкоров, 20" */
    name: string,
    /** example "Уфа, Республика Башкортостан, Россия" */
    description?: string,
    boundedBy: {
      Envelope: {
        /** example "55.998585 54.699482" */
        lowerCorner: string,
        /** example "56.006796 54.704238" */
        upperCorner: string,
      }
    },
    /** example "ymapsbm1://geo?data=IgoNwQJgQhW0zlpC" */
    uri: string,
    Point: {
      /** example "56.002691 54.70186" */
      pos: string
    }
  }
}

type Address = {
  road: string,
  house_number: string,
  multiapartment?: boolean,

  frame?: string | undefined,
  entrance?: string | undefined,
  doorCode?: string | undefined,
  storey?: string | undefined,
  apartment?: string | undefined,
  addrComment?: string | undefined,
  incorrectAddr?: boolean | undefined,
}
export type Location = { lat: number, lon: number }