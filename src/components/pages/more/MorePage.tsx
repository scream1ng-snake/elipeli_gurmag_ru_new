import { List, NavBar } from 'antd-mobile';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { LocationFill, MessageOutline, RedoOutline, UserCircleOutline } from 'antd-mobile-icons';
import { PhoneOutlined } from '@ant-design/icons';
import Wrapper from '../../layout/Wrapper';
import { useTelegram } from '../../../features/hooks';

const MorePage: FC = observer(() => {
  const tg = useTelegram()
  const go = useNavigate()
  return (
    <Wrapper>
      <NavBar onBack={() => { go(-1) }}>
        Еще
      </NavBar>
      <List style={{ borderRadius: 20, overflow: 'hidden' }}>
        <List.Item prefix={<LocationFill style={icoStyle} />}>
          Уфа
        </List.Item>
        <List.Item
          clickable={false}
          prefix={<PhoneOutlined style={icoStyle} />}
          onClick={() => {
            window.open('tel:89870401199')
          }}
        >
          8-987-040-11-99
        </List.Item>
        <List.Item
          clickable={false}
          prefix={<MessageOutline style={icoStyle} />}
          onClick={() => {
            tg.isInTelegram()
              ? tg.tg.openTelegramLink('https://t.me/+79870401199')
              : window.open('https://wa.me/+79870401119')
          }}
        >
          Поддержка
        </List.Item>
        <List.Item
          clickable={false}
          prefix={<UserCircleOutline style={icoStyle} />}
          onClick={() => go('/me')}
        >
          Профиль
        </List.Item>
        <List.Item
          clickable={false}
          prefix={<RedoOutline style={icoStyle} />}
          onClick={() => go('/orders')}
        >
          История заказов
        </List.Item>
      </List>

    </Wrapper>
  )
})

const icoStyle = {
  fontSize: '24px',
  color: 'var(--gurmag-accent-color)',
  marginRight: '10px'
}

export default MorePage