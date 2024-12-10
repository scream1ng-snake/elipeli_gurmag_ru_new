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
import { CITY_PREFIX, receptionCodes } from "./reception.store";
import Metrics from "../features/Metrics";

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

    const campaign = this.root.user.info.allCampaign
      .find(camp => camp.promocode === str)

    if (campaign) {
      if (campaign.isset) {
        const { dishSet: dishSets } = this.root.user.info
        const dishSet = dishSets.find(ds => ds.vcode === campaign.VCode)
        let count = 0
        dishSet?.dishes.forEach(dish => {
          const addedToCart = this.items.find(cic => cic.couse.VCode == dish.dish)
          if (addedToCart) {
            count = count + addedToCart.quantity
            if (count >= dishSet.dishCount) {
              Toast.show("Промокод активирован")
              this.confirmedPromocode = str
              ref?.current?.blur()
            }
          }
        })
      } else {
        Toast.show("Промокод активирован")
        this.confirmedPromocode = str
        ref?.current?.blur()
      }
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
    this.confirmedPromocode = null
    this.inputPromocode = ''
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
    let new_state = { itemsInCart: state.items };

    const campaign = this.root.user.info.allCampaign
      .find(camp => camp.promocode === this.inputPromocode)

    if (campaign) {
      if (campaign.isset) {
        const { dishSet: dishSets } = this.root.user.info
        const dishSet = dishSets.find(ds => ds.vcode === campaign.VCode)
        let count = 0
        dishSet?.dishes.forEach(dish => {
          const addedToCart = this.items.find(cic => cic.couse.VCode == dish.dish)
          if (addedToCart) {
            count = count + addedToCart.quantity
            if (count >= dishSet.dishCount) {
              Toast.show("Промокод активирован")
              this.confirmedPromocode = this.inputPromocode
            } else { this.confirmedPromocode = null }
          }
        })
      } else {
        Toast.show("Промокод активирован")
        this.confirmedPromocode = this.inputPromocode
      }
    } else {
      this.confirmedPromocode = null
    }

    let curDishSets: any = [];
    //проверим все скидки, найдем наибольшую
    let maxPercentDiscount = { vcode: 0, MinSum: 0, MaxSum: 0, bonusRate: 0, discountPercent: 0 };
    percentDiscounts.forEach(a => {
      if (maxPercentDiscount.vcode == 0 && (a.promocode == this.confirmedPromocode || a.promocode == null)) {
        maxPercentDiscount = a;
      } else if (maxPercentDiscount.discountPercent < a.discountPercent && (a.promocode == this.confirmedPromocode || a.promocode == null)) {
        maxPercentDiscount = a;
      }
    })
    //идём по всем блюдам в корзине
    for (let i = 0; i < new_state.itemsInCart.length; i++) {

      let courseItem = new_state.itemsInCart[i];
      if (courseItem.couse === undefined) courseItem.couse = courseItem.couse;
      courseItem.couse.priceWithDiscountOld = courseItem.couse.priceWithDiscount;
      courseItem.couse.priceWithDiscount = courseItem.couse.Price;
      //если есть процентная скидка, сразу её ставим
      if (maxPercentDiscount !== null) {
        courseItem.campaign = maxPercentDiscount.vcode;
        courseItem.priceWithDiscount = Number((courseItem.couse.Price * courseItem.quantity * (100 - maxPercentDiscount.discountPercent) / 100).toFixed(2));
        courseItem.couse.priceWithDiscount = (courseItem.couse.Price * (100 - maxPercentDiscount.discountPercent) / 100).toFixed(2);
      } else {
        courseItem.priceWithDiscount = courseItem.couse.Price * courseItem.quantity;
      }
      //идём по всем сэтам и смотрим, сколько у нас наберётся элементов в сэте
      for (let j = 0; j < dishSet.length; j++) {
        let set = dishSet[j];
        //идём по всем блюдам сэта
        for (let k = 0; k < set.dishes.length; k++) {
          //если нашли блюдо из сэта, то увеличиваем счётчик сэта
          if (courseItem.couse.VCode == set.dishes[k].dish) {
            let curDishSetObj = curDishSets.find((a: any) => a.vcode == set.vcode);
            if (curDishSetObj === undefined) {
              curDishSetObj = { ...set, countInCart: 0 };
              curDishSets.push(curDishSetObj);
            }
            curDishSetObj.countInCart += courseItem.quantity;

          }
        }
      }

      //идём по всем скидкам на позиции, смотрим что выгоднее, цена по акции или по общей скидки в процентах
      for (let j = 0; j < dishDiscounts.length; j++) {
        let dishDiscount = dishDiscounts[j];
        //нашли блюдо в акции
        if (courseItem.couse.VCode == dishDiscount.dish && (dishDiscount.promocode == this.confirmedPromocode || dishDiscount.promocode == null)) {
          //если есть процентная скидка
          if (dishDiscount.price !== null && (courseItem.quantity * dishDiscount.price < courseItem.priceWithDiscount)) {
            courseItem.campaign = dishDiscount.vcode;
            courseItem.priceWithDiscount = courseItem.quantity * dishDiscount.price;
            courseItem.couse.priceWithDiscount = dishDiscount.price;
          }
          if (dishDiscount.discountPercent !== null && (courseItem.couse.Price * (100 - dishDiscount.discountPercent) / 100) * courseItem.quantity < courseItem.priceWithDiscount) {
            courseItem.campaign = dishDiscount.vcode;
            courseItem.couse.priceWithDiscount = (courseItem.couse.Price * (100 - dishDiscount.discountPercent) / 100).toFixed(2);
            courseItem.priceWithDiscount = Number((courseItem.quantity * courseItem.couse.Price * (100 - dishDiscount.discountPercent) / 100).toFixed(2));
          }
        }
      }
      //new_state.itemsInCart[i] = courseItem;
    }

    for (let j = 0; j < curDishSets.length; j++) {
      if (curDishSets[j].countInCart == curDishSets[j].dishCount && (curDishSets[j].dishes[0].promocode == this.confirmedPromocode || curDishSets[j].dishes[0].promocode == null)) {
        for (let i = 0; i < new_state.itemsInCart.length; i++) {
          let courseItem = new_state.itemsInCart[i];
          let dishInSet = curDishSets[j].dishes.find((a: any) => a.dish == courseItem.couse.VCode);
          if (dishInSet !== undefined) {
            courseItem.campaign = curDishSets[j].vcode;
            courseItem.priceWithDiscount = courseItem.quantity * dishInSet.price;
            courseItem.couse.priceWithDiscount = dishInSet.price;
          }
        }
      }
    }


    this.items = new_state.itemsInCart
    this.totalPrice = new_state.itemsInCart.reduce((acc, cur) =>
      acc + cur.priceWithDiscount, 0
    )


    if(state.items.length) setItem('cartItems', state.items)
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

  /** проверка перед отправкой (остатки и валидации) */
  prePostOrder = async () => {
    this.postOrder.setState('LOADING')
    const { receptionType, currentOrgID, Location } = this.root.reception
    const { confirmedAddress, confirmedLocation } = Location
    switch (receptionType) {
      case 'delivery':
        if (!confirmedLocation?.lat) {
          if(confirmedAddress.road && confirmedAddress.house_number) {
            await Location.setCordinatesByAddress(confirmedAddress)
          } else {
            Toast.show('Укажите местоположение заного')
            this.root.reception.selectLocationPopup.open()
          }
          return
        }
        if (!confirmedLocation?.lon) {
          if(confirmedAddress.road && confirmedAddress.house_number) {
            await Location.setCordinatesByAddress(confirmedAddress)
          } else {
            Toast.show('Местоположение не указано, укажите его снова')
            this.root.reception.selectLocationPopup.open()
          }
          return
        }
        if (!confirmedAddress.road) {
          if(confirmedLocation.lat && confirmedLocation.lon) {
            await Location.setAddressByCoords(confirmedLocation)
          } else {
            Toast.show('Адрес не указан, укажите его снова')
            this.root.reception.selectLocationPopup.open()
          }
          return
        }
        if (!confirmedAddress.house_number) {
          if(confirmedLocation.lat && confirmedLocation.lon) {
            await Location.setAddressByCoords(confirmedLocation)
          } else {
            Toast.show('Адрес не указан, укажите его еще раз')
            this.root.reception.selectLocationPopup.open()
          }
          return
        }
        if (!this.slots.selectedSlot) {
          Toast.show('Слот не указан')
          return
        }
        break
      case 'pickup':
        if(!currentOrgID) {
          Toast.show('Точка самовывоза не выбрана')
          this.root.reception.selectLocationPopup.open()
          return
        }
        break
      case 'initial':
        Toast.show('Способ получения не выбран')
        this.root.reception.selectLocationPopup.open()
        return
    }
    /** если заказ нужен на сегодня */
    const isToday = moment(this.date).isSame(new Date(), 'day')

    /** недостающие блюды */
    const lostCourses = this.items
      .filter(({ couse, quantity }) => couse.NoResidue ? false : quantity > couse.EndingOcResidue)
      .map(cic => cic.couse)

    if (isToday && lostCourses.length) {
      this.actionSheet.open()
    } else {
      const { user, reception } = this.root
      if (user.ID) {
        await this.postOrder.run({
          userId: user.ID,
          contactPhone: user.info.Phone,
          itemsInCart: this.items,
          currentOrg: reception.OrgForMenu.toString(),
          orderDate: this.date.toISOString(),
          fullAddress: CITY_PREFIX + confirmedAddress.road + confirmedAddress.house_number,
          orderType: receptionCodes[reception.receptionType],
          promocode: this.confirmedPromocode,

          activeSlot: this.slots.selectedSlot
            ? Number(this.slots.selectedSlot.VCode)
            : undefined,
          street: confirmedAddress.road,
          house: confirmedAddress.house_number,
          apartment: confirmedAddress.apartment,
          description: this.note,
          entrance: confirmedAddress.entrance,
          storey: confirmedAddress.storey,
          doorCode: confirmedAddress.doorCode,
          addrComment: confirmedAddress.addrComment,
          incorrectAddr: confirmedAddress.incorrectAddr,
          lat: confirmedLocation?.lat,
          lon: confirmedLocation?.lon
        })
        this.detailPopup.close()
        this.congratilations.open()
      } else {
        Toast.show('Вы не авторизовались')
      }
    }
  }

  actionSheet = new Popup()
  congratilations = new Popup()

  /** апи оформления заказа */
  postOrder = new Request(async (
    state,
    setState,
    order: Order,
  ) => {
    try {
      logger.log(JSON.stringify(order), 'order')
      setState('LOADING')

      const response: [historyOrderItem] = await http.post(
        this.payment.method !== 'CARD_ONLINE'
          ? '/NewOrderSlot'
          : '/NewOrderSlotPay',
        order
      )

      if (response?.[0]) {
        const course = response[0]
        logger.log(JSON.stringify(course), 'post-order-response')

        this.root.user.orderHistory.push(course)
        if (this.payment.method === 'CARD_ONLINE') {
          await this.payment.payOrder.run(Number(course.VCode))
          await this.updateOrderInfo(Number(course.VCode))
        }
        logger.log('Заказ успешно оформлен', 'cart-store')

        setState('COMPLETED')
        this.clearCart()
        Metrics.buyYandex(course)
        Metrics.buy(this.totalPrice, order.itemsInCart.map(i => i.couse.VCode))
      };
    } catch (e) {
      logger.log('Заказ блин не оформился', 'cart-store')
      setState('FAILED')
      logger.error(e, 'cart')
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



export type PercentDiscount = {
  vcode: number,
  MinSum: number,
  MaxSum: number,
  bonusRate: number,
  discountPercent: number,
  promocode: string
}

export type DishDiscount = {
  discountPercent: number,
  vcode: number,
  isset: number,
  quantity: number,
  promocode: string,
  dish: number,
  price: number,
}

export type DishSetDiscount = {
  vcode: number,
  dishes: DishDiscount[],
  dishCount: number,
  promocode: string
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
  promocode: string,
  image: string,
  compresimage: string,
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
  orderType?: number
  promocode: string | null

  activeSlot?: number,
  street: string,
  house: string,
  /* квартира */
  apartment?: string,
  /* Комментарий к заказу */
  description: string,
  /* Корпус/литер */
  frame?: string,
  /* Подъезд */
  entrance?: string,
  /* Этаж */
  storey?: string,
  /** Код на двери */
  doorCode?: string,
  /** Комментарий к адресу */
  addrComment?: string,
  incorrectAddr?: boolean | undefined,
  lat: number | undefined
  lon: number | undefined
}

export type historyOrderItem = {
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

