import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { Button, NoticeBar } from "antd-mobile"
import styles from './CartPage.module.css'
import { useGoUTM, useStore, useTheme } from "../../../features/hooks"
import CartList from "./parts/CartList/CartList"
import CartHead from "./parts/CartHead/CartHead"
import Promocode from "./parts/Promocode/Promocode"
import NoteToOrder from "./parts/NoteForOrder/NotForOrder"
import OrderDetailPopup from "../../popups/OrderDetailPopup"
import YoukassaPopup from "../../popups/YookassaPopup"
import { Congratilations, NiceToMeetYooPopup } from "../../popups/CartActions"
import AuthRequiredPopap from "../../popups/AuthRequired"
import Recomendations from "./parts/Recomendations/Recomendation"
import AdaptivePopup from "../../common/Popup/Popup"
import { AllCampaignUser, CouseInCart } from "../../../stores/cart.store"
import FireIco from '../../../assets/fire.png'

function getAllCampaignsFromCart(
  items: CouseInCart[], 
  allCampgns: AllCampaignUser[]
) {
  const result: AllCampaignUser[] = []
  items.forEach(item => {
    if(item.campaign) {
      const campaign = allCampgns.find(camp => camp.VCode === item.campaign)
      if(campaign) result.push(campaign)
    }
  })
  return result
}

const CartPopup: FC = observer(() => {
  const { theme } = useTheme()
  const go = useGoUTM()
  const { cart, reception, user } = useStore()
  const { MinSum } = user.info

  const allCampaigns = getAllCampaignsFromCart(cart.items, user.info.allCampaign)
  return (
    <AdaptivePopup
      visible={cart.cart.show}
      bodyClassName="cartPopup"
      noCloseBtn
      noBottomNav
      onClose={() => { go('/') }}
      bodyStyle={{
        borderTopLeftRadius:25,
        borderTopRightRadius:25
      }}
    >
      <CartHead />
      <div className={styles.cartPopup}>
        <CampaignsTooltip allCampaign={allCampaigns} />
        <NiceToMeetYooPopup />
        <YoukassaPopup />
        <AuthRequiredPopap />
        <Congratilations />
        <OrderDetailPopup />
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
              borderRadius: 15,
              "--border-color": theme === 'dark'
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
      </div>
    </AdaptivePopup>
  )
})

const Round = (num: number) =>
  Math.ceil(num * 100) / 100

export default CartPopup


const tooltipStyles: Record<string, CSSProperties> = {
  div: {
    fontFamily: 'Roboto', 
    fontSize: 17,
    lineHeight: '18px', 
    color: 'rgba(71, 174, 83, 1)',
    position: 'relative',
    marginBottom: '-1rem'
  },
  icon: {
    position: 'absolute',
    left: '-22px',
  },
  header: { fontWeight: 600 }, 
  text: { fontWeight: 400 }
}
const CampaignsTooltip: FC<{ allCampaign: AllCampaignUser[] }> = (props) => {
  if(!props.allCampaign.length) return null
  return <div style={tooltipStyles.div} className="ms-5">
    <img src={FireIco} style={tooltipStyles.icon} />
    {props.allCampaign.length
      ? <p style={tooltipStyles.header}>Вы участвуете в акции:</p>
      : null
    }
    {props.allCampaign.filter((campaign1, index, arr) =>
      arr.findIndex(campaign2 => (campaign2.VCode === campaign1.VCode)) === index
    ).map(campaigm => 
      <p key={campaigm.VCode} style={tooltipStyles.text}>{Prepare(campaigm.Name)}</p>
    )}
  </div>
}
const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''