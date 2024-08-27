import { Image, Skeleton } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { AllCampaignUser, CouseInCart } from "../../../../../stores/cart.store";
import { Optional, Undef } from "../../../../../features/helpers";
import config from "../../../../../features/config";
import { AddOutline, MinusOutline } from "antd-mobile-icons";
import styles from './CartItem.module.css'

type P = {
  courseInCart: CouseInCart,
  add: () => void,
  remove: () => void,
  campaignAllInfo: Undef<AllCampaignUser>,
  text: Optional<string>
}
const CartItem: FC<P> = observer(({ courseInCart, add, remove, ...rest }) => {
  const { campaignAllInfo, text } = rest

  const ImagePreloader = () =>
    <Skeleton animated className={styles.cart_item_image} />


  function campagnName() {
    return campaignAllInfo
      ? <span className={styles.campaign_text}>
          {`Акция - ${replaceSymbols(campaignAllInfo.Name)}`}
        </span>
      : null
  }
  function campagnDescriprion() {
    return <span className={styles.campaign_text}>{text}</span>
  }

  return (
    <div className={styles.cart_item}>
      <div className={styles.cart_item_image}>
        <Image
          src={config.apiURL
            + '/api/v2/image/Material?vcode='
            + courseInCart.couse.VCode
            + '&compression=true'
          }
          placeholder={<ImagePreloader />}
          fallback={<ImagePreloader />}
          className={styles.cart_item_image}
          fit='cover'
        />
      </div>

      <div className={styles.cart_item_body}>
        <div>
          <span>{courseInCart.couse.Name}</span>
        </div>
        {campagnName()}
        {campagnDescriprion()}

        <div className="row">
          {courseInCart.priceWithDiscount >= courseInCart.couse.Price * courseInCart.quantity
            ? null
            : <s>{`${Math.ceil((courseInCart.couse.Price * courseInCart.quantity) * 100) / 100} руб.`}</s>
          }
          <div className={styles.cout}>
            <MinusOutline
              onClick={remove}
            />
            <span className={styles.count}>{courseInCart.quantity}</span>
            <AddOutline
              onClick={add}
            />
          </div>
          <h5>{`${Math.ceil(courseInCart.priceWithDiscount * 10) / 10} ₽`}</h5>
        </div>
        {courseInCart.couse.NoResidue
          ? null
          : courseInCart.couse.EndingOcResidue < courseInCart.quantity
            ? <div
              style={{
                position: 'absolute',
                right: '0px',
                bottom: '0px',
                borderBottomRightRadius: '8px',
                borderTopLeftRadius: '8px',
                padding: '0.1rem',
                background: 'var(--adm-color-warning)',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',

              }}
            >
              <p>{`сегодня осталось ${courseInCart.couse.EndingOcResidue}`}</p>
            </div>
            : null
        }

      </div>
    </div>
  )
}
)

const replaceSymbols = (str: string) =>
  str.replace(/ *\{[^}]*\} */g, "")


export default CartItem;