import { makeAutoObservable, reaction } from "mobx";
import { CartStore } from "./cart.store";
import Popup from "../features/modal";

class GiftStore {
  GIFT_AMOUNT = 1000

  totalPrice = 0
  
  constructor(private readonly cart: CartStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }
  get percent() { return this.GIFT_AMOUNT * this.totalPrice / 10000 }
  get isFull() { return this.percent >= 100 }
  get isNtFull() { return this.percent < 100 }

  giftInfoPopup = new Popup()
}

export default GiftStore