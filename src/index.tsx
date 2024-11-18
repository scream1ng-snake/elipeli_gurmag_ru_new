import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
// import reportWebVitals from './features/perfomance';

import vkBridge from '@vkontakte/vk-bridge';

vkBridge.send('VKWebAppInit');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);

// reportWebVitals(console.log);
