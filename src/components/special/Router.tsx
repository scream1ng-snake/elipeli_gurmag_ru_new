import {
  Route,
  Routes,
  BrowserRouter
} from 'react-router-dom';
import { FC } from 'react';
import { Checker } from './AuthCheck';

const routes: Array<{
  path: string,
  private: boolean,
  element: JSX.Element
}> = [
    {
      path: '/',
      private: false,
      element: <div>main pagee</div>
    }
  ]

export const Router: FC = () =>
  <BrowserRouter>
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


