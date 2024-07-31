import { makeAutoObservable } from "mobx";
import { useTelegram } from "../features/hooks";
import { logger } from "../features/logger";
import { AuthStore } from "./auth.store";
import { ReceptionStore } from "./reception.store";

export default class RootStore {
  constructor() {
    makeAutoObservable(this)
    this.bootstrap()
  }
  auth = new AuthStore(this)
  reception = new ReceptionStore(this)

  bootstrap = async () => {
    this.whereWeAre()
    await this.reception.loadOrganizations.run();
    await this.auth.authorize();
  }

  whereWeAre = () => {
    const { isInTelegram } = useTelegram()
    if(isInTelegram()) {
      logger.log('мы в телеге', 'root')
      this.appType = 'TG_BROWSER'
    } else {
      logger.log('мы в браузере', 'root')
      this.appType = 'WEB_BROWSER'
    }
  }
  instance: AppInstance = 'UNKNOWN'
  set appType(type: AppInstance) {
    this.instance = type
  }

  requestGeolocation = () => {
    if (navigator && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        // do_something(coords.latitude, coords.longitude);
      });
    } else {
      /* местоположение НЕ доступно */
    }
  }
}




export const AppInstances = {
  UNKNOWN: "UNKNOWN",
  // MOBILE: "MOBILE",
  WEB_BROWSER: "WEB_BROWSER",
  TG_BROWSER: "TG_BROWSER",
} as const;
export type AppInstance = typeof AppInstances[keyof typeof AppInstances];