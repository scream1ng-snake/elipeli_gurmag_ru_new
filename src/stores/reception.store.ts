import { Toast } from "antd-mobile";
import { makeAutoObservable, toJS } from "mobx";
import { getDistance, Optional, Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import EmployeesStore from "./employees.store";
import MenuStore from "./menu.store";
import RootStore from "./root.store";

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

  /** попап для выбора локации и типа обслуживания */
  selectLocationPopup = new Popup()

  /** доступные опции обслуживания */
  options = [{
    label: 'Доставка',
    value: receptionTypes.delivery
  }, {
    label: 'Самовывоз',
    value: receptionTypes.pickup
  }]

  location: Optional<[number, number]> = null
  setLocation = (l: [number,number]) => {
    this.location = l
  }

  address = localStorage.getItem('data')
    ? JSON.parse(localStorage.getItem('data') as string) as Address
    : {
      road: '',
      house_number: '',
      frame: '',
      entrance: '',
      doorCode: '',
      storey: '',
      apartment: '',
      addrComment: '',
    }

  setAddress = (address: Address) => {
    logger.log(`setAddress | address: ${JSON.stringify(address) }`, 'reception.store')
    this.address = address
    localStorage.setItem('data', JSON.stringify(address))
    // сразу ищем ближающую точку для доставки
    if(this.location) {
      let resultOrganization
      let minDistance
      for (const org of this.deliveryPoints) {
        // для каждой организации захардкодил кординаты 
        // каждый раз их узнавать заного смысла нет
        const pointCords = this.addrsBindings
          .find(o => o.Id === org.Id) as { Id: number, pos: string }


        let lon, lat
        
        [lon, lat] = pointCords.pos
          .split(' ')
          .map(Number)

        /** расстояние */
        const distance = getDistance(this.location[1], this.location[0], lat, lon)
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
      if(resultOrganization) {
        this.setNearestOrg(resultOrganization.Id)
        localStorage.setItem('nearestOrg', resultOrganization.Id.toString())
        logger.log(`setAddress | ближ. точка для ${address.road} ${address.house_number} (${this.location})
          была выбрана ${resultOrganization.Name} на расстоянии ${minDistance}
        `, 'reception.store')
      }
    }
    
  }
  /**
   * by [lat, lon]
   * @param cord 
   */
  setAddrByCordinates = async (cord: [number, number]) => {
    logger.log(`setAddrByCordinates | cord: ${JSON.stringify(cord) }`, 'reception.store')
    const [lon,lat] = cord
    const address: NominatimReverseResponse['address'] = await this.reverseGeocoderApi.run(lat, lon)
    if(typeof address === 'object' && address.hasOwnProperty('road') && address.hasOwnProperty('house_number')) {
      const { road, house_number } = address
      this.setAddress({ road, house_number })
      this.setLocation(cord)
    } else {
      Toast.show('Местоположение не найдено')
    }
  }

  /** by address */
  setCordinatesByAddress = async ({ road, house_number }: Address) => {
    logger.log(`setCordinatesByAddress | road: ${JSON.stringify(road)} | house_number: ${JSON.stringify(house_number)}`, 'reception.store')
    this.address = { road, house_number }
    const result = await this.geocoderApi.run('Уфа, ' + road + ' ' + house_number)
    if(result) {
      const [lon, lat]: [number, number] = result
      this.setLocation([lat, lon])
    }
  }


  
  /** все организации */
  organizations: Array<Organization> = [];
  setOrgs = (o: Organization[]) => { this.organizations = o }

  /** точки с которых ведется доставк */
  deliveryPoints: Organization[] = [
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
  ]

  /** текущая организация */
  selectedOrgID: number = localStorage.getItem('currentOrg')
    ? Number(localStorage.getItem('currentOrg'))
    : 0
  
  nearestOrgForDelivery: Optional<number> = localStorage.getItem('nearestOrg')
    ? Number(localStorage.getItem('nearestOrg'))
    : null
  
  setNearestOrg(orgId: number) { this.nearestOrgForDelivery = orgId }
  
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
    const defaultMenuOrg = this.deliveryPoints[0].Id
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
      const result: NominatimGeocodeResponse = await http.get(
        'https://nominatim.openstreetmap.org/search', {
        q: address,
        format: 'json'
      })
      if (result?.[0]) {
        let { lat, lon } = result?.[0]
        logger.log(`geocoderApi: Нашли кординаты lat = ${lat} lon = ${lon} для ${address}`, 'reception.store')
        setState('COMPLETED')
        return [Number(lat), Number(lon)]
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
      const result: NominatimReverseResponse = await http.get(
        'https://nominatim.openstreetmap.org/reverse', {
        lat,
        lon,
        format: 'json'
      })
      if(result?.address) {
        setState('COMPLETED')
        return result.address
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
        this.setAddrByCordinates([
          coords.longitude,
          coords.latitude, 
        ])
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

type NominatimGeocodeResponse = [
  {
    place_id: number,
    licence: string,
    osm_type: string,
    osm_id: number,
    /** example "54.70161865" */
    lat: string,
    /** example "56.0027922177958" */
    lon: string,
    /** example "building" */
    class: string,
    /** example "yes" */
    type: string,
    place_rank: number,
    importance: number,
    /** example "building" */
    addresstype: string,
    name: string,
    display_name: string,
    /**
     * [
        "54.7010415",
        "54.7021239",
        "56.0022407",
        "56.0032648",
      ]
     */
    boundingbox: string[]
  }
]

type NominatimReverseResponse = {
  place_id: number,
  licence: string,
  osm_type: string,
  osm_id: number,
  /** example: "54.70166155" */
  lat: string,
  /** example: "56.0027805177958" */
  lon: string,
  class: string,
  type: string,
  place_rank: number,
  importance: number,
  addresstype: string,
  name: string,
  /** example: "20, улица Рабкоров, 
   * Зелёная Роща, 
   * Кировский район, 
   * Уфа, 
   * городской округ Уфа, 
   * Башкортостан, 
   * Приволжский федеральный округ, 
   * 450000, Россия" 
   * */
  display_name: string,
  address: {
      /** example: "20" */
      house_number: string,

      /** example: "улица Рабкоров" */
      road: string,

      /** example: "Зелёная Роща" */
      suburb: string,

      /** example: "Кировский район" */
      city_district: string,

      /** example: "Уфа" */
      city: string,

      /** example: "городской округ Уфа" */
      county: string,

      /** example: "Башкортостан" */
      state: string,

      /** example: "RU-BA" */
      "ISO3166-2-lvl4": string,

      /** example: "Приволжский федеральный округ" */
      region: string,

      /** example: "450000" */
      postcode: string,

      /** example: "Россия" */
      country: string,

      /** example: "ru" */
      country_code: string,
  },
  boundingbox: string[]
}

type Address = {
  road: string,
  house_number: string,

  frame?: string | undefined,
  entrance?: string | undefined,
  doorCode?: string | undefined,
  storey?: string | undefined,
  apartment?: string | undefined,
  addrComment?: string | undefined,
}
