import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import Wrapper from "../../layout/Wrapper"
import { Image, NavBar, Space, Toast } from "antd-mobile"
import bigLogo from '../../../assets/big_logo.png'
import { useLocation, useParams } from "react-router-dom"
import BottomNav from "../../common/BottomNav/BottomNav"
import { useDeviceType, useGoUTM, useStore } from "../../../features/hooks"
import Campaign from "./parts/CampaignItem"
import { logger } from "../../../features/logger"
import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { Burger } from "../../layout/NavButton"
import CampaignCollectionPopup from "../../popups/CampaignCollectionPopup"

const CampaignsPage: FC = observer(() => {
  const go = useGoUTM()
  const { pathname } = useLocation()
  const { 
    user: { info, loadUserInfo }, 
    reception: { menu } 
  } = useStore()

  const params = useParams<{ VCode: string }>();

  useEffect(() => {
    if (params.VCode && loadUserInfo.state === 'COMPLETED') {
      // @ts-ignore
      const campaign = info.allCampaign.find(ac => ac.VCode == params.VCode)
      if (campaign) {
        menu.coursesCampaignPopup.watch(campaign)
      } else {
        logger.log('allCampaign vcode ' + params.VCode + ' not found', 'campaign-page')
        Toast.show('Такой акции уже нет')
        go('/campaigns')
      }
    }
  }, [info.allCampaign, pathname])
  return <Wrapper styles={{ background: 'var(--tg-theme-bg-color)' }}>
    <Container className="p-0">
      <CampaignCollectionPopup 
        popup={menu.coursesCampaignPopup} 
        childCousePopup={menu.coursePopup2}
        onClose={() => go('/campaigns')}
      />
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
        right={<Burger />}
        style={{ height: 60, padding: '0 20px', textAlign: 'left' }}
      >
      </NavBar>
      <div style={{ padding: '0 20px' }}>
        <h2>Акции</h2>
        <Row>
          {info.allCampaign
            .filter(ac => ac.showintgregistry)
            .map((actia, index) =>
              <Col key={index} xs={12} sm={6} md={4} xl={3} xxl={2}>
                <Campaign actia={actia} />
              </Col>
            )
          }
        </Row>

      </div>
      <BottomNav />
    </Container>
  </Wrapper>
})

export default CampaignsPage