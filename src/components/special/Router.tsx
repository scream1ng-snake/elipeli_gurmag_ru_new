import {
  Route,
  Routes,
  BrowserRouter,
  useSearchParams,
  useLocation,
  HashRouter
} from 'react-router-dom';
import { FC, useEffect } from 'react';
import { Checker } from './AuthCheck';
import MainPage from '../pages/main/MainPage';
import LoginPage from '../pages/login/LoginPage';
import UserPage from '../pages/user/UserPage';
import MorePage from '../pages/more/MorePage';
import OrdersPage, { WatchOrderDetailModal } from '../pages/orders/OrdersPage';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../features/hooks';
import CampaignsPage from '../pages/campaigns/CampaignsPage';
import { HistoryProvider } from '../../features/providers';
// @ts-ignore
window.dataLayer = window.dataLayer || []
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
      element: <MainPage />
    },
    {
      path: '/collections/:VCode',
      private: false,
      element: <MainPage />
    },
    {
      path: '/basket',
      private: false,
      element: <MainPage />
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
    {
      path: "/stories/:storyId",
      private: false,
      element: <MainPage />
    },
    {
      path: "/categories/:category",
      private: false,
      element: <MainPage />
    }
  ]

function getRoutes() {
  return <HistoryProvider> 
  <Routes>
      {routes.map((route) =>
        <Route
          key={route.path}
          path={route.path}
          element={
            <UtmChecker>
              <Metrics>
                {route.private
                  ? <Checker>{route.element}</Checker>
                  : route.element
                }
              </Metrics>
            </UtmChecker>
          }
        />
      )}
  </Routes>
  </HistoryProvider>
}
export const RouterComponent: FC = () => {
  const { instance } = useStore()
  return instance === 'VK'
    ? <HashRouter>{getRoutes()}</HashRouter>
    : <BrowserRouter>{getRoutes()}</BrowserRouter>
}



const Metrics: FC<any> = p => {
  const { pathname, search } = useLocation()
  useEffect(() => {
    const YaScript = document.createElement('script')
    YaScript.type = 'text/javascript'
    YaScript.innerHTML = `
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    
    ym(98171988, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
      ecommerce: "dataLayer"
    });
    
    `
    document.head.appendChild(YaScript)

    const vkScript = document.createElement('script')
    vkScript.type = 'text/javascript'
    vkScript.innerHTML = `
    var _tmr = window._tmr || (window._tmr = []);
    _tmr.push({id: "3655321", type: "pageView", start: (new Date()).getTime(), pid: "USER_ID"});
    (function (d, w, id) {
      if (d.getElementById(id)) return;
      var ts = d.createElement("script"); ts.type = "text/javascript"; ts.async = true; ts.id = id;
      ts.src = "https://top-fwz1.mail.ru/js/code.js";
      var f = function () {var s = d.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ts, s);};
      if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); }
    })(document, window, "tmr-code");
    `
    document.head.appendChild(vkScript)

    return () => {
      document.head.removeChild(YaScript)
      document.head.removeChild(vkScript)
    }
  }, [pathname, search])
  return p.children
}

const UtmChecker: FC<any> = observer(p => {
  const [searchParams] = useSearchParams()
  const { auth } = useStore()
  useEffect(() => {
    const utmObj: Record<string, string> = {}
    searchParams.forEach((val , key) =>  utmObj[key] = val)
    auth.UTM = JSON.stringify(utmObj)
  }, [])
  return p.children
})


