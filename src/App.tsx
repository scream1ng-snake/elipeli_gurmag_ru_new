import { locale } from 'moment';
import React from 'react';
import 'moment/locale/ru'
import './reset.css';
import { RouterComponent as Router } from './components';
import { StoreProvider, ThemeProvider } from './features/providers';
import RootStore from './stores/root.store';
import bridge from '@vkontakte/vk-bridge';

const Store = new RootStore()
locale('ru');

bridge.subscribe((e) => {
  if (e.detail.type === 'VKWebAppLocationChanged') {
    console.log(e.detail.data)
  }
  if (e.detail.type === 'VKWebAppChangeFragment') {
    console.log(e.detail.data)
  }
});

function App() {
  return (
    <ThemeProvider>
      <StoreProvider store={Store}>
        <Router />
      </StoreProvider>
    </ThemeProvider>
  );
}

export default App;
