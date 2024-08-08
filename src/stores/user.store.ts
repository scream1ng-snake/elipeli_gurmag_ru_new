import { flow, makeAutoObservable } from "mobx";
import { LoadStatesType, Optional, Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import RootStore from "./root.store";

class UserStore {
  ID: Optional<string> = null
  setID(id: string) { this.ID = id }
  constructor(readonly root: RootStore) {
    makeAutoObservable(this)
  }
  
  
  userState: UserInfoState = {
    Phone: '',
    userName: '',
    UserCode: '',
    userBonuses: 0,
    percentDiscounts: [],
    dishDiscounts: [],
    allCampaign: [],
    dishSet: []
  };
  setUserState(state: UserInfoState) {
    this.userState = state;
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
    const COrg = response?.UserInfo?.COrg ?? 0;
    const Phone = response?.UserInfo?.Phone ?? '';
    

    const newState = {
      userName: NAME,
      userBonuses: Bonuses,
      percentDiscounts: PercentDiscount,
      dishDiscounts: DishDiscount,
      allCampaign: AllDiscounts,
      dishSet: SetDishDiscount,
      UserCode,
      Phone
    }

    // сохраняем состояние
    this.setUserState(newState)

    // сохраняем текущую организацию 
    // если грузим первый раз
    if(orgId === 0 && COrg !== 0) {
      this.root.reception.currentOrgID = COrg
      logger.log("получили и засетали новый OrgId " + COrg, "GET /loadUserInfo")
    };

    // пересчитываем корзину 
    // this.rootStore.cartStore.applyDiscountForCart(newState) todo
    setState('COMPLETED')
    return response?.UserInfo || null
  })

  
  /** история заказов */
  orderHistory: historyOrderItem[] = []
  /** просматриваемый закза */
  selectedHistoryOrder: Optional<historyOrderItem> = null

  watchHistoryOrderModal = new Popup();

  watchHistoryOrder(selectedHistoryOrder: historyOrderItem) {
    this.selectedHistoryOrder = selectedHistoryOrder;
    this.watchHistoryOrderModal.open();
  }
  closeHistoryOrder() {
    this.selectedHistoryOrder = null;
    this.watchHistoryOrderModal.close();
  }

  orderHistoryState: LoadStatesType = 'INITIAL'

  loadOrdersHistory = flow(function* (
    this: UserStore, 
    userId: string
  ) {
    this.orderHistoryState = 'LOADING';
    try {
      const response: Undef<historyOrderItem[]> = yield http.get('GetUserOrdersHistory/' + userId);
      if(response?.length) {
        this.orderHistory = [];
        response.forEach(order => 
          this.orderHistory.push(order)
        )
        this.orderHistoryState = 'COMPLETED';
      }
    } catch (err) {
      logger.error(err, 'user-info-store')
      this.orderHistoryState = 'FAILED';
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
}


type PercentDiscount = {
  vcode: number,
  MinSum: number,
  MaxSum: number,
  bonusRate: number,
  discountPercent: number,
}

type DishDiscount = {
  discountPercent: number,
  vcode: number,
  isset: number,
  quantity: number,
  promocode: string,
  dish: number,
  price: number,
}

type DishSetDiscount = {
  vcode: number,
  dishes: DishDiscount[],
  dishCount: number,
}


type AllCampaignUser = {
  Name: string,
  Description: string,
  VCode: number,
  periodtype: string,
  isset: number,
  quantity: number,
  promocode: string
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
