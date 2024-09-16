import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import Wrapper from "../../layout/Wrapper"
import { Image, NavBar, Toast } from "antd-mobile"
import bigLogo from '../../../assets/big_logo.png'
import { useLocation, useNavigate, useParams } from "react-router-dom"
import BottomNav from "../../common/BottomNav/BottomNav"
import { useStore } from "../../../features/hooks"
import Campaign from "./parts/CampaignItem"
import { logger } from "../../../features/logger"
import CampaignPopup from "../../popups/CampaignPopup"

const CampaignsPage: FC = observer(() => {
  const go = useNavigate()
  const { pathname } = useLocation()
  const { user: { info, campaignPopup, loadUserInfo }} = useStore()

  const params = useParams<{ VCode: string }>();

  useEffect(() => {
    if (params.VCode && loadUserInfo.state === 'COMPLETED') {
      // @ts-ignore
      const campaign = info.allCampaign.find(ac => ac.VCode == params.VCode)
      if (campaign) {
        campaignPopup.watch(campaign)
      } else {
        logger.log('allCampaign vcode ' + params.VCode + ' not found', 'campaign-page')
        Toast.show('Такой акции уже нет')
        go('/campaigns')
      }
    }
  }, [info.allCampaign, pathname])
  return <Wrapper styles={{ background: 'var(--tg-theme-bg-color)' }}>
    <CampaignPopup />
    <NavBar
      onBack={() => go('/')}
      backIcon={
        <Image
          src={bigLogo}
          height={32}
          width={122}
          fit='contain'
        />
      }
      style={{ height: 60, padding: '0 20px', textAlign: 'left' }}
    >
    </NavBar>
    <div style={{ padding: '0 20px' }}>
      <h2>Акции</h2>
      {info.allCampaign
        .map((actia, index) => <Campaign key={index} actia={actia} />)
      }
    </div>
    <BottomNav />
  </Wrapper>
})

export default CampaignsPage