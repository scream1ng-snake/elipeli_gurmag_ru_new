import { makeAutoObservable } from "mobx";
import { useTelegram } from "../features/hooks";
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

  /** тут мы проверяем авторизацию */
  async check() {
    this.setState('CHECKING_AUTH')
    const orgId = this.root.reception.OrgForMenu as number
    switch (this.root.instance) {
      case 'TG_BROWSER': {
        const { userId } = useTelegram() // eslint-disable-line
        const result = userId
          ? await this.root.user.loadUserInfo.run(orgId, userId)
          : await this.root.user.loadUserInfo.run(orgId, 0)

        result?.UserInfo
          ? this.setState('AUTHORIZED')
          : this.setState('NOT_AUTHORIZED')

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

        break;
    }
    logger.log(this.state, 'auth-store')
  }
}
