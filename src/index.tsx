import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './features/perfomance';

import vkBridge from '@vkontakte/vk-bridge';

vkBridge.send('VKWebAppInit');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);

// reportWebVitals(console.log);
