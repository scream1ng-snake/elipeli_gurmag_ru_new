import { observer } from "mobx-react-lite"
import { CSSProperties, FC, LegacyRef, useRef, useState } from "react"
import { Button, Grid, NoticeBar, Popover, PopoverRef, Space } from "antd-mobile"
import styles from './CartPage.module.css'
import { useDeviceType, useGoUTM, useStore, useTheme } from "../../../features/hooks"
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
import infoCircle from '../../../assets/infoCircle.png'
import exclamation from '../../../assets/exclamation.png'
import { Void } from "../../layout/Void"
import DeliveryPriceInfoPopup from "../../popups/DeliveryPriceInfoPopup"
import { Maybe } from "../../../features/helpers"
import { CloseOutline } from "antd-mobile-icons"

function getAllCampaignsFromCart(
  items: CouseInCart[],
  allCampgns: AllCampaignUser[]
) {
  const result: AllCampaignUser[] = []
  items.forEach(item => {
    if (item.campaign) {
      const campaign = allCampgns.find(camp => camp.VCode === item.campaign)
      if (campaign) result.push(campaign)
    }
  })
  return result
}

const CartPopup: FC = observer(() => {
  const { theme } = useTheme()
  const go = useGoUTM()
  const { cart, reception, user } = useStore()
  const { MinSum } = user.info 
  const [showTooltip, setShowTooltip] = useState(false)

  const allCampaigns = getAllCampaignsFromCart(cart.items, user.info.allCampaign)
  return (
    <AdaptivePopup
      visible={cart.cart.show}
      bodyClassName="cartPopup"
      noCloseBtn
      noBottomNav
      onClose={() => { go('/') }}
      bodyStyle={{
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
      }}
    >
      <CartHead />
      <div className={styles.cartPopup}>
        {/* <DeliveryPriceInfoPopup /> todo */}
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
        {/* <Details 
          popClose={() => { setShowTooltip(false) }}
          popOpen={() => { setShowTooltip(true) }}
          popVisible={showTooltip}
        /> */}
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
        <BottomButton />
        <Void height="88px" />
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
  if (!props.allCampaign.length) return null
  return <div style={tooltipStyles.div} className="ms-5">
    {props.allCampaign.filter(c => c.VCode != "36").length
      ? <>
        <img src={FireIco} style={tooltipStyles.icon} />
        <p style={tooltipStyles.header}>Вы участвуете в акции:</p>
      </>
      : null
    }
    {props.allCampaign.filter((campaign1, index, arr) =>
      arr.findIndex(campaign2 => (campaign2.VCode === campaign1.VCode)) === index
    ).filter(campaign =>
      !campaign.Name.includes('РЕТРОБОНУСЫ')
    ).map(campaigm =>
      <p key={campaigm.VCode} style={tooltipStyles.text}>{Prepare(campaigm.Name)}</p>
    )}
  </div>
}
const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''


const BottomButton: FC = observer(() => {
  const { cart, reception, user } = useStore()
  const device = useDeviceType()
  const isNtMobile = device !== 'mobile'
  const { MinSum } = user.info
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--tg-theme-bg-color)',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: isNtMobile ? 25 : 0,
        borderBottomRightRadius: isNtMobile ? 25 : 0,
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* {reception.receptionType === 'delivery'
        ? <Space
          className="w-100"
          justify='between'
          align='center'
          style={{
            padding: '8px 18px 0px 18px',
            "--gap-horizontal": "3px"
          }}
          onClick={cart.deliveryPriceInfoPopup.open}
        >
          <img
            src={exclamation}
          />
          <span
            style={{
              fontFamily: 'Arial',
              fontWeight: '400',
              fontSize: '13px',
              lineHeight: '13px'
            }}
          >
            Доставка 299 ₽. Еще 165 ₽, и доставим за 199 ₽
          </span>
          <img
            src={infoCircle}
          />
        </Space>
        : null
      } todo*/}
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
  )
})


const detailStyle: Record<string, CSSProperties> = {
  detail: {
    fontFamily: 'Arial',
    fontWeight: '400',
    fontStyle: 'Regular',
    fontSize: '16px',
    lineHeight: '13px',
    padding:'7px 15px',
  },
  detailRight: {
    textAlign: 'end',
    marginBottom:22
  }
}
const Details: FC<{ popVisible: boolean, popOpen: () => void, popClose: () => void }> = (props) => {
  return <Grid columns={2} style={detailStyle.detail}>
    <Grid.Item>
      Скидки по акциям
    </Grid.Item>
    <Grid.Item style={detailStyle.detailRight}>
      0 ₽
    </Grid.Item>
    <Grid.Item>
      <Space align='center' style={{ position: 'relative' }}>
        Доставка
        
        <Popover 
          visible={props.popVisible}
          onVisibleChange={val => val
            ? props.popOpen()
            : props.popClose()
          }
          destroyOnHide
          getContainer={document.getElementById('asdfg')}
          mode="dark"
          content='Эта цена помогает доставлять нашу горячую и вкусную продукцию очень быстро'
          style={{
            fontFamily: 'Arial',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '21px',
          }}
        >
          <img 
            src={infoCircle}
            onClick={() => props.popVisible
              ? props.popClose()
              : props.popOpen()
            } 
          />
        </Popover>
      </Space>
    </Grid.Item>
    <Grid.Item style={detailStyle.detailRight}>
      299 ₽
    </Grid.Item>
  </Grid>
}