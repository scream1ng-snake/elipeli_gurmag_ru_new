import { Button, Image, Space, Toast } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import BackIcon from "../icons/Back"
import { CloseOutline } from "antd-mobile-icons"
import { copyToClipboard } from "../../features/helpers"
import Ekler from '../../assets/Ekler.png'
import Shtorka from "../common/Shtorka/Shtorka"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import AdaptivePopup from "../common/Popup/Popup"

const popup = {
  padding: '0.75rem 0',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  background: 'rgba(247, 187, 15, 1)',
  color: 'black',
}

const bigText = { fontSize: 29, fontWeight: 700, lineHeight: '33px', margin: '0 1rem' }
const smallText = { fontSize: 15, fontWeight: 700, lineHeight: '17px', margin: '0 1rem' }
const badge = {
  background: 'rgba(1, 98, 65, 1)',
  borderRadius: 10,
  position: 'absolute',
  padding: '0.5rem 1rem',
  color: 'white',
  fontSize: 14,
  marginLeft: '1rem',
  '--gap': '-10'
} as CSSProperties

const AskAuthorize: FC = observer(() => {
  const go = useGoUTM()
  const { auth } = useStore()
  const { bannerAuthForGift: { show, close } } = auth

  return (
    <AdaptivePopup
      visible={show}
      onClose={close}
      bodyStyle={popup}
      noBottomNav
      noCloseBtn
    >
      <Shtorka />

      <Container>
        <Space style={{ width: 'calc(100% - 2rem)', margin: '0 1rem' }} justify='between' align='center'>
          <BackIcon onClick={close} />
          <CloseOutline onClick={close} fontSize={20} />
        </Space>
        <Row>
          <Col xs={{ span: 12, order: 1 }} md={{ span: 6, order: 2 }}>


            <br />
            <br />
            <p style={bigText}>Волшебный</p>
            <p style={bigText}>Шоколадный эклер</p>
            <br />
            <p style={smallText}>В ПОДАРОК</p>
            <p style={smallText}>ПРИ РЕГИСТРАЦИИ!</p>
            <br />
            <br />
            <br />
          </Col>
          <Col xs={{ span: 12, order: 2 }} md={{ span: 6, order: 1 }}>
            <div>
              <Space
                direction='vertical'
                style={badge}
                align='center'
                justify='center'
                onClick={() => {
                  copyToClipboard('1703')
                  Toast.show('Промокод скопирован')
                }}
              >
                <span>Промокод</span>
                <span style={{ fontSize: 30 }}>1703</span>
              </Space>
              <Image src={Ekler} />
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
                margin: '0 1rem'
              }}
            >
              Получить подарок!
            </Button>
          </Col>
        </Row>
      </Container>
    </AdaptivePopup>
  )
})

export default AskAuthorize