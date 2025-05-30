import { makeAutoObservable, reaction } from "mobx";
import { useTelegram } from "../features/hooks";
import { http } from "../features/http";
import { logger } from "../features/logger";
import RootStore from "./root.store";
import { Optional, Request, Undef } from "../features/helpers";
import { Dialog, Image } from "antd-mobile";
import { ExclamationCircleFill as Icon } from "antd-mobile-icons";
import Pizza from '../assets/Pizza.png'
import Popup from "../features/modal";
import Metrics from "../features/Metrics";
import bridge from "@vkontakte/vk-bridge";

export const AuthStates = {
  CHECKING_AUTH: "CHECKING_AUTH",
  AUTHORIZED: "AUTHORIZED",
  AUTHORIZING: "AUTHORIZING",
  NOT_AUTHORIZED: "NOT_AUTHORIZED",
} as const;
export type AuthStateType = typeof AuthStates[keyof typeof AuthStates];

export class AuthStore {
  root: RootStore;
  state: AuthStateType = AuthStates.CHECKING_AUTH;
  stage: AuthStage = 'INPUT_TELEPHONE'

  timerID: Optional<ReturnType<typeof setTimeout>> = null
  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this)


    const dismissAuthPopup = localStorage.getItem('closeAskAuth')
    if (dismissAuthPopup === 'true') {
      this.floatingIconAuthForGift.open()
    } else {
      // если мы не авторизовались то через 5 сек покажем баннер 
      // предложим подарок чтобы зарегаться или войти
      reaction(() => this.state, (current, prev) => {
        if (current === 'NOT_AUTHORIZED' && prev === 'CHECKING_AUTH')
          this.timerID = setTimeout(this.bannerAuthForGift.open, 5000)
      })
    }

    // как только мы авторизровались грузим историю заказа
    reaction(() => this.state, val => {
      const { ID, loadOrdersHistory } = this.root.user
      if (val === 'AUTHORIZED' && ID) loadOrdersHistory.run(ID)
    })


    // если пользователь зарегался то закроем тот таймаут 
    reaction(() => this.state, (current, prev) => {
      if (current === 'AUTHORIZED' && prev !== 'AUTHORIZED') {
        if (this.timerID) clearTimeout(this.timerID)
        this.bannerAuthForGift.close()
        this.floatingIconAuthForGift.close()
        localStorage.removeItem('closeAskAuth')
      }
    })


  }

  /** баннер который предлагает подарок при чтобы залогиниться */
  bannerAuthForGift = new Popup()
  floatingIconAuthForGift = new Popup()
  dismissAskAuth = () => {
    if(this.state !== 'AUTHORIZED') {
      localStorage.setItem('closeAskAuth', 'true')
      this.bannerAuthForGift.close()

      this.floatingIconAuthForGift.open()
    }
  }
  /** верхний банер на главной, который предлагает пойти в тг */
  bannerToTg = new Popup()
  /** нижний банер который предлагает выбрать адрес или войти */
  bannerAskAdress = new Popup()

  get isAuth() { return this.state === AuthStates.AUTHORIZED }
  get isFailed() { return this.state === AuthStates.NOT_AUTHORIZED }
  get isAuthorizing() { return this.state === AuthStates.AUTHORIZING }
  get isCheckingAuth() { return this.state === AuthStates.CHECKING_AUTH }

  setState(state: AuthStateType) {
    this.state = state;
  }

  setStage(stage: AuthStage) {
    this.stage = stage
  }

  /** тут мы проверяем авторизацию */
  async check() {
    this.setState('CHECKING_AUTH')
    logger.log(this.state, 'auth-store')

    const orgId = this.root.reception.OrgForMenu as number
    switch (this.root.instance) {
      case 'TG_BROWSER': {
        const { userId: tgId } = useTelegram() // eslint-disable-line
        const result = tgId
          ? await this.root.user.loadUserInfo.run(orgId, tgId)
          : await this.root.user.loadUserInfo.run(orgId, 0)

        result
          ? this.setState('AUTHORIZED')
          : this.setState('NOT_AUTHORIZED')

        if (tgId) this.root.user.setID(tgId)
        break;
      }
      case 'VK': {
        const data = await bridge.send('VKWebAppGetUserInfo')

        const result = data.id
          ? await this.root.user.loadUserInfo.run(orgId, 'vk' + data.id)
          : await this.root.user.loadUserInfo.run(orgId, 0)

        result
          ? this.setState('AUTHORIZED')
          : this.setState('NOT_AUTHORIZED')

        if (data.id) this.root.user.setID('vk' + data.id.toString())
        break;
      }
      case 'WEB_BROWSER':
        const webId = localStorage.getItem('webId')
        const result = webId
          ? await this.root.user.loadUserInfo.run(orgId, webId)
          : await this.root.user.loadUserInfo.run(orgId, 0)


        result
          ? this.setState('AUTHORIZED')
          : this.setState('NOT_AUTHORIZED')

        if (webId) this.root.user.setID(webId)
        break;
    }
    logger.log(this.state, 'auth-store')
  }

  /** тут авторизуемся по номеру телефона */
  authorize = new Request(async (_, setState, phone: string, vkConfirmed: boolean) => {
    setState('LOADING')
    this.setState('AUTHORIZING')
    logger.log(this.state + ' ' + this.stage, 'auth-store')

    try {
      let state: resultType

      switch (this.root.instance) {
        case 'TG_BROWSER': {
          const { userId } = useTelegram()
          const result = await http.post<any, resultType>(
            '/checkUserPhone',
            { phone, userId }
          )
          if (result?.length) state = result
          break
        }
        case 'WEB_BROWSER': {
          const result = await http.post<any, resultType2>(
            '/checkUserPhoneWeb',
            { phone, utm: this.utm }
          )
          if (result.State && result.UserId) {
            localStorage.setItem('webId', result.UserId)
            this.root.user.setID(result.UserId)
            state = result.State
          }
          break
        }
        case 'VK': {
          const userId = this.root.user.ID
          let result
          // если этот номер точно дал вк
          // тогда вызываем другую апишку 
          // которая не требует смс кода
          if (vkConfirmed) {
            result = await http.post<any, resultType>(
              '/checkUserPhoneVk',
              { phone, userId }
            )
          } else {
            result = await http.post<any, resultType>(
              '/checkUserPhone',
              { phone, userId }
            )
          }
          if (result?.length) state = result
          break
        }
      }
      //@ts-ignore
      if (state) {
        if (state !== 'no_client') {
          this.setAccountState(state)
          this.setConfirmedPhone(phone)
          if (this.root.instance === 'VK' && vkConfirmed) {
            this.inputSmsCode.run('0000')
          } else {
            this.setStage('INPUT_SMS_CODE')
          }
        } else {
          this.setAccountState(state)
          this.setStage('INPUT_TELEPHONE')
          const src = 'https://t.me/Gurmagbot?start=start'
          Dialog.alert({
            confirmText: 'Перейти и запустить',
            title: 'Упс... Кажется вы забыли запустить GURMAG бот?',
            content: <p>Вам нужно зайти в <a href={src}>@Gurmagbot</a> и нажать кнопку "Запустить"</p>,
            onConfirm: () => {
              const { tg } = useTelegram() // eslint-disable-line
              tg.openTelegramLink(src)
              tg.close()
            },
          })
        }
        logger.log(state)
      }
    } catch (err) {
      logger.error(err)
      this.setState('NOT_AUTHORIZED')
      this.setStage('INPUT_TELEPHONE')
    }
  })

  /** состояние аккаунта, привязанного к номеру телефона */
  accountState: Optional<resultType> = null
  setAccountState(s: resultType) { this.accountState = s }

  /** проверенный номер телефона */
  confirmedPhone: Optional<string> = null
  setConfirmedPhone(phone: string) { this.confirmedPhone = phone }

  /** запоминаем смс код для регистрации */
  savedSmsCode: Optional<string> = null
  setSmsCodeSaved(code: string) {
    this.savedSmsCode = code
  }

  /** тут подтверждаем номер смс кодом */
  inputSmsCode = new Request(async (_, setQueryState, code: string, doOrderAfterLogin = false) => {
    setQueryState('LOADING')
    logger.log(this.state + ' ' + this.stage, 'auth-store')

    switch (this.accountState) {
      case 'new_user':
        this.setStage('REGISTRATION')
        this.setSmsCodeSaved(code)
        break
      case 'old_user':
        const userId = this.root.user.ID
        const result: regAnswer = await http.post<any, any>(
          '/regOldUser',
          { userId, phone: this.confirmedPhone, random_code: code }
        )
        if (result?.Status === 'complite') {
          setQueryState('COMPLETED')
          this.setState('AUTHORIZED')
          this.setStage('COMPLETED')
          if(doOrderAfterLogin) {
            this.root.cart.prePostOrder().then(() => {
              this.niceToMeetYooPopup.watch(result?.Message2)
            })
          } else {
            this.niceToMeetYooPopup.watch(result?.Message2)
          }
          const COrg = this.root.reception.OrgForMenu
          this.root.user.loadUserInfo.run(COrg, userId)
          Metrics.registration()
          this.root.vkMiniAppMetrics.registration(userId || '')
        } else {
          setQueryState('FAILED')
          this.setStage('INPUT_TELEPHONE')
          this.setState('NOT_AUTHORIZED')
          this.showFailedAuth(result?.Message2)
        }
        break
      case 'no_client':
        // todo
        break
    }
  })

  /** регаемся если не зареганы */
  registration = new Request(async (_, setState, { birthday, name }: SignIn, doOrderAfterReg = false) => {
    setState('LOADING')
    logger.log(this.state + ' ' + this.stage, 'auth-store')

    const userId = this.root.user.ID
    const result: regAnswer = await http.post<any, any>(
      '/regNewUser',
      {
        userId,
        regname: name,
        birthday: birthday,
        random_code: this.savedSmsCode
      }
    ).catch(console.error)
    if (result?.Status === 'complite') {
      setState('COMPLETED')
      this.setState('AUTHORIZED')
      this.setStage('COMPLETED')
      if(doOrderAfterReg) {
        this.root.cart.prePostOrder().then(() => {
          this.niceToMeetYooPopup.watch(result?.Message2)
        })
      } else {
        this.niceToMeetYooPopup.watch(result?.Message2)
      }

      const COrg = this.root.reception.OrgForMenu
      this.root.user.loadUserInfo.run(COrg, userId)
      this.root.vkMiniAppMetrics.registration(userId || '')
      Metrics.registration()
    } else {
      setState('FAILED')
      this.setStage('INPUT_TELEPHONE')
      this.setState('NOT_AUTHORIZED')
      this.showFailedAuth(result?.Message2)
    }
    logger.log(this.state + ' ' + this.stage, 'auth-store')
  })

  niceToMeetYooPopup = new Popup<string>()

  private showFailedAuth(content?: string) {
    Dialog.alert({
      header: (<Icon style={{ fontSize: 64, color: 'var(--adm-color-warning)' }} />),
      title: 'Не удалось зарегестрироваться',
      content,
      confirmText: 'Понятно',
      style: { zIndex: 10000 }
    })
  }

  utm: Undef<string> = undefined
  get UTM() { return this.utm }
  set UTM(utm: Undef<string>) { 
    console.log(utm); 
    if(utm) this.utm = utm 
  }

  authRequired = new Popup()
}


export const AuthStages = {
  /** 1) первая по счету - ввод номера */
  INPUT_TELEPHONE: "INPUT_TELEPHONE",
  /** 2) после ввода номера прилетит код */
  INPUT_SMS_CODE: "INPUT_SMS_CODE",
  /** 3) если пользователь не зареган то должен пройти рег-цию */
  REGISTRATION: "REGISTRATION",
  /** 3 или 4) если пользователь зареган, то он успешно зайдет */
  COMPLETED: "COMPLETED",
} as const;
export type AuthStage = typeof AuthStages[keyof typeof AuthStages];

type resultType = 'no_client' | 'old_user' | 'new_user'
type resultType2 = {
  State: resultType
  UserId: string
}
export type SignIn = {
  name: string,
  birthday: string
}

type regAnswer = {
  Status: string,
  // Message: string,
  /** "{\"title\":\"Примет, \\\\\"ыфыфыфыфыфыыф\\\\\"! Рады знакомству\",\"body1\":\"Если у тебя уже есть промокод\\\\n- введи его в \\\\\"Корзине\\\\\",\\\\nкогда выберешь нужные блюда.\\\\nИ акция будет применена!\\\\nЧто бы получить блюдо в подарок - его нужно закинуть в корзину!\",\"body2\":\"А если промокода нет - то лови!\\\\nПо промокоду \\\\\"2117\\\\\" дарим\\\\nпиццу Пеперони на первый заказ от 1499 руб.\",\"promo\":\"2117\"}" */
  Message2: string
}
export type Message2 = {
  title: string,
  body1: string,
  body2: string,
  promo: string
}