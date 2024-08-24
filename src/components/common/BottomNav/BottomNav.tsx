import { HomeOutlined, MoreOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { TabBar } from "antd-mobile"
import { UserOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useStore } from "../../../features/hooks"
import { Void } from "../../layout/Void"


const BottomNavigation: FC = observer(() => {
  const { cart } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const setRouteActive = (value: string) => {
    navigate(value)
  }

  const tabs = [
    {
      key: '/',
      title: 'Главная',
      icon: <HomeOutlined />,
    },
    {
      key: '/me',
      title: 'Вход',
      icon: <UserOutline />,
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