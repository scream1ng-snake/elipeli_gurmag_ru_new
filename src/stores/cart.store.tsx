import { InputRef, Toast } from "antd-mobile";
import { makeAutoObservable, reaction } from "mobx";
import { deepCopy, Optional, range, Request } from "../features/helpers";
import { http } from "../features/http";
import { setItem } from "../features/local-storage";
import { logger } from "../features/logger";
import { CourseItem } from "./menu.store";
import RootStore, { AppValues } from "./root.store";
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
  presents: Array<CouseInCart> = []
  totalPrice = 0

  /** дата заказа */
  date = moment().add(15, 'minutes').toDate()

  setDate = (date: Date) => { this.date = date }
  /** диапазон времени для пикера */
  get availableTimeRange() {
    const isToday = moment(this.date).isSame(new Date(), 'day')
    const startDay = moment(this.date).hour(9).minute(30).toDate()
    const endDay = moment(this.date).hour(21).minute(30).toDate()
    const { fullCookTime, packageTime } = this
    if (isToday) {
      const coursesReadyTime = moment()
        .add(fullCookTime + packageTime, 'minutes')
        .toDate()

      return { min: coursesReadyTime, max: endDay }
    } else {
      return { min: startDay, max: endDay }
    }
  }

  private checkOrderTime = () => {
    const { fullCookTime, packageTime } = this

    const coursesReadyTime = moment()
      .add(fullCookTime + packageTime, 'minutes')
      .toDate()

    const isPast = this.date <= coursesReadyTime
    if (isPast) this.setDate(coursesReadyTime)
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

  cart = new Popup()
  constructor(readonly root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    
    reaction(() => this.totalPrice, price => {
      // считаем время приготовления в корзине
      this.countFullCookingTime()
      // в зависимоти от тотал прайса не позволяем использовать наличку
      if (price > 1000 && this.payment.method === 'CASH')
        this.payment.method = null
    })

    // проверяем рабочее время чтобы не заказать в прошлое
    setInterval(this.checkOrderTime, 1000)

    // при изменении даты сразу подбираем слоты
    reaction(() => this.date, (cur, prev) => {
      const today = new Date()
      const curToday = moment(cur).isSame(today, 'day')
      const prevToday = moment(prev).isSame(today, 'day')
      if (curToday !== prevToday) {
        this.slots.checkAvailableSlot()
        this.slots.selectedSlot = null
      }
    })

    // при каждом изменении тотал прайса применяем или убираем подарки
    reaction(() => this.totalPrice, (price, prevPrice) => {
      // console.log(`------- новый тотал прайс ${price} -------`)
      // console.log(`------- стейт в начале`)
      // console.log(`------- корзина: ${this.items.length}`)
      // this.items.map(i => console.log(`------- ${i.quantity} шт ${i.couse.Name} за ${i.priceWithDiscount} `))
      // console.log(`------- подарки: ${this.presents.length}`)
      // this.presents.map(i => console.log(`------- ${i.quantity} шт ${i.couse.Name} за ${i.priceWithDiscount} `))
      const { user, reception } = this.root
      const PresentAction = user.info.allCampaign.filter(c => c.PresentAction)
      PresentAction.forEach(p => {
        const detail = user.info.dishSet
          .find(d => d.vcode === p.VCode)

        if (detail) {
          // если тотал прайс входит в сумму подарка
          if (p.MaxSum > price && price >= p.MinSum) {

            // console.log(`   прайс ${price} входит в диапазон от ${p.MinSum} до ${p.MaxSum} -------`)
            detail.dishes.forEach(d => {
              const couseInMenu = reception.menu.getDishByID(d.dish)
              if (couseInMenu) {
                // console.log(`   значит надо добавить подарок ${couseInMenu.Name}`)
                const presentExists = this.presents.find(i => i.couse.VCode === d.dish)
                if (presentExists) {
                  if (presentExists?.quantity < detail.dishCount) {
                    // console.log(`   добавляем`)
                    this.addPresentToCart(couseInMenu)
                  }
                } else {
                  // console.log(`   добавляемм`)
                  this.addPresentToCart(couseInMenu)
                }
              }
            })
          }
          // если тотал прайс больше суммы этого подарка
          if (price >= p.MaxSum) {
            detail.dishes.forEach(d => {
              const presentExists = this.presents.find(i => i.couse.VCode == d.dish)
              if (presentExists) {
                new Array(presentExists.quantity).fill(null).forEach(() => {
                  this.removePresentFromCart(presentExists.couse.VCode)
                })
              }
            })
          }
          // если тотал прайс меньше суммы этого подарка
          if (price < p.MinSum) {
            detail.dishes.forEach(d => {
              const presentExists = this.presents.find(i => i.couse.VCode === d.dish)
              if (presentExists) {
                new Array(presentExists.quantity).fill(null).forEach(() => {
                  this.removePresentFromCart(presentExists.couse.VCode)
                })
              }
            })
          }
        }
      })
      // console.log(`<<<<<<< тотал прайс ${price} <<<<<<<`)
      // console.log(`<<<<<<< стейт в конце`)
      // console.log(`<<<<<<< корзина: ${this.items.length}`)
      // this.items.map(i => console.log(`<<<<<<< ${i.quantity} шт ${i.couse.Name} за ${i.priceWithDiscount} `))
      // console.log(`<<<<<<< подарки: ${this.presents.length}`)

    })
  }

  private countFullCookingTime() {
    let sumAllComplexity = 0
    let minCookingTimeReal: Optional<number> = null
    this.items.forEach(({ quantity, couse }) => {
      range(quantity).map(() => {
        sumAllComplexity += couse.Complexity
      })
      if(!minCookingTimeReal) 
        minCookingTimeReal = couse.CookingTimeReal
      
      if(couse.CookingTimeReal < minCookingTimeReal)
        minCookingTimeReal = couse.CookingTimeReal
    })
    this.setFullCookTime(sumAllComplexity + (minCookingTimeReal ?? 0))

  }

  /** предположительное время приготовления корзины */
  fullCookTime = 0
  setFullCookTime(sum: number) { this.fullCookTime = sum }
  /** время комплектования константа */
  packageTime = 15
  /** время доставки константа */
  deliveryTime = 15

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


    let { totalPrice, items, isEmpty, presents } = this;
    const { info } = this.root.user;
    this.applyDiscount(
      { totalPrice, items, isEmpty, presents },
      info.percentDiscounts,
      info.dishDiscounts,
      info.allCampaign,
      info.dishSet,
      info.addOne
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

  addPresentToCart(couse: CourseItem) {
    let { totalPrice, items, isEmpty, presents } = this;
    const { info } = this.root.user;

    let presentExists = presents.find(c => c.couse.VCode === couse.VCode)
    if (presentExists) {
      presentExists.quantity++

      presents = presents.map((item) =>
        item.couse.VCode === couse.VCode
          ? presentExists as CouseInCart
          : item
      )
      this.applyDiscount(
        { totalPrice, items, isEmpty, presents },
        info.percentDiscounts,
        info.dishDiscounts,
        info.allCampaign,
        info.dishSet,
        info.addOne
      )
    } else {
      const newPresent: CouseInCart = {
        couse,
        quantity: 1,
        priceWithDiscount: 0,
      }

      presents = [...presents, newPresent]
      this.applyDiscount(
        { totalPrice, items, isEmpty, presents },
        info.percentDiscounts,
        info.dishDiscounts,
        info.allCampaign,
        info.dishSet,
        info.addOne
      )
    }
  }
  addCourseToCart(couse: CourseItem) {
    let { totalPrice, items, isEmpty, presents } = this;
    const { info } = this.root.user;

    let couseExists = items.find(c => c.couse.VCode === couse.VCode)
    if (couseExists) {
      couseExists.quantity++

      items = items.map((item) =>
        item.couse.VCode === couse.VCode
          ? couseExists as CouseInCart
          : item
      )
      this.applyDiscount(
        { totalPrice, items, isEmpty, presents },
        info.percentDiscounts,
        info.dishDiscounts,
        info.allCampaign,
        info.dishSet,
        info.addOne
      )
    } else {
      const newCouseInCart: CouseInCart = {
        couse,
        quantity: 1,
        priceWithDiscount: couse.Price,
      }

      items = [...items, newCouseInCart]
      this.applyDiscount(
        { totalPrice, items, isEmpty, presents },
        info.percentDiscounts,
        info.dishDiscounts,
        info.allCampaign,
        info.dishSet,
        info.addOne
      )
    }
  }

  removePresentFromCart(VCode: number) {
    let { totalPrice, items, isEmpty, presents } = this;
    const { info } = this.root.user;

    let presentExists = presents.find(c => c.couse.VCode === VCode)
    if (presentExists) {
      if (presentExists.quantity > 1) {
        presentExists.quantity--

        presents = presents.map(item =>
          item.couse.VCode === VCode
            ? presentExists as CouseInCart
            : item
        )


        this.applyDiscount(
          { totalPrice, items, isEmpty, presents },
          info.percentDiscounts,
          info.dishDiscounts,
          info.allCampaign,
          info.dishSet,
          info.addOne
        )
      } else {
        presents = presents.filter(item =>
          item.couse.VCode !== VCode
        )
        this.applyDiscount(
          { totalPrice, items, isEmpty, presents },
          info.percentDiscounts,
          info.dishDiscounts,
          info.allCampaign,
          info.dishSet,
          info.addOne
        )
      }
    }
  }
  removeFromCart(VCode: number) {
    let { totalPrice, items, isEmpty, presents } = this;
    const { info } = this.root.user;

    let couseExists = items.find(c => c.couse.VCode === VCode)

    if (couseExists) {
      if (couseExists.quantity > 1) {
        couseExists.quantity--

        items = items.map(item =>
          item.couse.VCode === VCode
            ? couseExists as CouseInCart
            : item
        )


        this.applyDiscount(
          { totalPrice, items, isEmpty, presents },
          info.percentDiscounts,
          info.dishDiscounts,
          info.allCampaign,
          info.dishSet,
          info.addOne
        )
      } else {
        items = items.filter(item =>
          item.couse.VCode !== VCode
        )
        this.applyDiscount(
          { totalPrice, items, isEmpty, presents },
          info.percentDiscounts,
          info.dishDiscounts,
          info.allCampaign,
          info.dishSet,
          info.addOne
        )
      }
    }
  }

  /** пересчитать скидку */
  private applyDiscount(
    state: Pick<CartStore, 'items' | 'isEmpty' | 'totalPrice' | 'presents'>,
    PercentDiscounts: PercentDiscount[],
    DishDiscounts: DishDiscount[],
    AllCampaign: AllCampaignUser[],
    DishSet: DishSetDiscount[],
    addone: AddOne[],
  ) {
    let new_state = {
      itemsInCart: deepCopy(state.items),
      presentInCart: deepCopy(state.presents)
    }
    //20191218 считаем общую сумму без скидок, убираем лишнией акции на подарок
    let CourseAllSum = 0;
    new_state.itemsInCart.forEach(a => CourseAllSum += a.couse.Price * a.quantity);

    const { receptionType } = this.root.reception

    let percentDiscounts: PercentDiscount[] = []
    let dishDiscounts: DishDiscount[] = []
    let allCampaign: AllCampaignUser[] = []
    let dishSet: DishSetDiscount[] = []
    let addOne: AddOne[] = []
    if (receptionType === 'delivery') {
      percentDiscounts = PercentDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishDiscounts = DishDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      allCampaign = AllCampaign.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishSet = DishSet.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      addOne = addone.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
    }

    if (receptionType === 'pickup') {
      percentDiscounts = PercentDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishDiscounts = DishDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      allCampaign = AllCampaign.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishSet = DishSet.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      addOne = addone.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
    }
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
            } else {
              this.confirmedPromocode = null
            }
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
      if (maxPercentDiscount.vcode == 0) {
        maxPercentDiscount = a;
      } else if (maxPercentDiscount.discountPercent < a.discountPercent) {
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


    //#endregion
    //#region обработка подарков
    curDishSets = [];
    let CourseAllSumWithDisount = 0;
    new_state.itemsInCart.forEach(a => CourseAllSumWithDisount += a.couse.priceWithDiscount * a.quantity);

    if (receptionType === 'delivery') {
      percentDiscounts = PercentDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishDiscounts = DishDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      allCampaign = AllCampaign.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishSet = DishSet.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
    }

    if (receptionType === 'pickup') {
      percentDiscounts = PercentDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishDiscounts = DishDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      allCampaign = AllCampaign.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishSet = DishSet.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
    }


    for (let i = 0; new_state.presentInCart !== undefined && new_state.presentInCart !== null && i < new_state.presentInCart.length; i++) {

      let courseItem = new_state.presentInCart[i];
      if (courseItem.couse === undefined) courseItem.couse = courseItem.couse;
      courseItem.couse.priceWithDiscountOld = courseItem.couse.priceWithDiscount;
      courseItem.couse.priceWithDiscount = courseItem.couse.Price;

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

    }

    for (let j = 0; j < curDishSets.length; j++) {
      if (curDishSets[j].countInCart == curDishSets[j].dishCount && (curDishSets[j].dishes[0].promocode == this.confirmedPromocode || curDishSets[j].dishes[0].promocode == null)) {
        for (let i = 0; i < new_state.presentInCart.length; i++) {
          let courseItem = new_state.presentInCart[i];
          let dishInSet = curDishSets[j].dishes.find((a: any) => a.dish == courseItem.couse.VCode);
          if (dishInSet !== undefined) {
            courseItem.campaign = curDishSets[j].vcode;
            courseItem.priceWithDiscount = courseItem.quantity * dishInSet.price;
            courseItem.couse.priceWithDiscount = dishInSet.price;
          }
        }
      }
    }

    // for (let i = 0; new_state.presentInCart !== undefined && new_state.presentInCart !== null && i < new_state.presentInCart.length; i++) {
    //   new_state.itemsInCart.push(new_state.presentInCart[i]);
    // }

    //#endregion

    //#region обработка акций +1
    let curDishSetsAddOne: any = [];
    //идём по всем блюдам в корзине
    for (let i = 0; i < new_state.itemsInCart.length; i++) {

      let courseItem = new_state.itemsInCart[i];
      //courseItem.course.priceWithDiscountOld = courseItem.course.priceWithDiscount;
      //courseItem.course.priceWithDiscount = courseItem.course.Price;
      //если есть процентная скидка, сразу её ставим

      //идём по всем сэтам и смотрим, сколько у нас наберётся элементов в сэте
      for (let j = 0; j < addOne.length; j++) {
        
        let set = addOne[j];
        //идём по всем блюдам сэта
        for (let k = 0; k < set.dishes.length; k++) {
          //если нашли блюдо из сэта, то увеличиваем счётчик сэта
          if (courseItem.couse.VCode == Number(set.dishes[k].dish)/* && set.PresentAction == courseItem.presentfalse*/) {
            let curDishSetObj = curDishSetsAddOne.find((a: any) => a.vcode == set.vcode);
            if (curDishSetObj === undefined) {
              curDishSetObj = { ...set, countInCart: 0 };
              curDishSetsAddOne.push(curDishSetObj);
            }
            curDishSetObj.countInCart += courseItem.quantity;

          }
        }
      }

      //new_state.itemsInCart[i] = courseItem;
    }

    //проходим по всем сетам +1
    for (let j = 0; j < curDishSetsAddOne.length; j++) {
      if (curDishSetsAddOne[j].countInCart >= curDishSetsAddOne[j].dishCount && (curDishSetsAddOne[j].dishes[0].promocode == this.confirmedPromocode || curDishSetsAddOne[j].dishes[0].promocode == null)) {
        let minAddOnePrice = Number.MAX_VALUE;
        let pos = -1;
        //находим блюдо из сета +1 с наименьшей ценой
        for (let i = 0; i < new_state.itemsInCart.length; i++) {
          let courseItem = new_state.itemsInCart[i];
          for (let k = 0; k < curDishSetsAddOne[j].dishes.length; k++) {
            if (courseItem.couse.VCode == curDishSetsAddOne[j].dishes[k].dish) {
              if (minAddOnePrice > courseItem.couse.Price) {
                minAddOnePrice = courseItem.couse.Price;
                pos = i;
              }
            }
          }
        }




        if (pos >= 0) {
          //первый этап, находим все позиции, которые относятся к акции +1 и ставим им цену как в меню
          for (let i = 0; i < new_state.itemsInCart.length; i++) {
            let courseItem = new_state.itemsInCart[i];
            for (let k = 0; k < curDishSetsAddOne[j].dishes.length; k++) {
              if (courseItem.couse.VCode == curDishSetsAddOne[j].dishes[k].dish) {
                courseItem.campaign = curDishSetsAddOne[j].vcode;
                courseItem.priceWithDiscount = courseItem.quantity * courseItem.couse.Price;
                courseItem.couse.priceWithDiscount = courseItem.couse.Price;
              }
            }
          }
          //теперь нужно найти позицию с наименьшей ценой и установить в нём +1
          let courseItem = new_state.itemsInCart[pos];
          if (courseItem.quantity > 1) {
            courseItem.priceWithDiscount = (courseItem.quantity - 1) * courseItem.couse.Price + 0.01;
            courseItem.couse.priceWithDiscount = Math.round((courseItem.couse.Price * (courseItem.quantity - 1) / courseItem.quantity) * 100) / 100;
          } else {
            courseItem.priceWithDiscount = 0.01;
            courseItem.couse.priceWithDiscount = 0.01;
          }


        }


      }
    }
    //#endregion

    for (let i = 0; i < new_state.itemsInCart.length; i++) {

      let courseItem = new_state.itemsInCart[i];
      //если есть процентная скидка, сразу её ставим
      courseItem.priceWithDiscount = courseItem.couse.priceWithDiscount * courseItem.quantity;
    }

    this.items = new_state.itemsInCart
    this.presents = new_state.presentInCart
    this.totalPrice = new_state.itemsInCart.reduce((acc, cur) =>
      acc + cur.priceWithDiscount, 0
    )


    if (this.root.reception.menu.loadMenu.state === 'COMPLETED' && this.root.user.loadUserInfo.state === 'COMPLETED') {
      setItem('cartItems', state.items)
    }
  }

  
  countDiscountForCouses(item: CourseItem) {
    const state = {
      items: [{
        couse: item,
        quantity: 1,
        priceWithDiscount: item.Price,
      } as CouseInCart],
      presents: [] as CouseInCart[],
    }
    const {
      percentDiscounts: PercentDiscounts,
      dishDiscounts: DishDiscounts,
      allCampaign: AllCampaign,
      dishSet: DishSet,
      addOne: addone
    } = this.root.user.info
    let new_state = {
      itemsInCart: deepCopy(state.items),
      presentInCart: deepCopy(state.presents)
    }
    //20191218 считаем общую сумму без скидок, убираем лишнией акции на подарок
    let CourseAllSum = 0;
    new_state.itemsInCart.forEach(a => CourseAllSum += a.couse.Price * a.quantity);

    const { receptionType } = this.root.reception

    let percentDiscounts: PercentDiscount[] = []
    let dishDiscounts: DishDiscount[] = []
    let allCampaign: AllCampaignUser[] = []
    let dishSet: DishSetDiscount[] = []
    let addOne: AddOne[] = []
    if (receptionType === 'delivery') {
      percentDiscounts = PercentDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishDiscounts = DishDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      allCampaign = AllCampaign.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishSet = DishSet.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      addOne = addone.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
    }

    if (receptionType === 'pickup') {
      percentDiscounts = PercentDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishDiscounts = DishDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      allCampaign = AllCampaign.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      dishSet = DishSet.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
      addOne = addone.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSum && a.MinSum <= CourseAllSum && a.PresentAction == false);
    }


    let curDishSets: any = [];
    //проверим все скидки, найдем наибольшую
    let maxPercentDiscount = { vcode: 0, MinSum: 0, MaxSum: 0, bonusRate: 0, discountPercent: 0 };
    percentDiscounts.forEach(a => {
      if (maxPercentDiscount.vcode == 0) {
        maxPercentDiscount = a;
      } else if (maxPercentDiscount.discountPercent < a.discountPercent) {
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


    //#endregion
    //#region обработка подарков
    curDishSets = [];
    let CourseAllSumWithDisount = 0;
    new_state.itemsInCart.forEach(a => CourseAllSumWithDisount += a.couse.priceWithDiscount * a.quantity);

    if (receptionType === 'delivery') {
      percentDiscounts = PercentDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishDiscounts = DishDiscounts.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      allCampaign = AllCampaign.filter(a => a.Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishSet = DishSet.filter(a => a.dishes[0].Delivery == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
    }

    if (receptionType === 'pickup') {
      percentDiscounts = PercentDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishDiscounts = DishDiscounts.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      allCampaign = AllCampaign.filter(a => a.TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
      dishSet = DishSet.filter(a => a.dishes[0].TakeOut == 1 && a.MaxSum > CourseAllSumWithDisount && a.MinSum <= CourseAllSumWithDisount && a.PresentAction == true);
    }


    for (let i = 0; new_state.presentInCart !== undefined && new_state.presentInCart !== null && i < new_state.presentInCart.length; i++) {

      let courseItem = new_state.presentInCart[i];
      if (courseItem.couse === undefined) courseItem.couse = courseItem.couse;
      courseItem.couse.priceWithDiscountOld = courseItem.couse.priceWithDiscount;
      courseItem.couse.priceWithDiscount = courseItem.couse.Price;

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

    }

    for (let j = 0; j < curDishSets.length; j++) {
      if (curDishSets[j].countInCart == curDishSets[j].dishCount && (curDishSets[j].dishes[0].promocode == this.confirmedPromocode || curDishSets[j].dishes[0].promocode == null)) {
        for (let i = 0; i < new_state.presentInCart.length; i++) {
          let courseItem = new_state.presentInCart[i];
          let dishInSet = curDishSets[j].dishes.find((a: any) => a.dish == courseItem.couse.VCode);
          if (dishInSet !== undefined) {
            courseItem.campaign = curDishSets[j].vcode;
            courseItem.priceWithDiscount = courseItem.quantity * dishInSet.price;
            courseItem.couse.priceWithDiscount = dishInSet.price;
          }
        }
      }
    }

    // for (let i = 0; new_state.presentInCart !== undefined && new_state.presentInCart !== null && i < new_state.presentInCart.length; i++) {
    //   new_state.itemsInCart.push(new_state.presentInCart[i]);
    // }

    //#endregion

    //#region обработка акций +1
    let curDishSetsAddOne: any = [];
    //идём по всем блюдам в корзине
    for (let i = 0; i < new_state.itemsInCart.length; i++) {

      let courseItem = new_state.itemsInCart[i];
      //courseItem.course.priceWithDiscountOld = courseItem.course.priceWithDiscount;
      //courseItem.course.priceWithDiscount = courseItem.course.Price;
      //если есть процентная скидка, сразу её ставим

      //идём по всем сэтам и смотрим, сколько у нас наберётся элементов в сэте
      for (let j = 0; j < addOne.length; j++) {
        
        let set = addOne[j];
        //идём по всем блюдам сэта
        for (let k = 0; k < set.dishes.length; k++) {
          //если нашли блюдо из сэта, то увеличиваем счётчик сэта
          if (courseItem.couse.VCode == Number(set.dishes[k].dish)/* && set.PresentAction == courseItem.presentfalse*/) {
            let curDishSetObj = curDishSetsAddOne.find((a: any) => a.vcode == set.vcode);
            if (curDishSetObj === undefined) {
              curDishSetObj = { ...set, countInCart: 0 };
              curDishSetsAddOne.push(curDishSetObj);
            }
            curDishSetObj.countInCart += courseItem.quantity;

          }
        }
      }

      //new_state.itemsInCart[i] = courseItem;
    }

    //проходим по всем сетам +1
    for (let j = 0; j < curDishSetsAddOne.length; j++) {
      if (curDishSetsAddOne[j].countInCart >= curDishSetsAddOne[j].dishCount && (curDishSetsAddOne[j].dishes[0].promocode == this.confirmedPromocode || curDishSetsAddOne[j].dishes[0].promocode == null)) {
        let minAddOnePrice = Number.MAX_VALUE;
        let pos = -1;
        //находим блюдо из сета +1 с наименьшей ценой
        for (let i = 0; i < new_state.itemsInCart.length; i++) {
          let courseItem = new_state.itemsInCart[i];
          for (let k = 0; k < curDishSetsAddOne[j].dishes.length; k++) {
            if (courseItem.couse.VCode == curDishSetsAddOne[j].dishes[k].dish) {
              if (minAddOnePrice > courseItem.couse.Price) {
                minAddOnePrice = courseItem.couse.Price;
                pos = i;
              }
            }
          }
        }




        if (pos >= 0) {
          //первый этап, находим все позиции, которые относятся к акции +1 и ставим им цену как в меню
          for (let i = 0; i < new_state.itemsInCart.length; i++) {
            let courseItem = new_state.itemsInCart[i];
            for (let k = 0; k < curDishSetsAddOne[j].dishes.length; k++) {
              if (courseItem.couse.VCode == curDishSetsAddOne[j].dishes[k].dish) {
                courseItem.campaign = curDishSetsAddOne[j].vcode;
                courseItem.priceWithDiscount = courseItem.quantity * courseItem.couse.Price;
                courseItem.couse.priceWithDiscount = courseItem.couse.Price;
              }
            }
          }
          //теперь нужно найти позицию с наименьшей ценой и установить в нём +1
          let courseItem = new_state.itemsInCart[pos];
          if (courseItem.quantity > 1) {
            courseItem.priceWithDiscount = (courseItem.quantity - 1) * courseItem.couse.Price + 0.01;
            courseItem.couse.priceWithDiscount = Math.round((courseItem.couse.Price * (courseItem.quantity - 1) / courseItem.quantity) * 100) / 100;
          } else {
            courseItem.priceWithDiscount = 0.01;
            courseItem.couse.priceWithDiscount = 0.01;
          }


        }


      }
    }
    //#endregion

    for (let i = 0; i < new_state.itemsInCart.length; i++) {

      let courseItem = new_state.itemsInCart[i];
      //если есть процентная скидка, сразу её ставим
      courseItem.priceWithDiscount = courseItem.couse.priceWithDiscount * courseItem.quantity;
    }
    // @ts-ignore
    if(new_state.itemsInCart[0].campaign == "36") { new_state.itemsInCart[0].campaign = undefined }
    return new_state.itemsInCart[0]
  }

  applyDiscountForCart(userInfo: UserInfoState) {
    const { totalPrice, items, isEmpty, presents } = this;

    this.applyDiscount(
      { totalPrice, items, isEmpty, presents },
      userInfo.percentDiscounts,
      userInfo.dishDiscounts,
      userInfo.allCampaign,
      userInfo.dishSet,
      userInfo.addOne
    )
  }

  /** проверка перед отправкой (остатки и валидации) */
  prePostOrder = async (goToAuth?: () => void) => {
    this.postOrder.setState('LOADING')
    const { receptionType, currentOrgID, Location } = this.root.reception
    const { confirmedAddress, confirmedLocation } = Location
    switch (receptionType) {
      case 'delivery':
        if (!confirmedLocation?.lat) {
          Toast.show('Укажите местоположение заного')
          this.postOrder.setState('FAILED')
          this.detailPopup.close()
          this.root.reception.Location.clearAddress()
          this.root.reception.selectLocationPopup.open()
          return
        }
        if (!confirmedLocation?.lon) {
          Toast.show('Местоположение не указано, укажите его снова')
          this.postOrder.setState('FAILED')
          this.detailPopup.close()
          this.root.reception.Location.clearAddress()
          this.root.reception.selectLocationPopup.open()
          return
        }
        if (!confirmedAddress.road) {
          Toast.show('Адрес не указан, укажите его снова')
          this.postOrder.setState('FAILED')
          this.detailPopup.close()
          this.root.reception.Location.clearAddress()
          this.root.reception.selectLocationPopup.open()
          return
        }
        if (!confirmedAddress.house_number) {
          Toast.show('Адрес не указан, укажите его еще раз')
          this.postOrder.setState('FAILED')
          this.detailPopup.close()
          this.root.reception.Location.clearAddress()
          this.root.reception.selectLocationPopup.open()
          return
        }
        if (!this.slots.selectedSlot) {
          Toast.show('Слот не указан')
          this.postOrder.setState('FAILED')
          this.detailPopup.close()
          return
        }
        if (!this.root.reception.nearestOrgDistance || !this.root.reception.nearestOrgForDelivery) {
          Toast.show('Укажите адрес снова')
          this.postOrder.setState('FAILED')
          this.detailPopup.close()
          this.root.reception.Location.clearAddress()
          this.root.reception.selectLocationPopup.open()
          return
        }
        break
      case 'pickup':
        if (!currentOrgID) {
          Toast.show('Точка самовывоза не выбрана')
          this.root.reception.selectLocationPopup.open()
          this.detailPopup.close()
          this.postOrder.setState('FAILED')
          return
        }
        break
      case 'initial':
        Toast.show('Способ получения не выбран')
        this.root.reception.selectLocationPopup.open()
        this.detailPopup.close()
        this.postOrder.setState('FAILED')
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
          fullAddress: CITY_PREFIX + confirmedAddress.road + " " + confirmedAddress.house_number,
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
        this.detailPopup.close()
        if(!goToAuth) {
          this.root.auth.authRequired.open()
        } else {
          goToAuth()
        }
        this.postOrder.setState('FAILED')
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
      console.log(this.root.auth.utm)

      const response: [historyOrderItem] = await http.post(
        this.payment.method !== 'CARD_ONLINE'
          ? '/NewOrderSlot'
          : '/NewOrderSlotPay',
        { 
          ...order, 
          utm: this.root.auth.utm || null, 
          webApp: AppValues[this.root.instance]
        }
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
        this.root.vkMiniAppMetrics.buy(this.root.user.ID || '')
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

  giftInfoPopup = new Popup()
  deliveryPriceInfoPopup = new Popup()
}


export type PercentDiscount = {
  vcode: number,
  MinSum: number,
  MaxSum: number,
  bonusRate: number,
  discountPercent: number,
  discountMoney: number,
  promocode: string,
  TakeOut: number,
  Delivery: number,
  PresentAction: Optional<boolean>
}

export type DishDiscount = {
  discountPercent: number,
  vcode: number,
  isset: number,
  quantity: number,
  promocode: string,
  dish: number,
  price: number,
  TakeOut: number,
  Delivery: number,
  MinSum: number,
  MaxSum: number,
  PresentAction: Optional<boolean>,
  AddOne: boolean | null
}

export type DishSetDiscount = {
  vcode: number,
  dishes: DishDiscount[],
  dishCount: number,
  promocode: string
  PresentAction: Optional<boolean>,
  MinSum: number,
  MaxSum: number,
}


export type AllCampaignUser = {
  Name: string,
  Description: string,
  VCode: any,
  periodtype: string,
  isset: number,
  quantity: number,
  promocode: string,
  image: string,
  compresimage: string,
  showintgregistry: boolean,
  TakeOut: number,
  Delivery: number,
  PresentAction: Optional<boolean>,
  MinSum: number,
  MaxSum: number,
  AddOne: boolean | null,
  begintime: string,
  endtime: string,
  BeginDate: string,
  EndDate: string,
  showbanner: boolean
}

export type AddOne = {
  vcode: string,
  dishes: {
    vcode: string,
    isset: number,
    quantity: string,
    promocode: null | string,
    dish: string,
    price: number,
    discountPercent: null | number,
    TakeOut: number,
    Delivery: number,
    MinSum: number,
    MaxSum: number,
    PresentAction: boolean,
    AddOne: true
  }[],
  dishCount: string,
  PresentAction: boolean,
  MinSum: number,
  MaxSum: number
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

