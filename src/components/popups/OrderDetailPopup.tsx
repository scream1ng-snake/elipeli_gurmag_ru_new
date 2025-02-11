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

const OrderDetailPopup: FC = observer(() => {
  const { cart, reception } = useStore()
  const { selectLocationPopup: { show, close }, } = reception

  function getBody(rt: ReceptionType) {
    switch (rt) {
      case 'delivery':
        return <OrderForm.Delivery />

      case 'pickup':
        return <OrderForm.Pickup />

      case 'initial': 
        return <AskLocation />
    }
  }
  return <Popup
    visible={cart.detailPopup.show}
    onClose={cart.detailPopup.close}
    onMaskClick={cart.detailPopup.close}
    bodyClassName={styles.detailPopup}
    position='bottom'
  >
    <Shtorka />
    {cart.postOrder.state === 'LOADING' && <FullscreenLoading />}
    <SelectLocationPopup
      show={show}
      close={close}
      onContinue={reception.selectLocationPopup.close}
    />
    <WaySelectorPopup />
    <CartActions />
    {getBody(reception.receptionType)}
  </Popup>
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