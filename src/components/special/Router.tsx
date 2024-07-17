import {
  Route,
  Routes,
  BrowserRouter
} from 'react-router-dom';
import { FC } from 'react';
import { Checker } from './AuthCheck';
import MainPage from '../pages/main/MainPage';
import SelectReception from '../pages/reception/SelectReception';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../features/hooks';
import { logger } from '../../features/logger';

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

export const RouterComponent: FC = observer(() => {
  const { nav: { location }} = useStore()
  logger.log('location changed ' + location.pathname, 'Router')
  return (
    <BrowserRouter>
      <Routes location={location}>
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
  )
})


