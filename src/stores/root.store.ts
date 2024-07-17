import { makeAutoObservable } from "mobx";
import { AuthStore } from "./auth.store";
import NavigationStore from "./navigation.store";

export default class RootStore {
  receptionType: ReceptionType = 'pickup';
  setReceptionType(rt: ReceptionType) {
    this.receptionType = rt
  }
  navigateToInputAddr = () => {
    this.navigationStore.push('/selectPoint')
  }

  constructor() {
    makeAutoObservable(this)
  }
  navigationStore = new NavigationStore()
  auth = new AuthStore(this)
}

export const receptionTypes = {
  pickup: 'pickup',
  delivery: 'delivery'
} as const;

export type ReceptionType = typeof receptionTypes[
  keyof typeof receptionTypes
];