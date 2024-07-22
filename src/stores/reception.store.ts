import { makeAutoObservable } from "mobx";
import { logger } from "../features/logger";
import Popup from "../features/modal";
import RootStore from "./root.store";

export class ReceptionStore {
  root: RootStore;

  receptionType: ReceptionType = 'pickup';
  setReceptionType(rt: ReceptionType) {
    this.receptionType = rt
    logger.log('reception changed to ' + rt, 'reception-store')
  }

  selectLocationPopup = new Popup()

  options = [{
    label: 'Доставка',
    value: receptionTypes.delivery
  }, {
    label: 'Самовывоз',
    value: receptionTypes.pickup
  }]



  constructor(root: RootStore) {
    this.root = root; 
    makeAutoObservable(this, {}, { autoBind: true }) 
  }

}


export const receptionTypes = {
  pickup: 'pickup',
  delivery: 'delivery'
} as const;

export type ReceptionType = typeof receptionTypes[
  keyof typeof receptionTypes
];