import { ActionSheet, Button, Dialog, Image, Popup, Space, Toast } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { CSSProperties, FC } from "react";
import { useStore } from "../../features/hooks";
import type {
  Action
} from 'antd-mobile/es/components/action-sheet'
import moment from "moment";
import { useNavigate } from "react-router-dom";
import BackIcon from "../icons/Back";
import { CloseOutline } from "antd-mobile-icons";
import { Message2 } from "../../stores/auth.store";
import { copyToClipboard } from "../../features/helpers";
import Pizza from '../../assets/pizza_huizza.png'
import Shtorka from "../common/Shtorka/Shtorka";


const popup = {
  width: 'calc(100vw - 2rem)',
  padding: '0.75rem 1rem',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
}

const boldText = { fontSize: 17, fontWeight: 700, lineHeight: '18.5px' }
const normalText = { fontSize: 16, fontWeight: 400, lineHeight: '17.5px' }
const badge = {
  background: 'rgba(1, 98, 65, 1)',
  borderRadius: 10,
  position: 'absolute',
  padding: '0.5rem 1rem',
  color: 'white',
  fontSize: 14,
  '--gap': '-10'
} as CSSProperties
export const NiceToMeetYooPopup: FC = observer(() => {
  const { auth: { niceToMeetYooPopup: { show, close, content } } } = useStore()
  let text: Message2 = {
    body1: '',
    body2: '',
    title: 'Наконец-то познакомились!',
    promo: ''
  }
  if (content) {
    text = JSON.parse(content.replaceAll("\\\"", "\""))
  }
  return <Popup
    visible={show}
    closeOnMaskClick
    onClose={close}
    bodyStyle={popup}
  >
    <Shtorka />

    <Space style={{ width: '100%' }} justify='between' align='center'>
      <BackIcon onClick={close} />
      <CloseOutline onClick={close} fontSize={20} />
    </Space>

    <br />
    <br />
    <p style={boldText}>{text.title.split('\\n').map((txt, index) => <span key={index}>{txt} <br /></span>)}</p>
    <br />
    <p style={normalText}>{text.body1.split('\\n').map((txt, index) => <span key={index}>{txt} <br /></span>)}</p>
    <br />
    <p style={normalText}>{text.body2.split('\\n').map((txt, index) => <span key={index}>{txt} <br /></span>)}</p>
    <br />
    <div style={{ position: 'relative' }}>
      {!text.promo.length
        ? null
        : <Space
          direction='vertical'
          style={badge}
          align='center'
          justify='center'
          onClick={() => {
            copyToClipboard(text.promo)
            Toast.show('Промокод скопирован')
          }}
        >
          <span>Промокод</span>
          <span style={{ fontSize: 30 }}>{text.promo}</span>
        </Space>
      }
      <Image 
        src={Pizza}
        style={{ marginRight: '-1rem' }} 
      />
      <Button
        fill='outline'
        onClick={() => {
          close()
          copyToClipboard(text.promo)
          Toast.show('Промокод скопирован')
        }}
        style={{
          width: '100%',
          background: 'rgba(1, 98, 65, 1)',
          color: 'white',
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 10,
          padding: '0.75rem', position: 'absolute', bottom: '1rem'
        }}
      >
        Получить подарок!
      </Button>
    </div>
  </Popup >
})

export const Congratilations: FC = observer(() => {
  const go = useNavigate()
  const { cart } = useStore()
  return <Dialog
    title='Поздравляем! Заказ оформлен!'
    visible={cart.congratilations.show}
    actions={[{
      key: 'ok',
      text: 'На главную',
      onClick: () => {
        cart.congratilations.close()
        go('/')
      }
    }, {
      key: 'myOrders',
      text: 'Мои заказы',
      onClick: () => {
        cart.congratilations.close()
        go('/orders')
      }
    }, {
      key: 'close',
      text: 'Закрыть',
      onClick: cart.congratilations.close,
    }]}
    bodyStyle={{ borderRadius: 13 }}
    onClose={cart.congratilations.close}
  />
})

const CartActions: FC = observer(() => {
  const { cart } = useStore()
  const { date, setDate, prePostOrder, datePick, items } = cart

  const lostCourses = items
    .filter(({ couse, quantity }) => couse.NoResidue ? false : quantity > couse.EndingOcResidue)
    .map(cic => cic.couse)

  const actions: Action[] = [{
    key: 'tomorrow',
    text: 'Заказать на завтра ' + moment(date)
      .add(1, 'days')
      .format('YYYY-MM-DD HH:mm'),
    onClick: () => {
      const tomorrow = moment(date).add(1, 'days').toDate();
      setDate(tomorrow);
      prePostOrder()
      cart.actionSheet.close()
    },
  }, {
    key: 'anotherDate',
    text: 'Выбрать другую дату',
    onClick: () => {
      cart.actionSheet.close()
      datePick.open()
    },
  }]
  return <ActionSheet
    extra={<Space direction='vertical'>
      <h2>Такой заказ сегодня не доступен((</h2>
      {lostCourses.map(lc => {
        return <p>{lc.Name + ' сегодня уже закончился;'}</p>
      })}
    </Space>}
    cancelText='Вернуться назад'
    visible={cart.actionSheet.show}
    actions={actions}
    onClose={cart.actionSheet.close}
    styles={{
      body: {
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
      }
    }}
  />
})
export default CartActions