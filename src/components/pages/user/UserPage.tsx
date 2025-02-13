import { observer } from "mobx-react-lite";
import { FC } from "react";
import Wrapper from "../../layout/Wrapper";
import { useGoUTM, useStore } from "../../../features/hooks";
import { Avatar, List, NavBar } from "antd-mobile";
import { GiftOutline, RedoOutline } from "antd-mobile-icons";
import { Container } from "react-bootstrap";
import { Burger } from "../../layout/NavButton";
import BottomNav from "../../common/BottomNav/BottomNav";


const UserPage: FC = observer(() => {
  const go = useGoUTM()
  const { user } = useStore()
  return <Wrapper>
    <Container>
      <NavBar onBack={() => { go('/') }} right={<Burger />}>
        Вы
      </NavBar>
      <List style={{ borderRadius: 20, overflow: 'hidden' }}>
        <List.Item
          prefix={
            <Avatar
              src=''
              style={{
                borderRadius: 20,
                width: 40,
                height: 40,
              }}
              fit='cover'
            />
          }
          description={user.info.userName}
        >
          {user.info.Phone}
        </List.Item>
        <List.Item prefix={<GiftOutline style={icoStyle} />}>
          {'Вам доступно ' + user.info.userBonuses + ' бонусов'}
        </List.Item>
        <List.Item
          prefix={<RedoOutline style={icoStyle} />}
          onClick={() => go('/orders')}
        >
          История заказов
        </List.Item>
      </List>
    </Container>
    <BottomNav />
  </Wrapper>
})

const icoStyle = {
  fontSize: '24px',
  color: 'var(--gurmag-accent-color)',
  marginRight: '10px'
}
export default UserPage