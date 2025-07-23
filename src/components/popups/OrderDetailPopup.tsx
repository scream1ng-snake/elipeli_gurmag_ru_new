import { Popup } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStore } from "../../features/hooks"
import { ReceptionType } from "../../stores/reception.store"
import styles from './OrderDetailPopup.module.css'
import SelectLocationPopup from "./SelectLocation"
import OrderForm from "../forms/Order/OrderForm"
import WaySelectorPopup from "./SelectPayMethod"
import AskLocation from "./AskLocation"
import CartActions from "./CartActions"
import { FullscreenLoading } from "../common/Loading/Loading"
import AdaptivePopup from "../common/Popup/Popup"

const OrderDetailPopup: FC<{ deliveryPrice: number | undefined }> = observer((props) => {
  const { cart, reception } = useStore()
  const { selectLocationPopup2: { show, close }, } = reception

  function getBody(rt: ReceptionType) {
    switch (rt) {
      case 'delivery':
        return <OrderForm.Delivery deliveryPrice={props.deliveryPrice} />

      case 'pickup':
        return <OrderForm.Pickup deliveryPrice={props.deliveryPrice} />

      case 'initial': 
        return <AskLocation />
    }
  }
  return <AdaptivePopup
    visible={cart.detailPopup.show}
    onClose={cart.detailPopup.close}
    bodyClassName={styles.detailPopup}
    noBottomNav
    noCloseBtn
    noShtorka
    desktopBodyStyle={{
      maxHeight: '90vh',
      overflowY: 'scroll'
    }}
  >
    <Shtorka />
    {cart.postOrder.state === 'LOADING' && <FullscreenLoading />}
    <WaySelectorPopup 
      show={cart.payment.selectMethodPopup.show}
      close={cart.payment.selectMethodPopup.close} 
    />
    <SelectLocationPopup
      show={show}
      close={close}
      onContinue={close}
    />
    <CartActions />
    {getBody(reception.receptionType)}
  </AdaptivePopup>
})


export default OrderDetailPopup


const Shtorka: FC = () => {
  return <div style={{ position: 'relative', width: '100%' }}>
    <div 
      style={{
        position: 'absolute',
        background: 'rgba(199, 199, 199, 1)',
        height:4,
        width:35,
        borderRadius:100,
        top:5,
        left: '50%',
        translate: '-50%'
      }}
    />
  </div>
}