import { Popup } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStore } from "../../features/hooks"
import { logger } from "../../features/logger"



const YoukassaPopup: FC = observer(() => {
  const { cart } = useStore()
  const { youkassaPopup, checkoutWidget } = cart.payment

  const hide = () => {
    checkoutWidget.destroy()
    cart.postOrder.setState('FAILED')
    cart.detailPopup.close()
    logger.log('Платеж отменен', "Yookassa-Popup")
    youkassaPopup.close()
  }
  return (
    <Popup
      position='bottom'
      visible={youkassaPopup.show}
      showCloseButton
      onClose={hide}
      onMaskClick={hide}
      style={{ zIndex: 1000 }}
      bodyStyle={{
        width: '100vw',
        height: '100vh',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15
      }}
    >
      <h2 style={{ margin: '2rem 0 1rem 2rem' }}>Оплата:</h2>
      <div id="payment-form"></div>
    </Popup>
  )
  
})

export default YoukassaPopup