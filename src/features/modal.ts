import { makeAutoObservable } from "mobx";

export default class Popup {
  show = false
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
  open() {
    this.show = true
  }
  close() {
    this.show = false
  }
}