import { makeAutoObservable } from "mobx";
import { AuthStore } from "./auth.store";

export default class RootStore {
  constructor() {
    makeAutoObservable(this)
  }
  auth = new AuthStore(this)
}