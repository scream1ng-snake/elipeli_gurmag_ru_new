import { List } from "antd-mobile"
import { FC } from "react"
import CartItem from "../CartItem/CartItem"
import { useStore } from "../../../../../features/hooks"
import Metrics from "../../../../../features/Metrics"

const CartList: FC = () => {
  const { cart, vkMiniAppMetrics, user } = useStore()
  return <List>
    {cart.items.map((item, index) =>
      <CartItem
        key={index}
        courseInCart={item}
        add={() => {
          cart.addCourseToCart(item.couse)
          Metrics.addToCart(item.couse)
          vkMiniAppMetrics.addToCart(user.ID || '')
        }}
        remove={() => cart.removeFromCart(item.couse.VCode)}
      />)}
  </List>
}
export default CartList