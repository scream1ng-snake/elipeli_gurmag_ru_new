import { Button, Dialog, Image, Space, Toast } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { CSSProperties, FC } from "react";
import { useGoUTM, useStore } from "../../features/hooks";
import type {
  Action
} from 'antd-mobile/es/components/action-sheet'
import moment from "moment";
import BackIcon from "../icons/Back";
import { CloseOutline } from "antd-mobile-icons";
import { Message2 } from "../../stores/auth.store";
import { copyToClipboard } from "../../features/helpers";
import Shtorka from "../common/Shtorka/Shtorka";

import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import AdaptivePopup from "../common/Popup/Popup"
import kruvasan from '../../assets/kruAssAn.png'
import { useSearchParams } from "react-router-dom";
import styles from '../pages/cart/CartPage.module.css'

const popup: CSSProperties = {
  padding: '0.75rem 0',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  background: 'linear-gradient(0deg, rgba(242,227,188,1) 0%, rgba(254,253,251,1) 100%)',
  color: 'black',
}

const boldText: CSSProperties = { fontSize: 17, fontWeight: 700, lineHeight: '18.5px' }
const normalText: CSSProperties = { fontSize: 16, fontWeight: 400, lineHeight: '17.5px' }
const badge = {
  background: 'rgba(1, 98, 65, 1)',
  borderRadius: 15,
  position: 'absolute',
  padding: '0.5rem 1rem',
  color: 'white',
  marginLeft: '2rem',
  fontSize: 14,
  display: 'flex',
  lineHeight: '1',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
} as CSSProperties
export const NiceToMeetYooPopup: FC = observer(() => {
  const { auth: { niceToMeetYooPopup: { show, close, content } } } = useStore()
  let text: Message2 = {
    body1: '',
    body2: '',
    title: 'Наконец-то познакомились!',
    promo: ''
  }
  if (content) {
    text = JSON.parse(content.replaceAll("\\\"", "\""))
  }
  return <AdaptivePopup
    visible={show}
    onClose={close}
    bodyStyle={popup}
    noBottomNav
    noCloseBtn
  >
    <Shtorka />

    <Container>
      <Space style={{ width: '100%' }} justify='between' align='center'>
        <BackIcon onClick={close} />
        <CloseOutline onClick={close} fontSize={20} />
      </Space>
      <Row>
        <Col xs={{ span: 12 }} md={{ span: 6 }} className="text-md-left">
          <br />
          <p style={boldText}>{text.title.split('\\n').map((txt, index) => <span key={index}>{txt} <br /></span>)}</p>
          <br />
          <p style={normalText}>{text.body1.split('\\n').map((txt, index) => <span key={index}>{txt} <br /></span>)}</p>
          <br />
          <p style={normalText}>{text.body2.split('\\n').map((txt, index) => <span key={index}>{txt} <br /></span>)}</p>
          <br />
        </Col>
        <Col xs={{ span: 12 }} md={{ span: 6 }} className="p-0">
          <div style={{ position: 'relative' }}>
            {!text.promo.length
              ? null
              : <div
                style={badge}
                onClick={() => {
                  copyToClipboard(text.promo)
                  Toast.show('Промокод скопирован')
                }}
              >
                <span>Промокод</span>
                <span style={{ fontSize: 30 }}>{text.promo}</span>
              </div>
            }
            <Image
              style={{ marginBottom: -45 }}
              src={kruvasan}
            />
          </div>
        </Col>
        <Col xs={{ order: 3 }} md={{ order: 3 }}>
          <Button
            fill='outline'
            onClick={() => {
              close()
              copyToClipboard(text.promo)
              Toast.show('Промокод скопирован')
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
            Выбрать блюда!
          </Button>
        </Col>
      </Row>
    </Container>
  </AdaptivePopup>
})

export const Congratilations: FC = observer(() => {
  const go = useGoUTM()
  const { cart } = useStore()
  const [params] = useSearchParams()
  return <Dialog
    title='Поздравляем! Заказ оформлен!'
    visible={cart.congratilations.show}
    actions={[{
      key: 'ok',
      text: 'На главную',
      onClick: () => {
        if (params.get('payed') === 'true') params.delete('payed')
        cart.congratilations.close()
        go('/')
      }
    }, {
      key: 'myOrders',
      text: 'Мои заказы',
      onClick: () => {
        if (params.get('payed') === 'true') params.delete('payed')
        cart.congratilations.close()
        go('/orders')
      }
    }, {
      key: 'close',
      text: 'Закрыть',
      onClick: cart.congratilations.close,
    }]}
    bodyStyle={{ borderRadius: 13 }}
    onClose={cart.congratilations.close}
  />
})

const CartActions: FC = observer(() => {
  const { cart } = useStore()
  return <AdaptivePopup
    visible={cart.actionSheet.show}
    bodyStyle={{
      padding: '1rem',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    }}
    noCloseBtn
    noBottomNav
    shtorkaOffset="-25px"
  >
    <h1
      style={{
        fontFamily: "Arial",
        fontWeight: '700',
        fontSize: "26px",
        lineHeight: '100%',
        textAlign: 'center',
        marginTop: '10px',
        marginBottom: '27px'
      }}
    >
      Обратите Внимание!
    </h1>
    <Space direction='vertical' className="w-100" style={{ "--gap": "14px" }}>
      <center>
        <p>
          После уточнения адреса <br />оказалось, <br />что не все блюда есть в наличии. <br />Проверьте, пожалуйста, Корзину!
        </p>
      </center>
      <br />
      <Button
        shape='rounded'
        color='primary'
        style={{
          width: '100%',
          fontWeight: 600,
          color: '#000'
        }}
        onClick={() => {
          cart.actionSheet.close()
          cart.detailPopup.close()
          cart.postOrder.setState('INITIAL')
          const elem = document.getElementsByClassName(styles.cartPopup)[0]
          
          if(elem) elem.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        Обратно в Корзину
      </Button>
    </Space>
  </AdaptivePopup>
})
export default CartActions