import { Form, Grid, Input, Popup, Selector, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useStore } from "../../features/hooks"
import { ReceptionType } from "../../stores/reception.store"
import styles from './OrderDetailPopup.module.css'
import SelectLocationPopup from "./SelectLocation"
import { toJS } from "mobx"
import { RightOutlined } from "@ant-design/icons"
import OrderForm from "../forms/Order/OrderForm"
import WaySelectorPopup from "./SelectPayMethod"

const OrderDetailPopup: FC = observer(() => {
  const { cart, reception } = useStore()
  const { selectLocationPopup: { show, close, open }, } = reception
  const { method, paymentIcons, paymentLabels } = cart.payment

  function getBody(rt: ReceptionType) {
    switch (rt) {
      case 'delivery':
        return <OrderForm.Delivery />

      case 'pickup':
        return <OrderForm.Pickup />
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
