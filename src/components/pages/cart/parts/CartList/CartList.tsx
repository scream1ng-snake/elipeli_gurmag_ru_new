import { List } from "antd-mobile"
import { FC } from "react"
import CartItem from "../CartItem/CartItem"
import { useGoUTM, useStore } from "../../../../../features/hooks"
import Metrics from "../../../../../features/Metrics"
import { CouseInCart } from "../../../../../stores/cart.store"
import { range } from "../../../../../features/helpers"

const CartList: FC = () => {
  const { cart, vkMiniAppMetrics, user } = useStore()
  const go = useGoUTM()
  function watchAnalog(item: CouseInCart) {
    cart.cart.close()
    cart.detailPopup.close()
    go('/categories/' + item.couse.CatVCode)
  }
  function deletePack(item: CouseInCart) {
    range(item.quantity).forEach(() => cart.removeFromCart(item.couse.VCode))
  }
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
        watchAnalog={() => watchAnalog(item)}
        deletePack={() => deletePack(item)}
      />
    )}
  </List>
}
export default CartList