import { Image, List, Skeleton, Space, Stepper } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { CouseInCart } from "../../../../../stores/cart.store";
import config from "../../../../../features/config";
import styles from './CartItem.module.css'
import Red from "../../../../special/RedText";
import { GiftOutline } from "antd-mobile-icons";
import { Gift } from "../../../../icons/Gift";

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
      prefix={<CartImage couseInCart={courseInCart} />}
      description={
        <div className={styles.PriceWeight}>
          <PriceCart courseInCart={courseInCart} />
          <span className={styles.Weight}>{courseInCart.couse.Weigth}</span>
        </div>
      }
      arrowIcon={
        <Space direction='vertical' align='center'>
          <Stepper
            disabled={courseInCart.present}
            value={courseInCart.quantity}
            style={{ borderRadius: 13 }}
            onChange={val =>
              val > courseInCart.quantity
                ? add()
                : remove()
            }
            max={!courseInCart.couse.NoResidue
              ? courseInCart.couse.EndingOcResidue
              : undefined
            }
          />
          {!courseInCart.couse.NoResidue
            ? <Red>
              <span style={{ fontSize: 14 }}>
                {'В наличии ' + courseInCart.couse.EndingOcResidue}
              </span>
            </Red>
            : null
          }
        </Space>
      }
    >
      {courseInCart.couse.Name}
    </List.Item>
  )
}
)

const CartImage: FC<{ couseInCart: CouseInCart }> = p => {
  const Loader: FC = () => <Skeleton className={styles.cartImg} style={{ margin: 0 }} animated />
  return <>
    <div style={{ position: 'relative' }}>
      {p.couseInCart.present
        ? <div style={{ position: 'absolute', right: -10, top: -10 }}>
          <Gift />
        </div>
        : null
      }
      <Image
        src={config.staticApi
          + '/api/v2/image/FileImage?fileId='
          + p.couseInCart.couse.CompressImages?.[0]
        }
        className={styles.cartImg}
        placeholder={<Loader />}
        fallback={<Loader />}
      />
    </div>
  </>
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