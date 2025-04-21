import { Button, Image, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useDeviceType, useGoUTM, useStore } from "../../features/hooks"
import BackIcon from "../icons/Back"
import { CloseOutline } from "antd-mobile-icons"
// import { copyToClipboard } from "../../features/helpers"
import Shtorka from "../common/Shtorka/Shtorka"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import AdaptivePopup from "../common/Popup/Popup"
import kruvasan from '../../assets/kruAssAn.png'

const popup: CSSProperties = {
  padding: '0.75rem 0',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  background: 'linear-gradient(0deg, rgba(242,227,188,1) 0%, rgba(254,253,251,1) 100%)',
  color: 'black',
}

const bigText = { fontSize: 29, fontWeight: 700, lineHeight: '33px', margin: '0 1rem' }
const smallText = { 
  fontSize: 15, 
  fontWeight: 700, 
  lineHeight: '17px', 
  marginTop: 0,
  marginRight: '1rem',
  marginLeft: '1rem', 
}

const AskAuthorize: FC = observer(() => {
  const go = useGoUTM()
  const { auth } = useStore()
  const { bannerAuthForGift: { show, close } } = auth

  const device = useDeviceType()

  return (
    <AdaptivePopup
      visible={show}
      onClose={auth.dismissAskAuth}
      bodyStyle={popup}
      noBottomNav
      noCloseBtn
    >
      <Shtorka />

      <Container>
        <Space style={{ width: 'calc(100% - 2rem)', margin: '0 1rem' }} justify='between' align='center'>
          <BackIcon onClick={auth.dismissAskAuth} />
          <CloseOutline onClick={auth.dismissAskAuth} fontSize={20} />
        </Space>
        <Row>
          <Col 
            xs={{ span: 12 }} 
            md={{ span: 6 }} 
            style={device === 'mobile' 
              ? { marginBottom:-110, zIndex:1 } 
              : { marginBottom:20 }
            }
          >


            <br />
            <br />
            <p style={bigText}>Восхитительный</p>
            <p style={bigText}>Миндальный круассан</p>
            <br />
            <p style={smallText}>- Зарегистрируйтесь в приложении <br />и получите промокод</p>
            <p style={smallText}>
              <br />
            - Получите подарок <br />
            при первом заказе на доставку <br />
            или заберите <br />
            в любом пекарне “Гурмаг Ели-пели”
            </p>
          </Col>
          <Col xs={{ span: 12 }} md={{ span: 6 }} className="p-0">
            <div>
              <Image src={kruvasan} />
            </div>
            <br />
          </Col>
          <Col xs={{ order: 3 }} md={{ order: 3 }}>
            <Button
              fill='outline'
              onClick={() => {
                go('/authorize')
                close()
              }}
              style={{
                width: 'calc(100% - 2rem)',
                background: 'rgba(1, 98, 65, 1)',
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                padding: '0.75rem',
                margin: '0 1rem',
                marginBottom:12
              }}
            >
              Получить подарок!
            </Button>
            <Button
              fill='outline'
              onClick={auth.dismissAskAuth}
              style={{
                width: 'calc(100% - 2rem)',
                background: 'rgba(239, 144, 116, 1)',
                border: 'none',
                color: 'white',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                padding: '0.75rem',
                margin: '0 1rem'
              }}
            >
              Вернуться к покупкам
            </Button>
          </Col>
        </Row>
      </Container>
    </AdaptivePopup>
  )
})

export default AskAuthorize