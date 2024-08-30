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

const OrderDetailPopup: FC = observer(() => {
  const { cart, reception } = useStore()
  const { selectLocationPopup: { show, close, open }, } = reception

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
    <SelectLocationPopup
      show={show}
      close={close}
      onContinue={reception.selectLocationPopup.close}
    />
    <WaySelectorPopup />
    {getBody(reception.receptionType)}
  </Popup>
})


export default OrderDetailPopup
