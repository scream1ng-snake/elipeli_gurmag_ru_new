import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import Wrapper from "../../layout/Wrapper"
import { Button, Image, NavBar, Toast } from "antd-mobile"
import bigLogo from '../../../assets/big_logo.png'
import { useLocation, useParams } from "react-router-dom"
import BottomNav from "../../common/BottomNav/BottomNav"
import { useGoUTM, useStore } from "../../../features/hooks"
import Campaign from "./parts/CampaignItem"
import { logger } from "../../../features/logger"
import CampaignPopup from "../../popups/CampaignPopup"
import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import bridge from "@vkontakte/vk-bridge"

const CampaignsPage: FC = observer(() => {
  const go = useGoUTM()
  const { pathname } = useLocation()
  const location = useLocation()
  const { user: { info, campaignPopup, loadUserInfo } } = useStore()

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
    <Container fluid='xl' className="p-0">
      <Button onClick={() => {
        console.log(document.location)
        console.log(document.referrer)
        console.log(window.location)
        console.log(window.parent.location)
        bridge.send('VKWebAppGetConfig').then((data) => {
          if (data) {
            console.log(data)
            // Информация получена 
          }
        }).catch((error) => {
          console.log(error)
          // Ошибка console.log(error); 
        });
        bridge.send('VKWebAppGetLaunchParams')
          .then((data) => {
            console.log(data)
          })
          .catch((error) => {
            // Ошибка
            console.log(error);
          });
      }}>dsdsds</Button>
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
        <Row>
          {info.allCampaign
            .filter(ac => !ac.promocode)
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