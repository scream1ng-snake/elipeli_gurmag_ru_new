import { List } from "antd-mobile"
import { FC } from "react"
import CartItem from "../CartItem/CartItem"
import { useStore } from "../../../../../features/hooks"
import Metrics from "../../../../../features/Metrics"

const CartList: FC = () => {
  const { cart, vkMiniAppMetrics, user } = useStore()
  return <List>
    {cart.presents.map(present => 
      <CartItem
        isPresent={true}
        key={`${present.couse.VCode}_${present.quantity}_present`}
        courseInCart={present}
        add={() => {
          cart.addPresentToCart(present.couse)
        }}
        remove={() => cart.removePresentFromCart(present.couse.VCode)}
      />
    )}
    {cart.items.map(item =>
      <CartItem
        isPresent={item.priceWithDiscount === 0}
        key={`${item.couse.VCode}_${item.quantity}_item`}
        courseInCart={item}
        add={() => {
          cart.addCourseToCart(item.couse)
          Metrics.addToCart(item.couse)
          vkMiniAppMetrics.addToCart(user.ID || '')
        }}
        remove={() => cart.removeFromCart(item.couse.VCode)}
      />
    )}
  </List>
}
export default CartList