import { Button, Image, Popup } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStore } from "../../features/hooks"
import { useNavigate } from "react-router-dom"
import { toJS } from "mobx"
import config from "../../features/config"
import { AllCampaignUser, DishDiscount, DishSetDiscount, PercentDiscount } from "../../stores/cart.store"
import { Optional } from "../../features/helpers"
import { ItemModal } from "./Course"
import { UserInfoState } from "../../stores/user.store"
import BottomNavigation from "../common/BottomNav/BottomNav"

const CampaignPopup: FC = observer(() => {
  const {
    user: { info, campaignPopup },
    reception: { menu }
  } = useStore()
  const go = useNavigate()
  function close() {
    campaignPopup.close()
    go('/campaigns')
  }
  const campaign = toJS(campaignPopup.content) as AllCampaignUser
  return <Popup
    closeOnSwipe
    closeOnMaskClick
    showCloseButton
    visible={campaignPopup.show}
    bodyStyle={{
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      padding: '40px 20px',
      width: 'calc(100% - 40px)',
      maxHeight: 'calc(95% - 80px)',
      overflowY: 'scroll',
      fontSize: 18,
      lineHeight: 1.5,
    }}
    onClose={close}
  >
    <ItemModal />
    <Image
      src={config.staticApi
        + '/api/v2/image/Disount?vcode='
        + campaign?.VCode
        + '&compression=true'
      }
      style={{ borderRadius: 20 }}
    />
    <p
      style={{
        marginTop: 13,
        fontFamily: 'Roboto',
        fontSize: '21px',
        fontWeight: 700,
        lineHeight: '24px',
        textAlign: 'left',
      }}
    >
      {Prepare(campaign?.Name)}
    </p>
    <p
      style={{
        marginTop: 8,
        fontFamily: 'Nunito',
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '19px',
        textAlign: 'left',
        color: 'rgba(157, 159, 158, 1)',
        textIndent: '1rem'
      }}
    >
      {Prepare(campaign?.Description).split('\n').map((txt, index) => <p key={index}>{txt}</p>)}
    </p>
    <Button
      shape="rounded"
      style={{
        width: '100%',
        marginTop: 20,
        background: 'rgba(247, 187, 15, 1)',
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Roboto',
        fontSize: 16.5,
        fontWeight: 600,
        lineHeight: '16.99px',
        border: 'none',
        padding: '12px 15px'
      }}
      onClick={close}
    >
      Закрыть
    </Button>
    <BottomNavigation />
  </Popup>
})

const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''
export default CampaignPopup