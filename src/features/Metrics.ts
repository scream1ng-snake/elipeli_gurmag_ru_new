import { logger } from "./logger";

declare global {
  interface Window {
    _tmr: any;
  }
}

let _tmr = window._tmr || (window._tmr = [])
abstract class Metrics {
  static pixelID = 3545385

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
    });
  }
  static addToCart(product_id: number, price: number) {
    logger.log('addtobasket event vk pixel', 'metrics')
    console.log(_tmr)
    _tmr.push({ 
      type: 'reachGoal', 
      id: this.pixelID, 
      value: price, 
      goal: 'addbasket', 
      params: { product_id }
    });
  }
}

export default Metrics