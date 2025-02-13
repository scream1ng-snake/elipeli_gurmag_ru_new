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
import SuggestitionStore from "./suggestition.store";
import LocationStore from "./location.store";
import config from "../features/config";

export const apikey = 'b76c1fb9-de2c-4f5a-8621-46681c107466'
export const CITY_PREFIX = 'Уфа, '
export class ReceptionStore {
  root: RootStore;
  Location = new LocationStore(this)

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
      !this.Location.confirmedAddress.road && this.receptionType === 'delivery' && userLoaded,
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
  selectLocationPopup2 = new Popup()

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

  

  
  
  

  
  /** все организации */
  organizations: Array<Organization> = [];
  setOrgs = (o: Organization[]) => { this.organizations = o }

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
    } finally {
      if(config.isDev) this.organizations.push({ Id:143, isCK: false, Name:'Тестовая точка' })
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
  orgsCoords = [
    { Id: 2, lat: 54.70186, lon: 56.002691 },
    { Id: 115, lat: 54.770162, lon: 56.059599 },
    { Id: 140, lat: 54.77791, lon: 56.03653 },
    { Id: 141, lat: 54.723413, lon: 55.928068 },
    { Id: 144, lat: 54.781597, lon: 56.131958 },
    { Id: 147, lat: 54.810361, lon: 56.099008  }
  ]

  /**
   * найти ближ точку для доставки и расстояние до нее
   * @param targetlat
   * @param targetlon
   */
  getNearestDeliveryOrg = (targetlat: number, targetlon: number) => {
    let resultOrganization
    let minDistance
    let deliveryPoints: Organization[] = _.clone(this.root.reception.organizations);
    for (const org of deliveryPoints) {
      // для каждой организации захардкодил кординаты 
      // каждый раз их узнавать заного смысла нет
      let knowCoords = this.orgsCoords.find(({ Id }) => Id === org.Id)
      if(!knowCoords) continue
      const { lon, lat } = knowCoords

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
    return { nearestOrg: resultOrganization, distance: minDistance }
  }

  selectOrgPopup = new Popup()

  employees = new EmployeesStore(this)
  menu = new MenuStore(this)
  suggestitions = new SuggestitionStore(this)
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



