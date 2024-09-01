import { Checkbox, List, Popup } from "antd-mobile"
import { toJS } from "mobx"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStore } from "../../features/hooks"
import { PaymentMethod } from "../../stores/payment.store"


const WaySelectorPopup: FC = observer(() => {
  const { cart, reception, cart: { payment }} = useStore()
  const {
    method,
    paymentLabels,
    selectMethodPopup,
    availableMethods,
    paymentIcons,
    setMethod
  } = payment

  const { receptionType } = reception

  const hide = () => selectMethodPopup.close()

  const Way: FC<{ way: PaymentMethod, checked: boolean }> = props =>
    <List.Item
      clickable={false}
      key={props.way}
      prefix={toJS(paymentIcons[props.way])}
      extra={<Checkbox checked={props.checked} />}
      onClick={() => setMethod(props.way)}
      arrow={null}
    >
      {paymentLabels[props.way]}
    </List.Item>

  function renderWays() {
    return Object.keys(availableMethods[receptionType]).map(way => {
      switch (way as PaymentMethod) {
        case 'CARD_ONLINE':
          return <Way
            checked={way === method}
            way={way as PaymentMethod}
            key={way}
          />
        case 'CASH':
          return receptionType === 'pickup' && cart.totalPrice > 1000
            ? null
            : <Way
              checked={way === method}
              way={way as PaymentMethod}
              key={way}
            />

        default:
          return <Way
            checked={way === method}
            way={way as PaymentMethod}
            key={way}
          />
      }
    })
  }
  return (
    <Popup
      position='bottom'
      visible={selectMethodPopup.show}
      showCloseButton
      onClose={hide}
      onMaskClick={hide}
      style={{ zIndex: 1000 }}
      bodyStyle={{ width: '100vw', borderTopLeftRadius: 13, borderTopRightRadius: 13 }}
    >
      <h2 style={{ margin: '2rem 0 1rem 2rem' }}>Способ оплаты:</h2>
      <List style={{ margin: '0 1rem' }}>
        {renderWays()}
      </List>
    </Popup>
  )
})

export default WaySelectorPopup