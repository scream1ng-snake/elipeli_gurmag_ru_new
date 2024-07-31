import { locale } from 'moment';
import React from 'react';
import './App.css';
import { RouterComponent as Router } from './components';
import { StoreProvider, ThemeProvider } from './features/providers';
import RootStore from './stores/root.store';

const Store = new RootStore()
locale('ru');

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
