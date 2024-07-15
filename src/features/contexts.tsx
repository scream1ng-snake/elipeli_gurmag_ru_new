import { createContext } from "react";
import RootStore from "../stores/root.store";
import { ThemeType } from "./providers";



export const ThemeContext = createContext({
  switchTheme: (theme: ThemeType) => { },
  theme: '',
});



const empty = null as unknown as RootStore
export const StoreContext = createContext<RootStore>(empty);