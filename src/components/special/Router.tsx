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
  const { pathname, hash, search } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { auth } = useStore()
  useEffect(() => {
    let utm_source = searchParams.get("utm_source") || undefined
    let utm_medium = searchParams.get("utm_medium") || undefined
    let utm_campaign = searchParams.get("utm_campaign") || undefined
    let utm_content = searchParams.get("utm_content") || undefined
    let utm_term = searchParams.get("utm_term") || undefined
    let rb_clickid = searchParams.get("rb_clickid") || undefined
    let yclid = searchParams.get("yclid") || undefined

    let utm = JSON.stringify({
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      rb_clickid,
      yclid
    })
    auth.UTM = utm
  }, [])
  // useEffect(() => {
  //   console.log('pathname changed')
  //   console.log('saved utm')
  //   const utmObj = JSON.parse(auth.utm)
  //   console.log(utmObj)
  //   let sParams: Record<string, string> = {}
  //   Object
  //     .keys(utmObj)
  //     .filter(key => Boolean(utmObj[key]))
  //     .forEach(key => sParams[key] = utmObj[key])

  //   console.log('setted search params')
  //   console.log(sParams)
  //   console.log(searchParams.size)
  //   if(!searchParams.size) setSearchParams(sParams)
  // }, [search])
  return p.children
})


