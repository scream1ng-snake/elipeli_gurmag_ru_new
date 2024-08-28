import { Popup } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useStore } from "../../features/hooks"
import { ReceptionType } from "../../stores/reception.store"
import styles from './OrderDetailPopup.module.css'

const OrderDetailPopup: FC = observer(() => {
  const { cart, reception } = useStore()

  function getBody(rt: ReceptionType) {
    switch (rt) {
      case 'delivery':
        
        return
    
      case 'pickup':
        return
    }
  }
  return <Popup
    visible={cart.detailPopup.show}
    onClose={cart.detailPopup.close}
    onMaskClick={cart.detailPopup.close}
    bodyClassName={styles.detailPopup}
    position='bottom'
  >
    {/* {getBody(reception.receptionType)} */}
  </Popup>
})


export default OrderDetailPopup