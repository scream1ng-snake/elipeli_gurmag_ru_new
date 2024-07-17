import { makeAutoObservable } from 'mobx'
import { createBrowserHistory } from "@remix-run/router";

class NavigationStore {
  location;
  history;

  push(location: string) {
    this.history.push(location);
    this.updateLocation()
  }
  replace(location: string) {
    this.history.replace(location);
    this.updateLocation()
  }
  go(n: number) {
    this.history.go(n);
    this.updateLocation()
  }
  goBack() {
    this.history.go(-1);
    this.updateLocation()
  }
  goForward() {
    this.history.go(1);
    this.updateLocation()
  }

  private updateLocation() {
    this.location = this.history.location
  }

  constructor() {
    makeAutoObservable(this)
    this.history = createBrowserHistory()
    this.location = this.history.location
  }
}

export default NavigationStore;