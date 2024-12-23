import { CSSProperties, FC } from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import ProgressBar from "react-bootstrap/ProgressBar"
import { Button, Image, List, Space, Toast } from "antd-mobile"
import { CheckOutline, GiftOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import { useGoUTM, useStore } from "../../../../../features/hooks"
import AdaptivePopup from "../../../../common/Popup/Popup"
import config from "../../../../../features/config"
import { CourseItem } from "../../../../../stores/menu.store"
import { PlusOutlined } from "@ant-design/icons"


const styles: Record<string, CSSProperties> = {
  wrapper: {
    position: 'fixed',
    right: 0,
    left: 0,
    bottom: 55,
    background: 'var(--tg-theme-bg-color)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  btn: { width: '100%', borderRadius: 15 }
}
const AmountScaleForGift: FC = observer(() => {
  const { cart, user } = useStore()
  const go = useGoUTM()

  const PresentAction = user.info.allCampaign.filter(c => c.PresentAction)
  const separators: Map<number, number> = new Map()
  separators.set(0, 0)
  PresentAction.forEach(p => {
    separators.set(p.MaxSum, p.MaxSum)
    separators.set(p.MinSum, p.MinSum)
  })
  const separatorLabels = Array.from(separators.values()).sort()
  const min = separatorLabels[0]
  const max = separatorLabels[separatorLabels.length - 1]

  const offset = ((max / 70 * 100) - max) / 2


  return <div style={styles.wrapper}>
    <GiftInfoPopup />
    <Container>
      <Row style={{ alignItems: 'center' }} className="p-2">
        <Col xs={'auto'}>
          <Button
            fill='outline'
            style={styles.btn}
            onClick={cart.giftInfoPopup.open}
          >
            <GiftOutline />
            {'  Подарок'}
          </Button>
        </Col>
        <Col>
          <div style={{ position: "relative" }}>
            {separatorLabels.map((sum, index) => {
              const isLeftHalf = sum < (max / 2)
              const isCenter = sum === (max / 2)
              const offsetPercent = (sum / max * 100) + (isCenter ? 0 : isLeftHalf ? 15 : -15)
              return <Space
                key={index}
                style={{ position: 'absolute', left: `${offsetPercent}%`, translate: '-50%', fontSize: 14, fontWeight: 900, color: 'black', "--gap": '0' }}
                direction='vertical'
                align='center'
              >
                <div style={{ background: 'black', width: 2, height: 15, marginTop: 3 }} />
                <span style={{ textWrap: 'nowrap' }}>{sum + ' ₽'}</span>
              </Space>
            })}
            <ProgressBar
              className="mt-2 mb-2"
              min={min - offset}
              max={max + offset}
              now={cart.totalPrice}
              style={{ height: '2.5rem' }}
              variant='warning'
              striped
            />
          </div>
        </Col>
        <Col md={4} xs={12}>
          <Button
            className="mb-2"
            size='large'
            color='primary'
            style={styles.btn}
            onClick={() => { go('/basket') }}
          >
            В корзину
          </Button>
        </Col>
      </Row>
    </Container>
  </div>
})
export default AmountScaleForGift


const GiftInfoPopup = observer(() => {
  const { cart, user, reception } = useStore()
  const { giftInfoPopup } = cart

  const PresentAction = user.info.allCampaign.filter(c => c.PresentAction)
  return <AdaptivePopup
    noBottomNav
    visible={giftInfoPopup.show}
    onClose={giftInfoPopup.close}
    bodyStyle={{
      padding: '1rem',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    }}
  >
    {PresentAction.map(p => {
      const detail = user.info.dishSet
        .find(d => d.vcode === p.VCode)

      const courses: CourseItem[] = []
      if (detail) detail.dishes.forEach(d => {
        const dihs = reception.menu.getDishByID(d.dish)
        if (dihs) courses.push(dihs)
      })

      const currentGiftEnabled = cart.totalPrice <= p.MaxSum && cart.totalPrice >= p.MinSum



      return <div key={p.VCode}>
        <h2>{p.Name ?? 'нет названия'}</h2>
        <p>{p.Description ?? 'нет описания'}</p>
        {p.MaxSum && p.MinSum >= 0
          ? <p>{`от ${p.MinSum} до ${p.MaxSum}`}</p>
          : null
        }
        <List>
          {courses.map((giftCouse, index) => {
            const isInCart = cart.items.find(i => i.couse.VCode === giftCouse.VCode)
            return (
              <List.Item
                key={index}
                prefix={
                  <Image
                    src={config.staticApi
                      + '/api/v2/image/FileImage?fileId='
                      + giftCouse.CompressImages?.[0]
                    }
                    style={{ width: 60, height: 60, borderRadius: 15, margin: '0.75rem 0' }}
                    fit='cover'
                  />
                }
                description={giftCouse.Weigth}
                extra={
                  isInCart
                    ? <CheckOutline style={{ fontSize: 30, color: 'var(--adm-color-success)' }} />
                    : <CheckOutline style={{ fontSize: 30, color: 'var(--adm-color-default)' }} />

                }
              >
                {giftCouse.Name}
              </List.Item>
            )
          })}
        </List>
      </div>
    })}
    <Button
      shape='rounded'
      className="w-100"
      color='primary'
      onClick={giftInfoPopup.close}
    >
      Круто!
    </Button>
  </AdaptivePopup>
})