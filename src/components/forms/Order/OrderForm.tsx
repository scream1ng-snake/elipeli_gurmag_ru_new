import { Input, Space, Form, Grid, Button, DatePicker, NoticeBar, Image } from "antd-mobile"
import { toJS } from "mobx"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useGoUTM, useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import moment from "moment"
import Red from "../../special/RedText"
import BankCard from '../../../assets/BankCard.png'
import Cash from '../../../assets/Cash.png'
import { PaymentMethod } from "../../../stores/payment.store"
import { ReceptionType } from "../../../stores/reception.store"



const Pickup: FC<{ deliveryPrice: number | undefined }> = observer((props) => {
  const go = useGoUTM()
  function gotoAuth() {
    go("/authorize", { fromPostOrder: 'true' })
  }
  const { cart, reception } = useStore()
  const { timePick, datePick, availableTimeRange, date, setDate } = cart
  const isValid = reception.currentOrganizaion
    && cart.payment.method
  return <Form className="orderDetailForm">
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
    <div
      style={{
        background: 'var(--tg-theme-bg-color)',
        paddingTop: 5
      }}
    >
      <Details
        total={cart.totalPrice}
        count={cart.items.length}
        deliveryPrice={props.deliveryPrice}
        receptionType={reception.receptionType}
      />
      <Button
        className={styles.orderButton}
        shape='rounded'
        color='primary'
        disabled={!isValid}
        loading={cart.postOrder.state === 'LOADING'}
        onClick={() => cart.prePostOrder(gotoAuth)}
      >
        Подтвердить
      </Button>
      <br />
      <br />
      <br />
    </div>
  </Form>
})

const Delivery: FC<{ deliveryPrice: number | undefined }> = observer(props => {
  const go = useGoUTM()
  function gotoAuth() {
    go("/authorize", { fromPostOrder: 'true' })
  }
  const { cart, reception } = useStore()
  const { datePick, date, setDate } = cart
  const { selectLocationPopup2: { open }, Location } = reception

  const { road, house_number } = Location.confirmedAddress
  const isValid = road && house_number
    && cart.slots.selectedSlot
    && cart.payment.method

  return <Form className="orderDetailForm">
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
    <h2 className={styles.receptionType}>
      На доставку
    </h2>
    <Form.Item className={styles.addrInput} arrowIcon onClick={open} clickable={false}>
      <Input
        value={road
          ? road + ' ' + house_number
          : ''
        }
        placeholder='Укажите адрес доставки'
        onClick={e => e.preventDefault()}
      />
      {!road && !house_number
        ? <Red>*адрес не выбран</Red>
        : null
      }
    </Form.Item>
    <Slots />
    <Payment />
    <Details
      deliveryPrice={props.deliveryPrice}
      receptionType={reception.receptionType}
      total={cart.totalPrice}
      count={cart.items.length}
    />
    <Button
      className={styles.orderButton}
      shape='rounded'
      color='primary'
      disabled={!isValid}
      onClick={() => cart.prePostOrder(gotoAuth)}
    >
      Подтвердить
    </Button>
    <br />
    <br />
    <br />
  </Form>
})

const OrderForm = {
  Pickup,
  Delivery
}

const Round = (num: number) =>
  Math.ceil(num * 100) / 100
export default OrderForm

type DetailsProps = { 
  total: number, 
  count: number, 
  deliveryPrice: number | undefined,
  receptionType: ReceptionType
}
const Details: FC<DetailsProps> = ({ total, count, deliveryPrice, receptionType }) => {
  const totalSum = (receptionType === 'delivery' && deliveryPrice)
    ? total
      ? total + deliveryPrice
      : 0
    : total
  return <Grid columns={2} className={styles.detail}>
    <Grid.Item>
      {count + ' товаров'}
    </Grid.Item>
    <Grid.Item className={styles.detailRight}>
      {Round(total) + ' ₽'}
    </Grid.Item>
    {deliveryPrice && receptionType === 'delivery'
      ? <> 
        <Grid.Item>
          Доставка
        </Grid.Item>
        <Grid.Item className={styles.detailRight}>
          {deliveryPrice + ' ₽'}
        </Grid.Item>
      </>
      : null
    }
    
    <Grid.Item>
      Стоимость заказа
    </Grid.Item>
    <Grid.Item className={styles.detailRight}>
      {Round(totalSum) + ' ₽'}
    </Grid.Item>
  </Grid>
}

const Payment: FC = observer(() => {
  const { cart, reception } = useStore()
  const { receptionType } = reception
  const { method, paymentIcons, paymentLabels, setMethod, availableMethods } = cart.payment
  
  const methods = Object.keys(availableMethods[receptionType])

  const style: CSSProperties = {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: 400,
    lineHeight: '16.67px',
    marginLeft: 19,
    marginTop: 10,
    marginBottom: 4
  }

  const css: CSSProperties = {
    fontFamily: 'Arial',
    fontSize: 19,
    fontWeight: 400,
    width: 160,
    height: 61,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--tg-theme-bg-color)',
    borderRadius: 10,
    flex: '0 0 auto',
    marginRight: 7
  }

  return <>
    <h5 style={style} >Способ оплаты</h5>
    <Space className="asdfg" style={{ '--gap-horizontal': '0px', width: '100%' }}>
      {methods.map(met => 
        <Space 
          key={met}
          onClick={() => setMethod(met as PaymentMethod)}
          style={{ 
            ...css, 
            border: met === method 
              ? '2px solid rgba(231, 129, 35, 1)'
              : '1px solid rgba(173, 173, 175, 1)' 
          }} 
          justify='around'
        >
          <Image src={paymentIcons[met as PaymentMethod]} />
          <span>{paymentLabels[met as PaymentMethod]}</span>
        </Space>
      )}

    </Space>
    {/* <Form.Item
      className={styles.addrInput + ' payment_select'}
      arrowIcon
      onClick={selectMethodPopup.open}
      clickable={false}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {method && toJS(paymentIcons[method])}
        {method
          ? paymentLabels[method]
          : "Выберите способ оплаты"
        }
      </div>

    </Form.Item> */}
    <div style={{ marginLeft: 20, height: 35, fontSize: 14.5 }}>
      {!method
        ? <Red>*метод оплаты не выбран</Red>
        : null
      }
    </div>
  </>
})


const Time: FC = observer(() => {
  const { cart } = useStore()
  const { date, datePick, timePick } = cart

  const css: CSSProperties = {
    fontFamily: 'Arial',
    fontSize: 21,
    fontWeight: 400,
    lineHeight: '24.15px',
    textAlign: 'center',
    textUnderlinePosition: 'from-font',
    textDecorationSkipInk: 'none',
    width: 124,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--tg-theme-bg-color)',
    borderRadius: 8
  }

  const orangeBorder = {
    border: '1px solid rgba(213, 153, 19, 1)'
  }

  const shadow = {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.25)'
  }
  return <>
    <Space className="asdfg" style={{ '--gap-horizontal': '14px' }}>
      <Form.Item
        label='Дата выдачи'
        className={styles.slotSelect + ' slot_select'}
      >
        <div style={{ ...css, ...orangeBorder }} onClick={datePick.open}>
          {
            moment(date).isSame(new Date(), 'day')
              ? 'Сегодня'
              : moment(date).format('DD-MM-YYYY')
          }
        </div>
      </Form.Item>
      <Form.Item
        label='Время выдачи'
        className={styles.slotSelect + ' slot_select'}
      >
        <div style={{ ...css, ...shadow }} onClick={timePick.open}>
          {moment(date).format('HH:mm')}
        </div>
      </Form.Item>
    </Space>
    {moment(date).isSame(new Date(), 'day')
      ? null
      : <NoticeBar
        content={'Обратите внимание - Вы делаете заказ \n на другой день (не сегодня)!'}
        color='alert'
        icon={null}
        wrap
        style={{
          width: 'calc(100% - 2rem)',
          margin: '0 1rem',
          borderRadius: 15,
          "--border-color": "rgba(252, 228, 158, 1)",
          "--background-color": "rgba(252, 228, 158, 1)",
          "--text-color": "rgba(0, 0, 0, 1)"
        }}
      />
    }

  </>
})
const Slots: FC = observer(() => {
  const { cart } = useStore()
  const { datePick, date } = cart

  const css: CSSProperties = {
    fontFamily: 'Arial',
    fontSize: 21,
    fontWeight: 400,
    lineHeight: '24.15px',
    textAlign: 'center',
    textUnderlinePosition: 'from-font',
    textDecorationSkipInk: 'none',
    width: 124,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--tg-theme-bg-color)',
    borderRadius: 8,
    flex: '0 0 auto',
    marginRight: 7
  }

  const shadow = {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.25)'
  }

  const orangeBorder = {
    border: '1px solid rgba(213, 153, 19, 1)'
  }
  return <>
    <Space className="asdfg" style={{ '--gap-horizontal': '14px', width: '100%' }}>
      <Form.Item
        label='Дата выдачи'
        className={styles.slotSelect + ' slot_select'}
      >
        <div style={{ ...css, ...orangeBorder }} onClick={datePick.open}>
          {
            moment(date).isSame(new Date(), 'day')
              ? 'Сегодня'
              : moment(date).format('DD-MM-YYYY')
          }
        </div>
      </Form.Item>

    </Space>
    {moment(date).isSame(new Date(), 'day')
      ? null
      : <NoticeBar
        content={'Обратите внимание - Вы делаете заказ \n на другой день (не сегодня)!'}
        color='alert'
        icon={null}
        wrap
        style={{
          width: 'calc(100% - 2rem)',
          margin: '0 1rem',
          borderRadius: 15,
          "--border-color": "rgba(252, 228, 158, 1)",
          "--background-color": "rgba(252, 228, 158, 1)",
          "--text-color": "rgba(0, 0, 0, 1)"
        }}
      />
    }
    <div className="asdfg" style={{ width: '100%' }}>
      <label>Время выдачи</label>
      {!cart.slots.computedSlots.length
        ? <NoticeBar icon={null} content='слотов нет' color='alert' />
        : <div style={{ width: 'calc(100% - 1rem)', display: 'flex', overflow: 'scroll' }}>
          {cart.slots.computedSlots.map(slot =>
            <div key={slot.VCode} style={{ ...css, ...shadow, border: cart.slots.selectedSlot?.VCode === slot.VCode ? '1px solid rgba(213, 153, 19, 1)' : 'none' }} onClick={() => cart.slots.setSelectedSlot(slot.VCode)}>
              <p>{slot.Name}</p>
            </div>
          )}
        </div>
      }
    </div>
    <div style={{ marginLeft: 19 }}>
      {!cart.slots.selectedSlot
        ? <Red>*слот не выбран</Red>
        : null
      }
    </div>
  </>
})

const Location: FC = observer(() => {
  const { reception } = useStore()
  const { selectLocationPopup2: { open }, } = reception
  return <Form.Item className={styles.addrInput} arrowIcon onClick={open} clickable={false}>
    <Input
      value={reception.currentOrganizaion?.Name}
      placeholder='Выберите точку самовывоза'
      onClick={e => e.preventDefault()}
    />
    {!reception.currentOrganizaion
      ? <Red>*точка самовывоза не выбрана</Red>
      : null
    }
  </Form.Item>
})