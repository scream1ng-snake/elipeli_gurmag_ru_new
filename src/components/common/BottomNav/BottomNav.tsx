import { HomeOutlined, MoreOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { Badge, TabBar } from "antd-mobile"
import { GiftOutline, UserOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useStore } from "../../../features/hooks"
import { Void } from "../../layout/Void"


const BottomNavigation: FC = observer(() => {
  const { cart, auth, user } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const setRouteActive = (value: string) => {
    navigate(value)
  }

  const isntAuth = auth.state !== 'AUTHORIZED'
  const tabs = [
    {
      key: '/',
      title: 'Главная',
      icon: <HomeOutlined />,
    },
    {
      key: isntAuth ? '/authorize' : '/me',
      title: isntAuth ? 'Вход' : 'Профиль',
      icon: <UserOutline />,
      badge: isntAuth ? Badge.dot : null
    },
    {
      key: '/campaigns', 
      title: 'Акции', 
      icon: <GiftOutline />,
      badge: user.info.allCampaign.filter(al => !al.promocode).length
    },
    {
      key: '/more',
      title: 'Ещё',
      icon: <MoreOutlined />,
    },
    {
      key: '/basket',
      title: 'Корзина',
      icon: <ShoppingCartOutlined />,
      badge: String(cart.items.length) 
    },
  ]

  const styles: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--tg-theme-bg-color)',
    padding: '0.5rem',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  }

  return (
    <TabBar style={styles} activeKey={pathname} onChange={value => setRouteActive(value)}>
      {tabs.map(item => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} badge={item.badge} />
      ))}
    </TabBar>
  )
})



export default () => <>
  <BottomNavigation />
  <Void height="65px" />
</>