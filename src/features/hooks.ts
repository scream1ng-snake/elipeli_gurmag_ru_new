import { useContext, useState, useEffect } from "react";
import { StoreContext, ThemeContext } from "./contexts";
import { useLocation, useNavigate } from "react-router-dom";  
import { HistoryContext } from "./providers";

declare global {
  interface Window {
    Telegram: any;
  }
}

const tg = window?.Telegram?.WebApp ?? null;

export function useTelegram() {
  const colors = {
    bg_color: tg.themeParams.bg_color as string,
    text_color: tg.themeParams.text_color as string,
    hint_color: tg.themeParams.hint_color as string,
    button_color: tg.themeParams.button_color as string,
    button_text_color: tg.themeParams.button_text_color as string,
    secondary_bg_color: tg.themeParams.secondary_bg_color as string,
  }
  const isInTelegram = () => Boolean(tg?.initDataUnsafe?.user?.id)
  const CloudStorage = {
    setItem(key: string, value: string) {
      return tg.CloudStorage.setItem(key, value)
    },
    getItem(key: string) {
      return tg.CloudStorage.getItem(key) as string
    },
  }
  return {
    tg, 
    colors,
    user: tg?.initDataUnsafe?.user, 
    // userId: tg?.initDataUnsafe?.user?.id ?? '545380588', 
    userId: tg?.initDataUnsafe?.user?.id, 
    queryId: tg?.initDataUnsafe?.query_id, 
    isInTelegram, 
    colorScheme: tg?.colorScheme,
    CloudStorage,
  }
}

export const useStore = () => useContext(StoreContext);
export const useTheme = () => useContext(ThemeContext);


export function useGoUTM() {
  const { auth } = useStore()
  const navigate = useNavigate()

  return (pathname: string, searches: Record<string, string> = {}) => {
    const myParams = new URLSearchParams(JSON.parse(auth.UTM ?? '{}'))
    Object.keys(searches).forEach(key => {
      myParams.append(key, searches[key])
    })
    return navigate({ 
      pathname, 
      search: myParams.toString()
    })
  }
}

export const DeviceTypes = {
  desktop: 'desktop',
  tablet: 'tablet',
  mobile: 'mobile' 
} as const
export type DeviceType = typeof DeviceTypes[keyof typeof DeviceTypes]
export const useDeviceType = () => {  
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')  
  
  const getDeviceType = () => {  
    const width = window.innerWidth;  
    if (width < 768) {  
      setDeviceType('mobile');  
    } else if (width >= 768 && width < 1024) {  
      setDeviceType('tablet');  
    } else {  
      setDeviceType('desktop');  
    }  
  }

  useEffect(() => {
    getDeviceType() 
    window.addEventListener('resize', getDeviceType);  
    return () => window.removeEventListener('resize', getDeviceType);  
  }, [])
  return deviceType
};  



// Хук для навигации назад с пропуском дубликатов  
export function useNavigateBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const historyStack = useContext(HistoryContext);

  function navigateBack() {
    if (!historyStack || !historyStack.current || historyStack.current.length === 0) {
      // История пуста — переходим на главную  
      navigate('/', { replace: true });
      return;
    }

    const currentPath = location.pathname;
    let stack = historyStack.current;

    // Удаляем из конца стека значение, равное текущему (текущий путь)  
    while (stack.length > 0 && stack[stack.length - 1] === currentPath) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Нет предыдущих отличных путей, идем на главную  
      navigate('/', { replace: true });
      return;
    }

    // Целевой адрес для перехода — последний элемент стека  
    const targetPath = stack[stack.length - 1];

    // Уходим на целевую страницу  
    navigate(targetPath, { replace: true });

    // Урезаем стек: убираем текущий элемент (уже удалён), прокидывать надо по ситуации  
    // Можно оставить стек как есть, он уже содержит targetPath в конце  
  }

  return navigateBack;
}