import { makeAutoObservable } from 'mobx'
import { createBrowserHistory } from "@remix-run/router";

class NavigationStore {
  location = null;
  history = createBrowserHistory();

  push(location: string) {
    this.history.push(location);
  }
  replace(location: string) {
    this.history.replace(location);
  }
  go(n: number) {
    this.history.go(n);
  }
  goBack() {
    this.history.go(-1);
  }
  goForward() {
    this.history.go(1);
  }

  constructor() {
    makeAutoObservable(this)
  }
}

const navigationStore = new NavigationStore();

export default navigationStore;