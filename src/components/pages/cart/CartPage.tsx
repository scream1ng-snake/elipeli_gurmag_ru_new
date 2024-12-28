import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { Button, NoticeBar, Popup } from "antd-mobile"
import styles from './CartPage.module.css'
import { useStore, useTheme } from "../../../features/hooks"
import CartList from "./parts/CartList/CartList"
import CartHead from "./parts/CartHead/CartHead"
import Promocode from "./parts/Promocode/Promocode"
import NoteToOrder from "./parts/NoteForOrder/NotForOrder"
import OrderDetailPopup from "../../popups/OrderDetailPopup"
import YoukassaPopup from "../../popups/YookassaPopup"
import { Congratilations, NiceToMeetYooPopup } from "../../popups/CartActions"
import AuthRequiredPopap from "../../popups/AuthRequired"
import Recomendations from "./parts/Recomendations/Recomendation"
import config from "../../../features/config"

const CartPage: FC = observer(() => {
  const { theme } = useTheme()
  const { cart, auth, reception, user } = useStore()
  const { MinSum } = user.info
  useEffect(() => {
    if(auth.isFailed) {
      auth.authRequired.open()
    } else {
      auth.authRequired.close()
    }
  }, [auth.isFailed])
  return (
    <>
      <YoukassaPopup />
      <AuthRequiredPopap />
      
      <Popup
        visible
        position='bottom'
        bodyClassName={styles.cartPopup}
        mask={false}
      >
        
        <Congratilations />
        <OrderDetailPopup />
        <CartHead />
        <h2 className={styles.cartText}>
          {cart.items.length + ' товаров на ' + Round(cart.totalPrice) + ' ₽'}
        </h2>
        <CartList />
        <Promocode />
        <h3 className={styles.noteText}>Пожелание к заказу</h3>
        <NoteToOrder />
        <Recomendations />
        {MinSum && (cart.totalPrice < MinSum) && reception.receptionType === 'delivery'
          ? <NoticeBar
              content={'Бесплатная доставка только для заказа от ' + MinSum + ' руб'}
              color='alert' 
              icon={null}
              wrap
              style={{
                width: 'calc(100% - 2rem)',
                margin: '0 1rem',
                borderRadius:15,
                "--border-color":  theme === 'dark'
                  ? "var(--tg-theme-secondary-bg-color)"
                  : "#fff9ed",
                "--background-color": theme === 'dark'
                  ? "var(--tg-theme-secondary-bg-color)"
                  : "#fff9ed",
                "--text-color": theme === 'dark'
                  ? "var(--gurmag-accent-color)"
                  : "var(--adm-color-orange)"
              }}  
            />
          : null
        }
        <Button
          shape='rounded'
          color='primary'
          className={styles.orderButton}
          onClick={cart.detailPopup.open}
          disabled={!cart.items.length || (!!MinSum && (cart.totalPrice < MinSum) && reception.receptionType === 'delivery')}
        >
          {'Оформить заказ на ' + Round(cart.totalPrice) + ' ₽'}
        </Button>
      </Popup>
      <NiceToMeetYooPopup />
    </>
  )
})

const Round = (num: number) =>
  Math.ceil(num * 100) / 100

export default CartPage