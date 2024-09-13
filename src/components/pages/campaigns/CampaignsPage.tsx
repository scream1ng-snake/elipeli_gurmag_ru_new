import { observer } from "mobx-react-lite"
import { FC } from "react"
import Wrapper from "../../layout/Wrapper"
import { Image, NavBar } from "antd-mobile"
import BackIcon from "../../icons/Back"
import bigLogo from '../../../assets/big_logo.png'
import { useNavigate } from "react-router-dom"
import BottomNav from "../../common/BottomNav/BottomNav"
import { useStore } from "../../../features/hooks"
import Campaign from "./parts/CampaignItem"

const CampaignsPage: FC = observer(() => {
  const go = useNavigate()
  const { user: { info }} = useStore()
  return <Wrapper styles={{ background: 'var(--tg-theme-bg-color)' }}>
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
        .filter(actia => !actia.promocode)
        .map((actia, index) => <Campaign key={index} actia={actia} />)
      }
    </div>
    <BottomNav />
  </Wrapper>
})

export default CampaignsPage