import { makeAutoObservable, reaction } from "mobx";
import { useTelegram } from "../features/hooks";
import { logger } from "../features/logger";
import { AuthStore } from "./auth.store";
import { CartStore, CouseInCart } from "./cart.store";
import { ReceptionStore } from "./reception.store";
import UserStore from "./user.store";
import { getItem } from "../features/local-storage";
import bridge from "@vkontakte/vk-bridge";

export default class RootStore {
  constructor() {
    makeAutoObservable(this)
    this.bootstrap()

    /**
     * Когда все загрузится можем
     * зайти в localstorage
     * и взять сохраненную корзину
     */
    reaction(
      () => this.reception.menu.loadMenu.state,
      val => {
        if(val === 'COMPLETED') {
          // вспоминаем что сохранили в локал стораге
          const savedCart = getItem<CouseInCart[]>('cartItems')
          // надо проверить есть ли сейчас это блюдо в меню
          if(savedCart?.length) {
            this.cart.items = [];
            savedCart.forEach((couseInCart) => {
              const isExistsOnMenu = this.reception.menu.allDishes.find((bludo) => 
                bludo.VCode === couseInCart.couse.VCode
              )
              // если есть то норм
              if(isExistsOnMenu) for (let i = 1; i <= couseInCart.quantity; i++) {
                this.cart.addCourseToCart(isExistsOnMenu)                
              }
            })
          }
        }
      }
    )
  }
  auth = new AuthStore(this)
  reception = new ReceptionStore(this)
  user = new UserStore(this)
  cart = new CartStore(this)

  disposeOrgID = reaction(
    () => this.reception.OrgForMenu,
    (value, prevValue) => {
      if(prevValue !== value) {
        logger.log(`orgID changed from ${prevValue} to ${value}`, 'root')
        this.reception.employees.loadCooks.run(value)
        this.reception.menu.loadMenu.run(value)
      }
    }
  )

  bootstrap = async () => {
    this.whereWeAre()
    await this.reception.loadOrganizations.run();
    await this.auth.check();
    
    if(this.auth.isFailed) {
      const orgId = this.reception.OrgForMenu
      this.reception.employees.loadCooks.run(orgId)
      this.reception.menu.loadMenu.run(orgId)
    }
  }

  whereWeAre = () => {
    const { isInTelegram } = useTelegram()
    if(isInTelegram()) {
      logger.log('мы в телеге', 'root')
      this.appType = 'TG_BROWSER'
    } else if (bridge?.isIframe() || bridge?.isWebView()) {
      logger.log('мы в VK', 'root')
      this.appType = 'VK'
    } else {
      logger.log('мы в браузере', 'root')
      this.appType = 'WEB_BROWSER'
    }
  }
  instance: AppInstance = 'UNKNOWN'
  set appType(type: AppInstance) {
    this.instance = type
  }
}




export const AppInstances = {
  UNKNOWN: "UNKNOWN",
  // MOBILE: "MOBILE",
  WEB_BROWSER: "WEB_BROWSER",
  TG_BROWSER: "TG_BROWSER",
  VK: "VK",
} as const;
export type AppInstance = typeof AppInstances[keyof typeof AppInstances];