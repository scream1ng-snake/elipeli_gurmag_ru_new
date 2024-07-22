import { makeAutoObservable } from "mobx";
import { AuthStore } from "./auth.store";
import { ReceptionStore } from "./reception.store";

export default class RootStore {
  constructor() {
    makeAutoObservable(this)
  }
  auth = new AuthStore(this)
  reception = new ReceptionStore(this)
}
