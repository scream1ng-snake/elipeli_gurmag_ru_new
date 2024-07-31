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