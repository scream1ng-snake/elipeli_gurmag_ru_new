import { makeAutoObservable } from "mobx";
import { useTelegram } from "../features/hooks";
import { http } from "../features/http";
import { logger } from "../features/logger";
import RootStore from "./root.store";

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

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this)
  }

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
    const orgId = this.root.reception.OrgForMenu as number
    switch (this.root.instance) {
      case 'TG_BROWSER': {
        const { userId: tgId } = useTelegram() // eslint-disable-line
        const result = tgId
          ? await this.root.user.loadUserInfo.run(orgId, tgId)
          : await this.root.user.loadUserInfo.run(orgId, 0)

        result?.UserInfo
          ? this.setState('AUTHORIZED')
          : this.setState('NOT_AUTHORIZED')

        if (tgId) this.root.user.setID(tgId)
        break;
      }
      case 'WEB_BROWSER':
        const webId = localStorage.getItem('webId')
        const result = webId
          ? await this.root.user.loadUserInfo.run(orgId, webId)
          : await this.root.user.loadUserInfo.run(orgId, 0)

        result?.UserInfo
          ? this.setState('AUTHORIZED')
          : this.setState('NOT_AUTHORIZED')

        if (webId) this.root.user.setID(webId)
        break;
    }
    logger.log(this.state, 'auth-store')
  }

  authorize = async (phone: string) => {
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
            { phone } // todo UTM
          )
          if (result.State && result.UserId) {
            this.root.user.setID(result.UserId)
            state = result.State
          }
          break
        }
      }
      //@ts-ignore
      if(state && state !== 'no_client') {
        this.setStage('INPUT_SMS_CODE')
      } // остановился туть
    } catch (err) {
      logger.error(err)
      this.setState('NOT_AUTHORIZED')
      this.setStage('INPUT_TELEPHONE')
    }
  }
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