import { makeAutoObservable } from "mobx";
import { Request } from "../features/helpers";
import { http } from "../features/http";
import { logger } from "../features/logger";
import RootStore from "./root.store";

class UserStore {
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
}

type UserInfoState = {
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