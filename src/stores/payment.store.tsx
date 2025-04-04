import { makeAutoObservable } from "mobx"
import Popup from "../features/modal"
import { CartStore } from "./cart.store"
import { BankcardOutline } from "antd-mobile-icons"
import { Optional, Request } from "../features/helpers"
import { receptionTypes } from "./reception.store"
import { http } from "../features/http"
import { Dialog } from "antd-mobile"
import { logger } from "../features/logger"
import { showPaymentInNewWindow } from "../components/special/NewWindow"
import { useTelegram } from "../features/hooks"

/** класс выбора способа оплаты */
class PaymentStore {
  paymentLabels = {
    // [paymentMethods.PAY_BY_CARD_UPON_RECIEPT]: 'Оплата картой при получении',
    [paymentMethods.CARD_ONLINE]: 'Картой онлайн',
    [paymentMethods.CASH]: 'Наличными',
  }

  iconstyle = { marginRight: '0.75rem', fontSize: 25, lineHeight: '25px' }

  paymentIcons = {
    // [paymentMethods.PAY_BY_CARD_UPON_RECIEPT]: <BankcardOutline style={this.iconstyle} />,
    [paymentMethods.CARD_ONLINE]: <BankcardOutline style={this.iconstyle} />,
    [paymentMethods.CASH]: <span style={this.iconstyle}>₽</span>,
  }

  /** выбранный метод оплаты */
  method: Optional<PaymentMethod> = null
  setMethod = (way: PaymentMethod) => {
    this.method = way
    this.selectMethodPopup.close()
  }

  selectMethodPopup = new Popup()

  availableMethods = {
    [receptionTypes.initial]: {},
    [receptionTypes.delivery]: {
      CARD_ONLINE: "CARD_ONLINE",
    },
    [receptionTypes.pickup]: {
      /** В пункте наличными нужно поставить ограничения, 
       * если покупатель набрал корзину до 1000р 
       * в этом случае покупатель видит 3 способа оплаты: наличными, оплата картой и СберПей, 
       * если же сумма заказа свыше 1000р в этом случае оплата картой и СберПей.
       */
      CASH: "CASH",
      CARD_ONLINE: "CARD_ONLINE",
    },
  }



  youkassaPopup = new Popup()
  checkoutWidget: any
  payOrder = new Request(async (state, setState, orderId: number) => {
    try {
      const { tg } = useTelegram()
      const type: 'redirect' | 'embedded' = tg && (tg.platform?.toLowerCase() === 'android' || tg.platform?.toLowerCase() === 'ios')
        ? 'redirect'
        : 'embedded'
      setState('LOADING')
      if(type === 'embedded') this.youkassaPopup.open()
      const { UserCode } = this.cart.root.user.info
      const result: resultType = await http.post(
        "/PayOrderSaveCardNew",
        { 
          orderId, 
          userId: Number(UserCode),
          redirect_url: window.location.origin + "?" + "payed=true",
          type,
        }
      )
      if (result?.confirmation) {
        await new Promise((resolve, reject) => {
          const { confirmation_token } = result.confirmation;
          if(type === 'redirect') {
            const { confirmation_url } = result.confirmation
            if (tg && (tg.platform?.toLowerCase() === 'android' || tg.platform?.toLowerCase() === 'ios')) {
              console.log('open redirect url in tg.openLink')
              tg.openLink(confirmation_url)
            } else {
              console.log('open redirect url in window.open')
              window.open(confirmation_url)
            }
          } else {
            
            // @ts-ignore
            this.checkoutWidget = new window.YooMoneyCheckoutWidget({
              confirmation_token,
              customization: {
                //Настройка способа отображения
                modal: true
              },
              error_callback: function (error: any) {
                reject("Не удалось оплатить")
                Dialog.show({ content: 'Не удалось оплатить' })
                this.youkassaPopup.close()
                this.checkoutWidget.destroy()
              }
            })
            this.checkoutWidget.on("success", () => {
              this.youkassaPopup.close()
              this.checkoutWidget.destroy()
              resolve("Заказ успешно оформлен")
            })
            this.checkoutWidget.on("fail", (err: any) => {
              this.youkassaPopup.close()
              this.checkoutWidget.destroy()
              console.error(err)
              Dialog.show({ 
                content: 'Что-то пошло не так c оплатой в Юкассе',
                actions: [{
                  key: 'close',
                  text: 'Закрыть'
                }]
              })
              reject("Что-то пошло не так")
            })
            this.checkoutWidget.render('payment-form')
          }
        })
      } else {
        throw new Error("Не удалось выполнить оплату")
      }
    } catch (err) {
      setState('FAILED')
      logger.error(err)
    }
  })
  constructor(readonly cart: CartStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }
}


export const paymentMethods = {
  // PAY_BY_CARD_UPON_RECIEPT: "PAY_BY_CARD_UPON_RECIEPT",
  CARD_ONLINE: "CARD_ONLINE",
  CASH: "CASH",
} as const
export type PaymentMethod = typeof paymentMethods[keyof typeof paymentMethods]


type resultType = {
  confirmation: {
    type: string,
    confirmation_token?: string,
    confirmation_url?: string,
  },
}

export default PaymentStore