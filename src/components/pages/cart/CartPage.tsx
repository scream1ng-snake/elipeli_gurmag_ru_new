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
import { AllCampaignUser, CouseInCart, DeliveryCost } from "../../../stores/cart.store"
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
  const go = useGoUTM()
  const { cart, user } = useStore()
  const { DeliveryCost } = user.info
  const [showTooltip, setShowTooltip] = useState(false)

  const allCampaigns = getAllCampaignsFromCart(cart.items, user.info.allCampaign)

  let nextDeliveryCost: DeliveryCost | undefined
  const deliveryCost = DeliveryCost.find((dc, currindex) => {
    const nextDc = DeliveryCost[currindex + 1]
    const condition = dc.minSum <= cart.totalPrice
      && (nextDc
        ? cart.totalPrice < nextDc.minSum
        : true
      )
    if(condition) nextDeliveryCost = nextDc
    return condition
  })

  let discountsByCampaign = 0
  cart.items.forEach(cartItem => {
    discountsByCampaign += (cartItem.couse.Price * cartItem.quantity)
  })
  discountsByCampaign -= cart.totalPrice
  if(discountsByCampaign < 0) discountsByCampaign = 0

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
        <DeliveryPriceInfoPopup />
        <CampaignsTooltip allCampaign={allCampaigns} />
        <NiceToMeetYooPopup />
        <YoukassaPopup />
        <AuthRequiredPopap />
        <Congratilations />
        <OrderDetailPopup 
          deliveryPrice={deliveryCost?.DeliverySum} 
        />
        <h2 className={styles.cartText}>
          {cart.items.length + ' товаров на ' + Round(cart.totalPrice) + ' ₽'}
        </h2>
        <CartList />
        <Promocode />
        <h3 className={styles.noteText}>Пожелание к заказу</h3>
        <NoteToOrder />
        <Details
          deliverySum={deliveryCost?.DeliverySum}
          discountsByCampaign={discountsByCampaign}
          popClose={() => { setShowTooltip(false) }}
          popOpen={() => { setShowTooltip(true) }}
          popVisible={showTooltip}
        />
        <Recomendations />
        
        <BottomButton 
          nextDeliveryCost={nextDeliveryCost}
          deliveryPrice={deliveryCost?.DeliverySum}
        />
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


interface BottomButtonProps {
  deliveryPrice: number | undefined,
  nextDeliveryCost: DeliveryCost | undefined
}
const BottomButton: FC<BottomButtonProps> = observer(({ deliveryPrice, nextDeliveryCost }) => {
  const { cart, reception } = useStore()
  const device = useDeviceType()
  const isNtMobile = device !== 'mobile'

  const missingAmount = nextDeliveryCost
    ? nextDeliveryCost?.minSum - cart.totalPrice
    : undefined

  const totalSum = (reception.receptionType === 'delivery' && deliveryPrice)
    ? cart.totalPrice
      ? cart.totalPrice + deliveryPrice
      : 0
    : cart.totalPrice
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
      {reception.receptionType === 'delivery' && deliveryPrice
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
            {nextDeliveryCost && missingAmount
              ? 'Доставка ' + Round(deliveryPrice) + ' ₽. Еще ' + missingAmount + ' ₽, и доставим за ' +  nextDeliveryCost.DeliverySum + ' ₽'
              : 'Доставка ' + Round(deliveryPrice) + ' ₽.'
            }
          </span>
          <img
            src={infoCircle}
          />
        </Space>
        : null
      }
      <Button
        shape='rounded'
        color='primary'
        className={styles.orderButton}
        onClick={cart.detailPopup.open}
        disabled={!cart.items.length}
      >
        {'Оформить заказ на ' + Round(totalSum) + ' ₽'}
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
    padding: '7px 15px',
  },
  detailRight: {
    textAlign: 'end',
    marginBottom: 22
  }
}
interface DetailsProps {
  discountsByCampaign: number,
  deliverySum: number | undefined,
  popVisible: boolean,
  popOpen: () => void,
  popClose: () => void
}
const Details: FC<DetailsProps> = (props) => {
  return <Grid columns={2} style={detailStyle.detail}>
    <Grid.Item>
      Скидки по акциям
    </Grid.Item>
    <Grid.Item style={detailStyle.detailRight}>
      {props.discountsByCampaign + ' ₽'}
    </Grid.Item>
    {props.deliverySum !== null && props.deliverySum !== undefined
      ? <>
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
          {Round(props.deliverySum) + ' ₽'}
        </Grid.Item>
      </>
      : null
    }

  </Grid>
}