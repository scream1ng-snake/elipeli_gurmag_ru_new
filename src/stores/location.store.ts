import { makeAutoObservable, reaction, toJS } from "mobx";
import { apikey, CITY_PREFIX, ReceptionStore } from "./reception.store";
import { Optional, Request } from "../features/helpers";
import { Toast } from "antd-mobile";
import { http } from "../features/http";
import { logger } from "../features/logger";
import SavedAdresses, { SavedAddress } from "./SavedAddresses";

const MAX_DELIVERY_DISTANCE = 10
export const initial: Address = {
  road: '',
  house_number: '',
  multiapartment: true,
  entrance: '',
  doorCode: '',
  storey: '',
  apartment: '',
  addrComment: '',
  incorrectAddr: false,
}


class LocationStore {
  private ADDR_KEY = 'data'                        // тут храним текстовый адрес улица дом этаж и тд
  private LOCATION_KEY = 'lctn'                    // тут координаты
  private CURR_ADDR_VCODE = "curr_addr_Vcode"      // тут ид сущности адреса
  constructor(readonly reception: ReceptionStore) {
    makeAutoObservable(this, {}, { autoBind: true })

    const address = localStorage.getItem(this.ADDR_KEY)
    if(address) {
      try {
        const data = JSON.parse(address) as Address
        this.confirmedAddress = data
        this.inputingAddress = data
      } catch (error) {
        console.error(error)
      }
    }

    const location = localStorage.getItem(this.LOCATION_KEY)
    if(location) {
      try {
        const data = JSON.parse(location) as Location
        this.confirmedLocation = data
        this.inputingLocation = data
      } catch (error) {
        console.error(error)
      }
    }

    const addrVcode = localStorage.getItem(this.CURR_ADDR_VCODE)
    if(addrVcode && addrVcode !== 'null') {
      this.ConfirmedVcode = addrVcode
      this.InputingVcode = addrVcode
    }

    // reaction(() => this.confirmedAddress.road, (val ,prev, r) => {
    //   console.log(`current ${toJS(val)}`)
    //   console.log(`prev ${toJS(prev)}`)
    //   console.log(r)
    // })
  }

  savedAdresses = new SavedAdresses(this)
  

  /** введеный и подтвержденный адрес */
  confirmedAddress: Address = initial
  /** состояние для формы */
  inputingAddress: Address = initial

  clearAddress() {
    this.confirmedAddress = initial
    this.inputingAddress = initial
    this.confirmedLocation = null
    this.inputingLocation = null
    this.InputingVcode = null
    this.ConfirmedVcode = null
    localStorage.removeItem(this.LOCATION_KEY)
    localStorage.removeItem(this.ADDR_KEY)
    localStorage.removeItem(this.CURR_ADDR_VCODE)
  }

  /** сетаем поля которые не влияют на положение маркера при вводе*/
  setAdditionalFields = (address: Omit<Address, 'road' | 'house_number'>) => {
    this.inputingAddress = { ...this.inputingAddress, ...address }
  }
  /** сетаем поля которые влияют на положение маркера при вводе */
  setAffectFields = ({ road, house_number }: Pick<Address, 'road' | 'house_number'>) => {
    this.inputingAddress = { ...this.inputingAddress, road, house_number }
  }

  setConfirmedAddress = () => {
    this.confirmedAddress = this.inputingAddress
    this.partialUpdateData(this.ADDR_KEY, this.inputingAddress)
  }

  /** частично обновить localstorage */
  private partialUpdateData = <T>(key: string, value: Partial<T>) => {
    const saved = localStorage.getItem(key)
    const oldValue: T = saved ? JSON.parse(saved) : {}
    const newValue = { ...oldValue, ...value }
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  /** пользователь подтвердил локацию */
  confirmedLocation: Optional<Location> = null
  /** состояние для карты */
  inputingLocation: Optional<Location> = null

  setInputingLocation = (l: Location) => { this.inputingLocation = l }
  setConfirmedLocation = () => {
    localStorage.setItem(this.LOCATION_KEY, JSON.stringify(this.inputingLocation))
    this.confirmedLocation = this.inputingLocation
  }

  /**
   * это просто пометка что мы редактируем сохраненный адрес на сервере
   * и если ВКод есть то надо сделать update запрос
   */
  InputingVcode: Optional<string> = null
  ConfirmedVcode: Optional<string> = null
  setInputingVcode(vcode: Optional<string>) {
    this.InputingVcode = vcode
  }
  setConfirmedVcode() {
    this.ConfirmedVcode = this.InputingVcode
    localStorage.setItem(this.CURR_ADDR_VCODE, this.InputingVcode || 'null')
  }

  
  public setAddressByCoords = async (cord: Location) => {
    const { nearestOrg, distance } = this.reception.getNearestDeliveryOrg(cord.lat, cord.lon)
    
    if(nearestOrg && distance) {
      if(distance < MAX_DELIVERY_DISTANCE) {
        const { lon, lat } = cord
        const address = await this.reverseGeocoderApi.run(lat, lon)
        if(address?.Components.length
          && address.Components.find(comp => comp.kind === 'street')
          && address.Components.find(comp => comp.kind === 'house')
        ) {
          const road = address.Components.find(comp => comp.kind === 'street')?.name as string
          const house_number = address.Components.find(comp => comp.kind === 'house')?.name as string
          this.setInputingLocation(cord)
          this.setAffectFields({ road, house_number })
          this.reception.setNearestOrg(nearestOrg.Id)
          this.reception.setNearestOrgDistance(distance)
          console.log('найдена ближ. точка ' 
            + nearestOrg?.Name 
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
    const result = await this.geocoderApi.run(CITY_PREFIX + road + ' ' + house_number)
    if(result) {
      const { lat, lon } = result
      const { nearestOrg, distance } = this.reception.getNearestDeliveryOrg(lat, lon)
      if(nearestOrg && distance) {
        if(distance < MAX_DELIVERY_DISTANCE) {
          this.setInputingLocation(result)
          this.setAffectFields(address)
          this.setAdditionalFields(address)
          this.reception.setNearestOrg(nearestOrg.Id)
          this.reception.setNearestOrgDistance(distance)
          console.log('найдена ближ. точка ' 
            + nearestOrg?.Name 
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
      address.incorrectAddr = true
      this.setAffectFields(address)
      this.setAdditionalFields(address)
    }
  }

  


  
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
        this.setAddressByCoords({
          lon: coords.longitude,
          lat: coords.latitude, 
        })
      })
      logger.log('местоположение разрешено', 'reception')
    } else {
      logger.log('местоположение не доступно', 'reception')
    }
  }

  addressToString(address: Address): string {
    const { road, house_number, entrance, storey, apartment, addrComment } = address
    return `${road ? 'ул. ' + road : ''} ${house_number ? 'д. ' + house_number : ''} ${entrance ? 'под. ' + entrance : ''} ${storey ? 'эт. ' + storey : ''} ${apartment ? 'кв. ' + apartment : ''}`
  }

  setInputingAddrFromSaved = async (savedAddr: SavedAddress) => {
    let lat: Optional<number> = null
    let lon: Optional<number> = null
    
    if(savedAddr.lat && savedAddr.lon) {
      lat = Number(savedAddr.lat)
      lon = Number(savedAddr.lon)
    } else {
      const result = await this.geocoderApi.run(CITY_PREFIX + savedAddr.street + ' ' + savedAddr.house)
      if(result) {
        lat = result.lat
        lon = result.lon
      }
    }
    if(lat && lon) {
      const { nearestOrg, distance } = this.reception.getNearestDeliveryOrg(lat, lon)
      if(nearestOrg && distance) {
        if(distance < MAX_DELIVERY_DISTANCE) {
          this.setInputingVcode(savedAddr.VCode)
          this.setInputingLocation({ lat, lon })
          this.setAffectFields({
            road: savedAddr.street,
            house_number: savedAddr.house
          })
          this.setAdditionalFields({
            entrance: savedAddr.entrance || undefined,
            storey: savedAddr.storey || undefined,
            apartment: savedAddr.apartment || undefined,
            addrComment: savedAddr.addrComment || undefined,
            incorrectAddr: savedAddr.incorrectAddress || undefined,
          })
        } else {
          Toast.show("Адрес вне зоны обслуживания Gurmag")
        }
      } else {
        Toast.show("Не удалось найти ближающее заведение для доставки")
      }
    }
  }
  setConfirmedAddrFromSaved = () => {
    const lat = Number(this.inputingLocation?.lat)
    const lon = Number(this.inputingLocation?.lon)

    const { nearestOrg, distance } = this.reception.getNearestDeliveryOrg(lat, lon)
      if(nearestOrg && distance) {
        if(distance < MAX_DELIVERY_DISTANCE) {
          this.setConfirmedLocation()
          this.setConfirmedAddress()
          this.setConfirmedVcode()
          this.reception.setNearestOrg(nearestOrg.Id)
          this.reception.setNearestOrgDistance(distance)
        } else {
          Toast.show("Адрес вне зоны обслуживания Gurmag")
        }
      } else {
        Toast.show("Не удалось найти ближающее заведение для доставки")
      }
  }

  jsonMap: GeoJson | null = null
  setJsonMap = (jsonMap: GeoJson) => {
    this.jsonMap = jsonMap
  }

  
}

/**
 * "street": Улица
  "house": Дом 
  "frame":, Корпус/литер
  "entrance": Подъезд
  "doorCode": Код на двери
  "storey": Этаж
  "apartment": Квартира
  "addrComment": Комментарий к заказу
  
 */
export type Address = {
  uuid?: UUID,
  road: string,
  house_number: string,
  multiapartment?: boolean,

  entrance?: string,
  doorCode?: string,
  storey?: string,
  apartment?: string,
  addrComment?: string,
  incorrectAddr?: boolean,
}
type UUID = string
export type Location = { lat: number, lon: number }


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


export type GeoJson = {
  type: "FeatureCollection"
  metadata: {
    name: string,
    creator: string,
    description: string
  }
  features: GeoJsonFeature[]
}

export type GeoJsonFeature = {
  type: "Feature"
  id: number
  geometry: PointGeometry | PolygonGeometry
  properties: {
    description: string
    iconCaption: string
    "marker-color": string
    fill: string,
    "fill-opacity": number
    stroke: string
    "stroke-width": string
    "stroke-opacity": number
  }
}

type PointGeometry = {
  type: "Point",
  coordinates: number[]
}

type PolygonGeometry = {
  type: "Polygon",
  coordinates: number[][][]
}


export default LocationStore