import { InputRef, Toast } from "antd-mobile";
import { makeAutoObservable, reaction } from "mobx";
import { Optional, Request, Undef } from "../features/helpers";
import { http } from "../features/http";
import { setItem } from "../features/local-storage";
import { logger } from "../features/logger";
import { CourseItem } from "./menu.store";
import RootStore from "./root.store";
import { UserInfoState } from "./user.store";
import Slots from "./slots.store";
import PaymentStore from "./payment.store";
import { MutableRefObject } from "react";
import Popup from "../features/modal";
import moment from "moment";

/** Блюдо в корзине как часть заказа */
export type CouseInCart = {
  couse: CourseItem;
  quantity: number;
  priceWithDiscount: number;
  campaign?: number | undefined;
}

export class CartStore {
  /** блюда в корзине */
  items: Array<CouseInCart> = []
  totalPrice = 0

  /** дата заказа */
  date = moment().add(15, 'minutes').toDate()

  setDate = (date: Date) => { this.date = date }
  /** диапазон времени для пикера */
  get availableTimeRange() {
    const isToday = moment(this.date).isSame(new Date(), 'day')
    const startDay = moment(this.date).hour(9).minute(30).toDate()
    const endDay = moment(this.date).hour(21).minute(30).toDate()
    if (isToday) {
      const through15min = moment()
        .add(15, 'minutes')
        .toDate()

      return { min: through15min, max: endDay }
    } else {
      return { min: startDay, max: endDay }
    }
  }

  private checkOrderTime = () => {
    const nowthrough15min = moment()
      .add(15, 'minutes')
      .toDate()
    
    const isPast = this.date <= nowthrough15min
    if (isPast) this.setDate(nowthrough15min)
  }

  /** примечание к заказу */
  note = ''
  setNote = (note: string) => { this.note = note }

  get isEmpty() { return !this.items.length }

  /** попуп с деталями заказа */
  detailPopup = new Popup()
  /** пикер с выбором даты */
  datePick = new Popup()
  /** пикер с выбором времени */
  timePick = new Popup()

  constructor(readonly root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    reaction(() => this.totalPrice, price => {
      if (price > 1000 && this.payment.method === 'CASH')
        this.payment.method = null
    })

    setInterval(this.checkOrderTime, 1000)
  }


  /** найденный промо */
  confirmedPromocode: Optional<string> = null

  /** просто состояние для инпута с промо */
  inputPromocode = ''
  setInputPromo = (
    str: string,
    ref: MutableRefObject<Optional<InputRef>>
  ) => {
    this.inputPromocode = str;

    const availablePromos = this.root.user.info.allCampaign
      .filter(ac => ac.promocode !== null)
      .map(ac => ac.promocode)

    if (availablePromos.includes(str)) {
      Toast.show("Промокод активирован")
      this.confirmedPromocode = str
      ref?.current?.blur()
    } else {
      this.confirmedPromocode = null
    }


    let { totalPrice, items, isEmpty } = this;
    const { info } = this.root.user;
    this.applyDiscount(
      { totalPrice, items, isEmpty },
      info.percentDiscounts,
      info.dishDiscounts,
      info.allCampaign,
      info.dishSet,
    )
  }


  clearCart() {
    this.items = [];
    this.totalPrice = 0;
    setItem('cartItems', [])
  }


  findItem(vcode: number) {
    return this.items.find(item => item.couse.VCode === vcode)
  }

  isInCart(course: CourseItem): boolean {
    return Boolean(this.items.find(item => item.couse.VCode === course.VCode))
  }

  addCourseToCart(couse: CourseItem) {
    let { totalPrice, items, isEmpty } = this;
    const { info } = this.root.user;
    let isCourseAdded: Undef<CouseInCart>;

    isCourseAdded = this.findItem(couse.VCode);

    if (isCourseAdded) {
      // если блюдо уже есть 
      // добавляем его
      isCourseAdded.quantity++;

      // оставляем его, но
      // в большем количестве
      items = items.map((item) =>
        item.couse.VCode === couse.VCode
          ? isCourseAdded as CouseInCart
          : item
      )
      this.applyDiscount(
        { totalPrice, items, isEmpty },
        info.percentDiscounts,
        info.dishDiscounts,
        info.allCampaign,
        info.dishSet,
      )
    } else {
      // если блюда нет
      // добавляем его
      const newItemInCart: CouseInCart = {
        couse,
        quantity: 1,
        priceWithDiscount: couse.Price
      }

      items = [...items, newItemInCart]
      this.applyDiscount(
        { totalPrice, items, isEmpty },
        info.percentDiscounts,
        info.dishDiscounts,
        info.allCampaign,
        info.dishSet,
      )
    }
  }

  removeFromCart(VCode: number) {
    let { totalPrice, items, isEmpty } = this;
    const { info } = this.root.user;

    let isCourseAdded: Undef<CouseInCart>;

    isCourseAdded = this.findItem(VCode);

    if (isCourseAdded) {
      if (isCourseAdded?.quantity > 1) {
        isCourseAdded.quantity--;

        items = items.map(item =>
          item.couse.VCode === VCode
            ? isCourseAdded as CouseInCart
            : item
        )


        this.applyDiscount(
          { totalPrice, items, isEmpty },
          info.percentDiscounts,
          info.dishDiscounts,
          info.allCampaign,
          info.dishSet,
        )
      } else {
        items = items.filter(item =>
          item.couse.VCode !== VCode
        )
        this.applyDiscount(
          { totalPrice, items, isEmpty },
          info.percentDiscounts,
          info.dishDiscounts,
          info.allCampaign,
          info.dishSet,
        )
      }
    }
  }

  /** пересчитать скидку */
  private applyDiscount(
    state: Pick<CartStore, 'items' | 'isEmpty' | 'totalPrice'>,
    percentDiscounts: PercentDiscount[],
    dishDiscounts: DishDiscount[],
    allCampaign: AllCampaignUser[],
    dishSet: DishSetDiscount[],
  ) {
    // проверяем промокды при каждом пересчитывании скидки
    const availablePromocodes = allCampaign
      .filter(ac => ac.promocode !== null)
      .map(ac => ac.promocode)

    if (availablePromocodes.includes(this.inputPromocode)) {
      this.confirmedPromocode = this.inputPromocode
    } else {
      this.confirmedPromocode = null
    }

    let new_state = { ...state }


    if (true) {
      let dishSets = dishSet;
      let dishsDiscounts = dishDiscounts;
      //массив сетов, из которых мы нашли данные
      let curDishSets: DishSetDiscountActive[] = [];
      //проверим все скидки, найдем наибольшую
      let maxPercentDiscount: PercentDiscount = { vcode: 0, MinSum: 0, MaxSum: 0, bonusRate: 0, discountPercent: 0 };
      percentDiscounts?.forEach(a => {
        if (maxPercentDiscount.vcode === 0) {
          maxPercentDiscount = a;
        } else if (maxPercentDiscount.discountPercent < a.discountPercent) {
          maxPercentDiscount = a;
        }
      })
      //идём по всем блюдам в корзине
      for (let i = 0; i < new_state.items.length; i++) {

        let courseItem = new_state.items[i];
        //если есть процентная скидка, сразу её ставим
        if (maxPercentDiscount !== null) {
          courseItem.campaign = maxPercentDiscount.vcode;
          courseItem.priceWithDiscount = courseItem.couse.Price * courseItem.quantity * (100 - maxPercentDiscount.discountPercent) / 100;
        } else {
          courseItem.priceWithDiscount = courseItem.couse.Price * courseItem.quantity;
        }
        //идём по всем сэтам и смотрим, сколько у нас наберётся элементов в сэте
        for (let j = 0; j < dishSets.length; j++) {
          let set = dishSets[j];
          //идём по всем блюдам сэта
          for (let k = 0; k < set.dishes.length; k++) {
            //если нашли блюдо из сэта, то увеличиваем счётчик сэта
            if (courseItem.couse.VCode === set.dishes[k].dish) {
              let curDishSetObj = curDishSets.find(a => a.vcode === set.vcode);
              if (curDishSetObj === undefined) {
                curDishSetObj = { ...set, countInCart: 0 };
                curDishSets.push(curDishSetObj);
              }
              curDishSetObj.countInCart += courseItem.quantity;

            }
          }
        }

        //идём по всем скидкам на позиции, смотрим что выгоднее, цена по акции или по общей скидки в процентах
        for (let j = 0; j < dishsDiscounts.length; j++) {
          let dishDiscount = dishsDiscounts[j];
          //нашли блюдо в акции
          if (
            courseItem.couse.VCode === dishDiscount.dish
            && (
              dishDiscount.promocode === null
              || dishDiscount.promocode === this.confirmedPromocode
            )
          ) {
            //если есть процентная скидка
            if (courseItem.quantity * dishDiscount.price < courseItem.priceWithDiscount) {
              courseItem.campaign = dishDiscount.vcode;
              // я не понимаю как оно работает 
              // но тут надо сделать так
              // если есть установленный прайс
              if (dishDiscount.price) {
                courseItem.priceWithDiscount = courseItem.quantity * dishDiscount.price;
              }
              // если нет прайса но есть скидочный процент
              // @ts-ignore
              if (dishDiscount.discountPercent) {
                // @ts-ignore
                courseItem.priceWithDiscount = (courseItem.couse.Price - (courseItem.couse.Price * dishDiscount.discountPercent / 100)) * courseItem.quantity;
              }
            }
          }
        }

      }

      for (let j = 0; j < curDishSets.length; j++) {
        if (
          curDishSets[j].countInCart === curDishSets[j].dishCount
          && (
            curDishSets[j].dishes[0].promocode === null
            || curDishSets[j].dishes[0].promocode === this.confirmedPromocode
          )
        ) {
          for (let i = 0; i < new_state.items.length; i++) {
            let courseItem = new_state.items[i];
            let dishInSet = curDishSets[j].dishes.find(a => a.dish === courseItem.couse.VCode);
            if (dishInSet !== undefined) {
              courseItem.campaign = curDishSets[j].vcode;
              // если есть установленный прайс
              if (dishInSet.price) {
                courseItem.priceWithDiscount = courseItem.quantity * dishInSet.price;
              }
              // если нет прайса но есть скидочный процент
              // @ts-ignore
              if (dishInSet.discountPercent) {
                // @ts-ignore
                courseItem.priceWithDiscount = courseItem.quantity * (courseItem.couse.Price - (courseItem.couse.Price * dishInSet.discountPercent / 100));
              }
            }
          }
        }
      }
    }


    this.items = new_state.items
    this.totalPrice = new_state.items.reduce((acc, cur) =>
      acc + cur.priceWithDiscount, 0
    )


    // корзину запоминаем 
    // только когда все загрузилось,
    // иначе запомним пустой массив 
    const { loadCourseReviews, loadMenu } = this.root.reception.menu;
    if (loadCourseReviews.state === 'COMPLETED' && loadMenu.state === 'COMPLETED') setItem('cartItems', state.items)
  }

  applyDiscountForCart(userInfo: UserInfoState) {
    const { totalPrice, items, isEmpty } = this;

    this.applyDiscount(
      { totalPrice, items, isEmpty },
      userInfo.percentDiscounts,
      userInfo.dishDiscounts,
      userInfo.allCampaign,
      userInfo.dishSet,
    )
  }


  /** апи оформления заказа */
  postOrder = new Request(async (
    state,
    setState,
    order: Order,
  ) => {
    try {
      setState('LOADING')
      let orgID = order.currentOrg

      const response: [historyOrderItem] = await http.post(
        this.payment.method !== 'CARD_ONLINE'
          ? '/NewOrderSlot'
          : '/NewOrderSlotPay',
        { ...order, currentOrg: orgID }
      )

      if (response?.[0]) {
        const course = response[0]

        this.root.user.orderHistory.push(course)
        if (this.payment.method === 'CARD_ONLINE') {
          await this.payment.payOrder.run(Number(course.VCode))
          await this.updateOrderInfo(Number(course.VCode))
        }
        logger.log('Заказ успешно оформлен', 'cart-store')

        setState('COMPLETED')
        this.clearCart()
      };
    } catch (e) {
      logger.log('Заказ блин не оформился', 'cart-store')
      setState('FAILED')
      throw e
    }
  })



  updateOrderInfo = async (orderId: number) => {
    /** {"PayStatus":"succeeded"} */
    type resultType = { PayStatus: string }
    const result: resultType = await http.post("/UpdateOrderInfo", { orderId })
    if (result?.PayStatus === 'succeeded') {
      const targetCourse = this.root.user.orderHistory.find(hi =>
        Number(hi.VCode) === orderId
      )
      if (targetCourse) targetCourse.PaymentStatus = 'Оплачен'

    }
  }






  payment = new PaymentStore(this)
  slots = new Slots(this)
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

interface DishSetDiscountActive extends DishSetDiscount {
  countInCart: number,
}

export type AllCampaignUser = {
  Name: string,
  Description: string,
  VCode: number,
  periodtype: string,
  isset: number,
  quantity: number,
  promocode: string
}

/** заказ */
type Order = {
  itemsInCart: Array<CouseInCart>,
  /** userid str - "187151411" */
  userId: string,
  /** current org number str - "115" */
  currentOrg: string,
  /** phone number str - "79273067412" */
  contactPhone: string,
  /** ISOdate str - "2023-08-24T07:55:07.983Z" */
  orderDate: string,

  fullAddress: string | null
  orderType: number | null
  promocode: string
}

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

