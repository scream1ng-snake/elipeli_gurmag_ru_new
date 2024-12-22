import { CSSProperties, FC } from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Button, ProgressBar } from "antd-mobile"
import { GiftOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import { useStore } from "../../../../../features/hooks"


const styles: Record<string, CSSProperties> = {
  wrapper: { 
    position: 'fixed', 
    right: 0, 
    left: 0, 
    bottom: 55, 
    background: 'var(--tg-theme-bg-color)',
    borderTopLeftRadius:15,
    borderTopRightRadius:15
  },
  btn: { width: '100%', borderRadius:15 }
}
const AmountScaleForGift: FC = observer(() => {
  const { cart } = useStore()
  
  return <div style={styles.wrapper}>
    <Container>
      <Row style={{ alignItems: 'center' }}>
        <Col xs={'auto'}>
          <Button 
            color={cart.gift.isNtFull ? 'default' : 'success'} 
            fill='outline' 
            style={styles.btn}
          >
            <GiftOutline />
            {'  Подарок'}
          </Button>
        </Col>
        <Col>
          <div style={{ position: "relative" }}>
            <ProgressBar 
              percent={cart.gift.percent}
              text={cart.gift.GIFT_AMOUNT + ' руб'}
              style={{
                '--track-width': '26px',
                '--fill-color': cart.gift.isNtFull ? 'var(--adm-color-primary)' : 'var(--adm-color-success)'
              }}
              className="mt-2 mb-2" 
              
            />
          </div>
        </Col>
        <Col md={4} xs={12}>
          <Button className="mb-2" size='large' color='primary' style={styles.btn}>
            В корзину
          </Button>
        </Col>
      </Row>
    </Container>
  </div>
})
export default AmountScaleForGift