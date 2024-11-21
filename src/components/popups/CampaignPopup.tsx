import { Button, Image } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useMemo } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import { toJS } from "mobx"
import config from "../../features/config"
import { AllCampaignUser } from "../../stores/cart.store"
import { ItemModal } from "./Course"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import AdaptivePopup from "../common/Popup/Popup"

const CampaignPopup: FC = observer(() => {
  const { user: { campaignPopup } } = useStore()
  const go = useGoUTM()
  const close = useCallback(function () {
    campaignPopup.close()
    go('/campaigns')
  }, [])
  const campaign = useMemo(
    () => toJS(campaignPopup.content) as AllCampaignUser,
    [campaignPopup.content]
  )


  return <AdaptivePopup
    visible={campaignPopup.show}
    bodyStyle={{
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      padding: '40px 20px 20px 20px',
      width: 'calc(100%)',
      maxHeight: 'calc(100%)',
      overflowY: 'scroll',
      fontSize: 18,
      lineHeight: 1.5,
    }}
    onClose={close}
  >
    <ItemModal />
    <Row>
      <Col xs={12} sm={12} md={6}>
        <Image
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + campaign?.image
          }
          style={{ borderRadius: 20 }}
        />
      </Col>
      <Col>
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
      </Col>
    </Row>
  </AdaptivePopup>
})


const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''
export default CampaignPopup