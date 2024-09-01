import { Button, Image, List, Skeleton } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { AllCampaignUser, CouseInCart } from "../../../../../stores/cart.store";
import { Undef } from "../../../../../features/helpers";
import config from "../../../../../features/config";
import { AddOutline, MinusOutline } from "antd-mobile-icons";
import styles from './CartItem.module.css'

type P = {
  courseInCart: CouseInCart,
  add: () => void,
  remove: () => void,
}
const CartItem: FC<P> = observer(props => {
  const { courseInCart, add, remove } = props


  return (
    <List.Item
      className={styles.cartItem}
      prefix={<CartImage VCode={courseInCart.couse.VCode} />}
      description={
        <div className={styles.PriceWeight}>
          <PriceCart courseInCart={courseInCart} />
          <span className={styles.Weight}>{courseInCart.couse.Weigth}</span>
        </div>
      }
      arrowIcon={
        <PlusMinus
          add={add}
          remove={remove}
          courseInCart={courseInCart}
        />
      }
    >
      {courseInCart.couse.Name}
    </List.Item>
  )
}
)

const CartImage: FC<{ VCode: number }> = p => {
  const Loader: FC = () => <Skeleton />
  return (
    <Image
      src={config.staticApi
        + '/api/v2/image/Material?vcode='
        + p.VCode
        + '&compression=true'
      }
      className={styles.cartImg}
      placeholder={<Loader />}
      fallback={<Loader />}
    />
  )
}

const PlusMinus: FC<Pick<P, 'add' | 'remove' | 'courseInCart'>> = props => {
  return <div className={styles.PlusMinus}>
    <Button size='small' onClick={props.remove}>
      <MinusOutline />
    </Button>
    <span>{props.courseInCart.quantity}</span>
    <Button size='small' onClick={props.add}>
      <AddOutline />
    </Button>
  </div>
}

const PriceCart: FC<Pick<P, 'courseInCart'>> = props => {
  const { priceWithDiscount, quantity } = props.courseInCart
  const { Price } = props.courseInCart.couse
  return priceWithDiscount < Price * quantity
    ? <span className={styles.Price}>
      <span className={styles.hotPrice}>{Round(priceWithDiscount) + ' ₽'}</span>
      {' '}
      <span><s>{Round(Price * quantity) + ' ₽'}</s></span>
    </span>
    : <span className={styles.Price}>{Round(Price * quantity) + ' ₽'}</span>
}

const replaceSymbols = (str: string) =>
  str.replace(/ *\{[^}]*\} */g, "")

const Round = (num: number) =>
  Math.ceil(num * 100) / 100

export default CartItem;