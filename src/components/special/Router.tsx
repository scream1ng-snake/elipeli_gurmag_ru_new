import {
  Route,
  Routes,
  BrowserRouter
} from 'react-router-dom';
import { FC } from 'react';
import { Checker } from './AuthCheck';
import MainPage from '../pages/main/MainPage';
import SelectReception from '../pages/reception/SelectReception';

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
      path: '/selectPoint',
      private: false,
      element: <SelectReception />
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

