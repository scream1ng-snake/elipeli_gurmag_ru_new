import { useState } from "react"
import { Container } from "react-bootstrap"
import { WithChildren } from "../../features/helpers"
import { Badge, List, Space } from "antd-mobile"
import { HomeOutlined, MoreOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { useGoUTM, useStore } from "../../features/hooks"
import { GiftOutline, UserOutline } from "antd-mobile-icons"

function NavButton(props: WithChildren) {
  const [show, setShow] = useState(false)
  function toggle() {
    setShow(!show)
  }
  const { cart, auth, user } = useStore()
  const go = useGoUTM()

  const setRouteActive = (value: string) => {
    go(value)
    toggle()
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
  return (
    <>
      <div onClick={toggle}>
        {props.children}
      </div>
      {!show
        ? null
        : <div style={{ position: 'fixed', left: 0, right: 0 }}>
          <Container>
            <Space style={{ width: '100%' }} justify="end">
              <List style={{ borderRadius: 15, overflow: 'hidden' }}>
                {tabs.map(tab => {
                  return <List.Item 
                    clickable={false}
                    key={tab.key}
                    extra={tab.icon}
                    onClick={() => { setRouteActive(tab.key) }}
                  >
                    {tab.title}
                  </List.Item>
                })}
              </List>
            </Space>
          </Container>
        </div>
      }
    </>
  )
}
export default NavButton