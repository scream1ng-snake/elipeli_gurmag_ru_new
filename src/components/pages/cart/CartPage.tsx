import { observer } from "mobx-react-lite"
import { FC } from "react"
import Wrapper from "../../layout/Wrapper"
import { Button, Popup } from "antd-mobile"
import styles from './CartPage.module.css'
import { useStore } from "../../../features/hooks"
import CartList from "./parts/CartList/CartList"
import CartHead from "./parts/CartHead/CartHead"
import Promocode from "./parts/Promocode/Promocode"
import NoteToOrder from "./parts/NoteForOrder/NotForOrder"
import OrderDetailPopup from "../../popups/OrderDetailPopup"

const CartPage: FC = observer(() => {
  const { cart } = useStore()
  return (
    <Wrapper>
      <Popup
        visible
        position='bottom'
        bodyClassName={styles.cartPopup}
        mask={false}
      >
        <OrderDetailPopup />
        <CartHead />
        <h2 className={styles.cartText}>
          {cart.items.length + ' товаров на ' + Round(cart.totalPrice) + ' ₽'}
        </h2>
        <CartList />
        <Promocode />
        <h3 className={styles.noteText}>Пожелание к заказу</h3>
        <NoteToOrder />
        <Button 
          shape='rounded' 
          color='primary'
          className={styles.orderButton}
          onClick={cart.detailPopup.open}
          disabled={!cart.items.length}
        >
          {'Оформить заказ на ' + Round(cart.totalPrice) + ' ₽'}
        </Button>
      </Popup>
    </Wrapper>
  )
})

const Round = (num: number) =>
  Math.ceil(num * 100) / 100

export default CartPage