import { ReactNode, useEffect, useState } from 'react';
import RootStore from '../stores/root.store';
import { StoreContext, ThemeContext } from './contexts';
import { useTelegram } from './hooks';
import { logger } from './logger';

export const Themes = {
  light: 'light',
  dark: 'dark'
} as const;

export type ThemeType = typeof Themes[keyof typeof Themes];


export const ThemeProvider = ({ children }: WithChildren) => {
  const { colorScheme, isInTelegram } = useTelegram()

  const [theme, setTheme] = useState<ThemeType>(
    isInTelegram()
      ? colorScheme
      : getThemeFromLocalstorage()
  );

  // если нет телеграм 
  // назначить переменные тг руками
  const switchTheme = (theme: ThemeType) => {
    // сетаем свои переменные темы
    // чтобы их можно было использовать везде
    for (const Var of myVariables) {
      document.documentElement.style.setProperty(Var.cssVar, Var[theme])
    }
    if (!isInTelegram()) {
      setTheme(theme);
      // если мы не в тг то используемых тг вариаблов не будет
      // сетаем оставшиеся переменные если нет тг
      for (const Var of tgVariables) {
        document.documentElement.style.setProperty(Var.cssVar, Var[theme])
      }
      localStorage.setItem('theme', theme)
      logger.log('тема переключена на ' + theme, 'theme')
    }
    // antd-mobile
    // сетаем антд переменные темы вот так:
    document.documentElement.setAttribute(
      'data-prefers-color-scheme',
      theme
   )
   for (const Var of antdVariables) {
      document.documentElement.style.setProperty(Var.cssVar, Var[theme])
   }
  }
  useEffect(() => {
    switchTheme(theme)
  }, [])// eslint-disable-line

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const getThemeFromLocalstorage = () =>
  window.localStorage.getItem("theme") === null
    ? Themes.light
    : window.localStorage.getItem("theme") === 'dark'
      ? 'dark' as ThemeType
      : 'light' as ThemeType

type Var = { cssVar: string, dark: string, light: string }

/** телеграммные переменные, чтобы в десктопной версии тоже были какие-то цвета */
const tgVariables: Var[] = [
  { cssVar: '--tg-color-scheme', dark: 'dark', light: 'light' },
  { cssVar: '--tg-theme-hint-color', dark: '#708499', light: '#999999' },
  { cssVar: '--tg-theme-link-color', dark: '#168ACD', light: '#73B9F5' },
  { cssVar: '--tg-theme-button-color', dark: '#2F6EA5', light: '#40A7E3' },
  { cssVar: '--tg-theme-button-text-color', dark: '#FFFFFF', light: '#FFFFFF' },
  { cssVar: '--tg-theme-bg-color', dark: '#17212B', light: '#FFFFFF' },
  { cssVar: '--tg-theme-secondary-bg-color', dark: '#232E3C', light: '#EDF1F4' },
  { cssVar: '--tg-theme-text-color', dark: '#F5F5F5', light: '#222222' }
]

/** кастомные переменные */
const myVariables = [
  { cssVar: '--gurmag-accent-color', dark: '#F7BB0F', light: '#F7BB0F' },
  { cssVar: '--theme-shadow-color', dark: 'black', light: 'grey' },
  { cssVar: '--громкий-текст', dark: '#FFFFFF', light: '#000000' }, 
  { cssVar: '--тихий-текст', dark: '#BABABA', light: '#836868' }, 
]

const antdVariables: Var[] = [
  { cssVar: '--adm-color-background', dark: 'var(--tg-theme-bg-color)', light: 'var(--tg-theme-bg-color)' }, 
  { cssVar: '--adm-color-primary', dark: 'var(--gurmag-accent-color)', light: 'var(--gurmag-accent-color)' }, 
  { cssVar: '--adm-color-box', dark: 'var(--tg-theme-secondary-bg-color)', light: 'var(--tg-theme-secondary-bg-color)' }, 
  { cssVar: '--adm-font-family', dark: 'Roboto, sans-serif', light: 'Roboto, sans-serif' }
]

type WithChildren = {
  children: ReactNode
}

export const StoreProvider: React.FC<{ 
  children: React.ReactNode, 
  store: RootStore 
}> = ({ children, store }) => {
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
};