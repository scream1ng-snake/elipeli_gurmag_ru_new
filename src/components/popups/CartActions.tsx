import { ActionSheet, Dialog, Space } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useStore } from "../../features/hooks";
import type {
  Action
} from 'antd-mobile/es/components/action-sheet'
import moment from "moment";
import { useNavigate } from "react-router-dom";


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

// Dialog.show({
//   title: 'Такой заказ сегодня не доступен((',
//   content: 'Сегодня закончились: '
//     + lostCourses.map(lc => lc.Name).join(', '),
//   closeOnAction: true,
//   closeOnMaskClick: true,
//   actions: [{
//     key: 'tomorrow',
//     text: 'Заказать на завтра ' + moment(this.date)
//       .add(1, 'days')
//       .format('YYYY-MM-DD HH:mm'),
//     onClick: () => {
//       const tomorrow = moment(this.date).add(1, 'days').toDate();
//       this.setDate(tomorrow);
//       this.prePostOrder(go)
//     }
//   }, {
//     key: 'anotherDate',
//     text: 'Выбрать другую дату',
//     onClick: () => { this.datePick.open() }
//   }, {
//     key: 'back',
//     text: 'Назад',
//   }]
// })