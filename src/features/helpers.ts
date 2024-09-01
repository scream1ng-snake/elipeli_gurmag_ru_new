import { makeAutoObservable } from "mobx";
import { ReactNode } from "react";

export type Optional<T> = T | null;
export type Undef<T> = T | undefined;

type F<B extends unknown[]> = (state: LoadStatesType, setState: (newState: LoadStatesType) => any, ...args: B) => Promise<any>
export class Request<A extends unknown[]> {
  run
  state: LoadStatesType = 'INITIAL'
  setState = (s: LoadStatesType) => {
    this.state = s
  }
  constructor(run:F<A>) {
    this.run = (...args: A) => run(this.state, this.setState, ...args)
    makeAutoObservable(this)
  }
}

export const LoadStates = {
  INITIAL: "INITIAL",
  LOADING: "LOADING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type LoadStatesType = typeof LoadStates[keyof typeof LoadStates];


export type WithChildren = {
  children?: ReactNode
}

function unsecuredCopyToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Копирование в буфер не выполнено', err);
  }
  document.body.removeChild(textArea);
}
export function copyToClipboard(text: string) {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    } else {
      unsecuredCopyToClipboard(text);
    }
  } catch (e) {
    throw e;
  }
}

export function getDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number, 
  unit: 'M' | 'K' | 'N' = 'K'
) {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0
  } else {
    let radlat1 = Math.PI * lat1 / 180;
    let radlat2 = Math.PI * lat2 / 180;
    let theta = lon1 - lon2;
    let radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) 
      * Math.sin(radlat2) 
      + Math.cos(radlat1) 
      * Math.cos(radlat2) 
      * Math.cos(radtheta);
    
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === "K") { dist = dist * 1.609344 }
    if (unit === "N") { dist = dist * 0.8684 }
    return dist;
  }
}

export class Searcher {
  _result: Array<any> = []
  _inputDataGetter: () => Array<any>

  get isSearching() {
    return Boolean(this.searchTerm.length)
  }

  constructor(inputGetter: () => Array<any>) {
    this._inputDataGetter = inputGetter;
    this._result = this._inputDataGetter();
    makeAutoObservable(this);
  }

  searchTerm = ''
  search(term: string) {
    this.searchTerm = term;
    const data = this._inputDataGetter()
    if (!this.isSearching) {
      this._result = data;
    } else {
      this._result = data.filter((d) => {
        const bools = Object.keys(d).map((key) => {
          if (typeof d[key] === 'string') {
            return d[key]
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()) || false;
          } else {
            return false
          }
        })
        return bools.includes(true);
      })
    }

  }
  get result() {
    return this._result
  }
}

