import { Button, Image, List, Skeleton, Space, Stepper } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { CouseInCart } from "../../../../../stores/cart.store";
import config from "../../../../../features/config";
import styles from './CartItem.module.css'
import Red from "../../../../special/RedText";
import { Gift } from "../../../../icons/Gift";
import Trash from '../../../../../assets/Trash.png'
import hotCampaign from '../../../../../assets/hotCampaign.png'
import { useTheme } from "../../../../../features/hooks";

type P = {
  courseInCart: CouseInCart,
  add: () => void,
  remove: () => void,
  isPresent: boolean,
  deletePack?: () => void,
  watchAnalog?: () => void,
}
const CartItem: FC<P> = observer(props => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const { courseInCart, add, remove, isPresent, deletePack, watchAnalog } = props
  const isEndingOut = !props.courseInCart.couse.NoResidue
    ? props.courseInCart.couse.EndingOcResidue <= 0
    : false

  const lessThanNeed = !props.courseInCart.couse.NoResidue
    ? props.courseInCart.couse.EndingOcResidue < props.courseInCart.quantity
    : false

  const isNotSystemCampaign = courseInCart.campaign != 36
  return (
    <List.Item
      className={styles.cartItem}
      prefix={<CartImage couseInCart={courseInCart} isPresent={isPresent} />}
      description={
        <div className={styles.PriceWeight}>
          <PriceCart courseInCart={courseInCart} />
          <span className={styles.Weight}>{courseInCart.couse.Weigth}</span>
        </div>
      }
      arrowIcon={isEndingOut
        ? <>
          <span style={{ fontSize: 14, position: 'absolute', bottom: 8, right: 17 }}><Red>Нет в наличии</Red></span>
          <Space direction='vertical' align='end'>
            <Space style={{ "--gap": "5px" }}>
              {deletePack && <Button 
                size='small' 
                shape='rounded' 
                style={{ background: isDarkMode ? '#232E3C' : 'rgba(242, 243, 247, 1)' }} 
                onClick={deletePack}
              >
                <img src={Trash} style={{ marginTop: -3, filter: isDarkMode ? 'grayscale(80%) invert(100%)' : 'none' }} />
              </Button>}
              {watchAnalog && <Button 
                size='small' 
                shape='rounded' 
                style={{ background: isDarkMode ? '#232E3C' : 'rgba(242, 243, 247, 1)' }}
                onClick={watchAnalog}
              >
                Заменить
              </Button>}
            </Space>
          </Space>
        </>
        : <>
        {courseInCart.campaign && isNotSystemCampaign
          ? <img src={hotCampaign} style={{ position: 'absolute', bottom: 4, right: 29 }} />
          : null
        }
          <Space direction='vertical' align='center'>
            <Stepper
              disabled={props.isPresent}
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
                <div style={{ fontSize: 14, marginBottom: courseInCart.campaign && isNotSystemCampaign ? 20 : 0 }}>
                  {'В наличии ' + courseInCart.couse.EndingOcResidue}
                </div>
              </Red>
              : null
            }
          </Space>
        </>
      }
    >
      {courseInCart.couse.Name}
    </List.Item>
  )
}
)

const CartImage: FC<{ couseInCart: CouseInCart, isPresent: boolean }> = p => {
  const Loader: FC = () => <Skeleton className={styles.cartImg} style={{ margin: 0 }} animated />
  return <>
    <div style={{ position: 'relative' }}>
      {p.isPresent
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