import { RightOutlined } from "@ant-design/icons"
import { Input, Selector, Space, Form, Grid, Button, DatePicker } from "antd-mobile"
import { toJS } from "mobx"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import moment from "moment"



const Pickup: FC = observer(() => {
  const { cart } = useStore()
  const { timePick, datePick, availableTimeRange, date, setDate } = cart
  return <Form>
    <DatePicker
      cancelText='Закрыть'
      confirmText='Подтвердить'
      title='Выберите дату'
      visible={datePick.show}
      onClose={datePick.close}
      onConfirm={setDate}
      min={new Date()}
      value={date}
    />
    <DatePicker
      cancelText='Закрыть'
      confirmText='Подтвердить'
      precision='minute'
      title='Выберите время'
      visible={timePick.show}
      onClose={timePick.close}
      min={availableTimeRange.min}
      max={availableTimeRange.max}
      onConfirm={setDate}
      value={date}
    />
    <h2 className={styles.receptionType}>
      Заберу сам
    </h2>
    <Location />
    <Time />
    <Payment />
    <Details
      total={cart.totalPrice}
      count={cart.items.length}
    />
    <Button
      className={styles.orderButton}
      shape='rounded'
      color='primary'
    >
      Оплатить
    </Button>
  </Form>
})

const Delivery: FC = observer(() => {

  const { cart, reception } = useStore()
  const { selectLocationPopup: { open }, } = reception
  return <Form>
    <h2 className={styles.receptionType}>
      На доставку
    </h2>
    <Form.Item className={styles.addrInput} arrowIcon>
      <Input
        value={reception.address.road + ' ' + reception.address.house_number}
        placeholder='Укажите адрес доставки'
        onClick={open}
      />
    </Form.Item>
    <Slots />
    <Payment />
    <Details
      total={cart.totalPrice}
      count={cart.items.length}
    />
    <Button
      className={styles.orderButton}
      shape='rounded'
      color='primary'
    >
      Оплатить
    </Button>
  </Form>
})

const OrderForm = {
  Pickup,
  Delivery
}

const Round = (num: number) =>
  Math.ceil(num * 100) / 100
export default OrderForm

type DetailsProps = { total: number, count: number }
const Details: FC<DetailsProps> = props => {
  return <Grid columns={2} className={styles.detail}>
    <Grid.Item>
      {props.count + ' товаров'}
    </Grid.Item>
    <Grid.Item className={styles.detailRight}>
      {Round(props.total) + ' ₽'}
    </Grid.Item>
    <Grid.Item>
      Доставка
    </Grid.Item>
    <Grid.Item className={styles.detailRight}>
      0 ₽
    </Grid.Item>
    <Grid.Item>
      Стоимость заказа
    </Grid.Item>
    <Grid.Item className={styles.detailRight}>
      {Round(props.total) + ' ₽'}
    </Grid.Item>
  </Grid>
}

const Payment: FC = observer(() => {
  const { cart } = useStore()
  const { method, paymentIcons, paymentLabels, selectMethodPopup } = cart.payment
  return <Form.Item
    className={styles.payMethod}
    label='Способ оплаты'
    onClick={selectMethodPopup.open}
    clickable={false}
  >
    <Space className={styles.payTodo} justify='between' align='center'>
      <Space align='center'>
        {method && toJS(paymentIcons[method])}
        <span>
          {method
            ? paymentLabels[method]
            : "Выберите способ оплаты"
          }
        </span>
      </Space>
      <RightOutlined />
    </Space>
  </Form.Item>
})


const Time: FC = observer(() => {
  const { cart } = useStore()
  const { date, datePick, timePick } = cart
  
  const css = { "--gap": '1.25rem', fontSize: '20px' }
  return <Form.Item
    label='Время выдачи'
    className={styles.slotSelect}
  >
    <Space style={css}>
      <span onClick={datePick.open}>
        {moment(date).format('DD-MM-YYYY')}
      </span>
      <span onClick={timePick.open}>
        {moment(date).format('HH:mm')}
      </span>
    </Space>
  </Form.Item>
})
const Slots: FC = observer(() => {
  const { cart } = useStore()
  return <Form.Item
    label='Время доставки'
    className={styles.slotSelect}
  >
    <div className={styles.selectWrap}>
      <Selector
        options={cart.slots.computedSlots.map(slot => ({
          label: slot.Name,
          value: slot.VCode,
        }))}
        onChange={([vcode]) => cart.slots.setSelectedSlot(vcode)}
        value={cart.slots.selectedSlot
          ? [cart.slots.selectedSlot.VCode]
          : undefined
        }
        showCheckMark={false}
        columns={cart.slots.computedSlots.length}
        style={{
          '--border-radius': '10px',
          '--checked-border': 'solid var(--adm-color-primary) 1px',
          '--padding': '8px 24px',
          width: 'max-content'
        }}
      />
    </div>
  </Form.Item>
})

const Location: FC = observer(() => {
  const { reception } = useStore()
  const { selectLocationPopup: { open }, } = reception
  return <Form.Item className={styles.addrInput} arrowIcon>
    <Input
      value={reception.currentOrganizaion?.Name}
      placeholder='Выберите точку самовывоза'
      onClick={open}
    />
  </Form.Item>
})