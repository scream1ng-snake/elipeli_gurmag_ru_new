import { CourseItem } from "../stores/menu.store";
import { logger } from "./logger";
import { CouseInCart, historyOrderItem } from "../stores/cart.store";

declare global {
  interface Window {
    _tmr: any;
    ym: any;
    dataLayer: any;
  }
}

let _tmr = window._tmr || (window._tmr = [])
abstract class Metrics {
  static pixelID = 3545385

  static buyYandex(order: historyOrderItem) {
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

  window.ym?.(98171988,'reachGoal','purchase')
  }
  static buy(totalPrice: number, IDs: number[]) {
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
  static registration() {
    _tmr.push({ 
      type: 'reachGoal', 
      id: this.pixelID, 
      goal: 'registration'
    })

    window.ym?.(98171988,'reachGoal','registration')
  }
  static addToCart(course: CourseItem) {
    logger.log('addtobasket event vk pixel', 'metrics')
    console.log(_tmr)
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
    
    window.ym?.(98171988,'reachGoal','add')
  }
}

export default Metrics