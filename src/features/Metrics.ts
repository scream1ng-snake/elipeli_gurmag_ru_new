import { CourseItem } from "../stores/menu.store";
import { logger } from "./logger";
import { CouseInCart, historyOrderItem } from "../stores/cart.store";
import config from "./config";
import bridge from "@vkontakte/vk-bridge";

declare global {
  interface Window {
    _tmr: any;
    ym: any;
    dataLayer: any;
  }
}

abstract class Metrics {
  static pixelID = 3655321

  static isDev = false

  static buyYandex(order: historyOrderItem) {
    if(!this.isDev) {
      window.dataLayer?.push?.({
        "ecommerce": {
            "currencyCode": "RUB",
            "purchase" : {
                "actionField" : {
                  "id": order.VCode
                },
                "products" : order.Courses.map(course => ({
                  "id": course.CourseCode,
                  "name": course.CourseName,
                  "price": course.CourseCost,
                  "quantity": course.CourseQuantity,
                }))
            }
        }
    });
  
    // @ts-ignore
    ym?.(98171988,'reachGoal','purchase')
    }
  }
  static buy(totalPrice: number, IDs: number[]) {
    if(!this.isDev) {
      // @ts-ignore
      _tmr.push({
        type: 'reachGoal', 
        id: this.pixelID, 
        value: totalPrice, 
        goal: 'order', 
        params: {
          product_id: IDs
        }
      });
    }
  }
  static registration() {
    if(!this.isDev) {
      // @ts-ignore
      _tmr.push({ 
        type: 'reachGoal', 
        id: this.pixelID, 
        goal: 'registration'
      })
  
      // @ts-ignore
      ym?.(98171988,'reachGoal','registration')
    }
  }
  static addToCart(course: CourseItem) {
    if(!this.isDev) {
      logger.log('addtobasket event vk pixel', 'metrics')
      // @ts-ignore
      // console.log(_tmr)
      // @ts-ignore
      _tmr.push({ 
        type: 'reachGoal', 
        id: this.pixelID, 
        value: course.Price, 
        goal: 'addbasket', 
        params: { product_id: course.VCode }
      });
      window.dataLayer?.push?.({
        "ecommerce": {
            "currencyCode": "RUB",
            "add" : {
                "products" : [{
                  "id": course.VCode,
                  "name": course.Name,
                  "category": course.CatVCode,
                  "price": course.Price,
                  "quantity": 1,
                }]
            }
        }
      });
      
      // @ts-ignore
      ym?.(98171988,'reachGoal','add')
    }
  }
}

export class VK_Metrics {
  isVK: boolean | null = null
  constructor() {
    this.isVK = bridge?.isIframe() || bridge?.isWebView()
  }
  registration(custom_user_id: string) {
    // @ts-ignore
    if(this.isVK) bridge.send('VKWebAppTrackEvent', {
      event_name: 'registration',
      custom_user_id
    })
  }
  login(custom_user_id: string) {
    // @ts-ignore
    if(this.isVK) bridge.send('VKWebAppTrackEvent', {
      event_name: 'login',
      custom_user_id
    })
  }
  init(custom_user_id: string) {
    // @ts-ignore
    if(this.isVK) bridge.send('VKWebAppTrackEvent', {
      event_name: 'mt_internal_launch ',
      custom_user_id
    })
  }
  addToCart(custom_user_id: string) {
    // @ts-ignore
    if(this.isVK) bridge.send('VKWebAppTrackEvent', {
      event_name: 'add_to_cart',
      custom_user_id
    })
  }
  buy(custom_user_id: string) {
    // @ts-ignore
    if(this.isVK) bridge.send('VKWebAppTrackEvent', {
      event_name: 'purchase',
      custom_user_id
    })
  }
}

export default Metrics