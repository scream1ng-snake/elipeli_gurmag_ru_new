import { makeAutoObservable } from "mobx";
import { Optional, Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import RootStore from "./root.store";
import { SavedAddress } from "./SavedAddresses";
import { AddOne, AllCampaignUser, DishDiscount, DishSetDiscount, PercentDiscount } from "./cart.store";
import { GeoJson } from "./location.store";

class UserStore {
  ID: Optional<string> = localStorage.getItem('myID') || null
  setID(id: string) { 
    this.ID = id
    localStorage.setItem('myID', id)
  }
  constructor(readonly root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }
  
  
  
  info: UserInfoState = {
    Phone: '',
    userName: '',
    UserCode: '',
    userBonuses: 0,
    percentDiscounts: [],
    dishDiscounts: [],
    allCampaign: [],
    dishSet: [],
    MinSum: 0,
    AddressArr: [],
    Address: '',
    addOne: []
  };
  setInfo(info: UserInfoState) {
    this.info = info;
  }

  get hasHotCampaign() {
    return this.info.allCampaign.filter(camp => camp.showbanner)
  }

  loadUserInfo = new Request(async (
    state,
    setState,
    orgId: number,
    userId: any
  )  => {
    setState('LOADING')
    const response: any = await http.get('/getUserInfo/' + userId + '/' + orgId)

    const {
      PercentDiscount,
      DishDiscount,
      AllDiscounts,
      SetDishDiscount,
    } = response;
    const Bonuses = response?.UserInfo?.Bonuses ?? 0;
    const NAME = response?.UserInfo?.NAME ?? '';
    /**  "1979064" numberstr */
    const UserCode = response?.UserInfo?.UserCode ?? '';
    const MinSum = response?.UserInfo?.MinSum ?? 0;
    const Address = response?.UserInfo?.Address ?? '';
    const AddressArr: SavedAddress[] = response?.UserInfo?.AddressArr ?? [];
    const addOne: AddOne[] = response?.AddOne ?? [];
    const COrg = response?.UserInfo?.COrg ?? 0;
    const Phone = response?.UserInfo?.Phone ?? '';
    const DeliveryArea = JSON.parse(response?.DeliveryArea?.[0].JSON ?? "{}") as GeoJson
    this.root.reception.Location.setJsonMap(DeliveryArea)
    

    const newInfo = {
      userName: NAME,
      userBonuses: Bonuses,
      percentDiscounts: PercentDiscount,
      dishDiscounts: DishDiscount,
      allCampaign: AllDiscounts,
      dishSet: SetDishDiscount,
      addOne,
      UserCode,
      Phone,
      MinSum,
      Address,
      AddressArr
    }

    // сохраняем состояние
    this.setInfo(newInfo)
    this.root.reception.Location.savedAdresses.setServerAddresses(AddressArr)

    // сохраняем текущую организацию 
    // если грузим первый раз
    if(orgId == 0 && COrg != 0) {
      this.root.reception.currentOrgID = COrg
      logger.log("получили и засетали новый OrgId " + COrg, "GET /loadUserInfo")
    };
    if(orgId == COrg) {
      this.root.reception.employees.loadCooks.run(COrg)
      this.root.reception.menu.loadMenu.run(COrg)
    }

    // пересчитываем корзину 
    this.root.cart.applyDiscountForCart(newInfo)
    setState('COMPLETED')
    return response?.UserInfo || null
  })

  
  /** история заказов */
  orderHistory: historyOrderItem[] = []

  /** попап для просмотра заказа в истории */
  watchHistoryOrderPopup = new Popup<historyOrderItem>();

  /** api истории заказов */
  loadOrdersHistory = new Request(async (
    state, setState, 
    userId: string
  ) => {
    setState('LOADING')
    try {
      const response: Undef<historyOrderItem[]> = await http.get('GetUserOrdersHistory/' + userId);
      if(response?.length) {
        this.orderHistory = [];
        response.forEach(order => 
          this.orderHistory.push(order)
        )
        setState('COMPLETED')
      }
    } catch (err) {
      logger.error(err, 'user-info-store')
      setState('FAILED')
    }
  })
}

export type UserInfoState = {
  Phone: string,
  userName: string,
  /** numberStr "182981928" */
  UserCode: string,
  /** кол-во каких-то бонусов */
  userBonuses: number, 
  /** это детали основных акций: сидка N процентов на cумму от A до B */
  percentDiscounts: PercentDiscount[],
  /** это детали основных акций: скидка на какое-то блюдо */
  dishDiscounts: DishDiscount[],
  /** это основыне акции */
  allCampaign: AllCampaignUser[],
  /** это детали основных акций: скидка на сет из блюд */
  dishSet: DishSetDiscount[],
  MinSum: number
  /** old */
  Address: string,
  /** сохраенные адреса */
  AddressArr: SavedAddress[]
  addOne: AddOne[]
}


export default UserStore




type historyOrderItem = {
  /** !number string "99328" */
  VCode: string,
  /** !number string "11676" */
  DocumentNumber: string,
  /** iso string "2023-09-06T00:00:00.000Z" */
  DocumentDate: string,
  /** iso string "1970-01-01T18:09:58.627Z" */
  DeliveryTime: string,
  StatusOrder: OrderStatuses,
  PaymentStatus: PaymentStatuses,
  /** "Рабкоров_20" */
  OrgName: string,
  OrgCode: number,
  OrderCost: number,
  Courses: historyOrderCouse[],
  /** "На вынос" или "С доставкой" */
  OrderType: string,
  FullAddress: null | string
}

type historyOrderCouse = {
  CourseCost: number,
  CourseQuantity: number,
  /** !!! number string "89089" */
  CourseCode: string,
  CourseName: string
}

type PaymentStatuses = 'Не оплачен' | 'Оплачен частично' | 'Оплачен'
type OrderStatuses = 'Создан' | 'В работе' | 'Сборка заказа' | 'В пути' | 'Оплачен' | 'Отменён'
