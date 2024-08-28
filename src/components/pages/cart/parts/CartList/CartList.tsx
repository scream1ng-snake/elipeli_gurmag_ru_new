import { List } from "antd-mobile"
import { FC } from "react"
import CartItem from "../CartItem/CartItem"
import { useStore } from "../../../../../features/hooks"

const CartList: FC = () => {
  const { cart } = useStore()
  return <List>
    {cart.items.map((item, index) =>
      <CartItem
        key={index}
        courseInCart={item}
        add={() => cart.addCourseToCart(item.couse)}
        remove={() => cart.removeFromCart(item.couse.VCode)}
      />)}
  </List>
}
export default CartList