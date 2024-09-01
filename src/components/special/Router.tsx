import {
  Route,
  Routes,
  BrowserRouter
} from 'react-router-dom';
import { FC } from 'react';
import { Checker } from './AuthCheck';
import MainPage from '../pages/main/MainPage';
import CartPage from '../pages/cart/CartPage';
import LoginPage from '../pages/login/LoginPage';
import UserPage from '../pages/user/UserPage';
import MorePage from '../pages/more/MorePage';

const routes: Array<{
  path: string,
  private: boolean,
  element: JSX.Element
}> = [
    {
      path: '/',
      private: false,
      element: <MainPage />
    },
    {
      path: '/menu/:VCode',
      private: false,
      element: <MainPage />
    },
    {
      path: '/basket',
      private: false,
      element: <CartPage />
    },
    {
      path: '/authorize',
      private: false,
      element: <LoginPage />
    },
    {
      path: '/me',
      private: true,
      element: <UserPage />
    },
    {
      path: '/more',
      private: false,
      element: <MorePage />
    }
  ]

export const RouterComponent: FC = () => <BrowserRouter>
  <Routes>
    {routes.map((route) =>
      <Route
        key={route.path}
        path={route.path}
        element={route.private
          ? <Checker>{route.element}</Checker>
          : route.element
        }
      />
    )}
  </Routes>
</BrowserRouter>

