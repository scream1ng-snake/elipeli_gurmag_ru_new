import {
  Route,
  Routes,
  BrowserRouter,
  useSearchParams,
  useLocation
} from 'react-router-dom';
import { FC, useEffect } from 'react';
import { Checker } from './AuthCheck';
import MainPage from '../pages/main/MainPage';
import CartPage from '../pages/cart/CartPage';
import LoginPage from '../pages/login/LoginPage';
import UserPage from '../pages/user/UserPage';
import MorePage from '../pages/more/MorePage';
import OrdersPage, { WatchOrderDetailModal } from '../pages/orders/OrdersPage';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../features/hooks';
import { CollectionPopup, CollectionsPage } from '../popups/WatchCollectionPopup';
import CampaignsPage from '../pages/campaigns/CampaignsPage';

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
      path: '/collections',
      private: false,
      element: <CollectionsPage />
    },
    {
      path: '/collections/:VCode',
      private: false,
      element: <CollectionPopup />
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
    },
    {
      path: '/orders',
      private: true,
      element: <OrdersPage />
    },
    {
      path: '/orders/:VCode',
      private: true,
      element: <WatchOrderDetailModal />
    },
    {
      path: "/campaigns",
      private: false,
      element: <CampaignsPage />
    },
    {
      path: "/campaigns/:VCode",
      private: false,
      element: <CampaignsPage />
    },
  ]

export const RouterComponent: FC = () => <BrowserRouter>
  <Routes>
    {routes.map((route) =>
      <Route
        key={route.path}
        path={route.path}
        element={
          <UtmChecker>
            {route.private
              ? <Checker>{route.element}</Checker>
              : route.element
            }
          </UtmChecker>
        }
      />
    )}
  </Routes>
</BrowserRouter>



const UtmChecker: FC<any> = observer(p => {
  const { pathname, hash } = useLocation() 
  const [searchParams, setSearchParams] = useSearchParams()
  const { auth } = useStore()
  useEffect(() => {
    let utm_source = searchParams.get("utm_source") || ''
    let utm_medium = searchParams.get("utm_medium") || ''
    let utm_campaign = searchParams.get("utm_campaign") || ''
    let utm_content = searchParams.get("utm_content") || ''
    let utm_term = searchParams.get("utm_term") || ''

    let utm = JSON.stringify({ utm_source, utm_medium, utm_campaign, utm_content, utm_term })
    auth.UTM = utm
  }, [])
  useEffect(() => {
    const utmObj = JSON.parse(auth.utm)
    let searchParams: Record<string, string> = {}
    Object
      .keys(utmObj)
      .filter(key => Boolean(utmObj[key]))
      .forEach(key => searchParams[key] = utmObj[key])

    setSearchParams(searchParams)
  }, [pathname, hash])
  return p.children
})


