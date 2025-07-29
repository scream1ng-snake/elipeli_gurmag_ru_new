import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import styles from './ReceptionSwitcher.module.css'
import { useDeviceType, useGoUTM, useStore } from '../../../../../features/hooks'
import SelectLocationPopup from '../../../../popups/SelectLocation'
import Red from '../../../../special/RedText'
import CircleIcon from '../../../../icons/Circle'
import { IconDown } from '../../../../icons/IconDown'
import IconDelivery from '../../../../../assets/icon_delivery@2x.png'
import IconChoice from '../../../../../assets/icon_choice@2x.png'
import IconPickup from '../../../../../assets/icon_pickup@2x.png'
import LogoGurmag from '../../../../../assets/logo_gurmag@2x.png'
import { ReceptionType } from '../../../../../stores/reception.store'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button } from 'antd-mobile'
import NavButton from '../../../../layout/NavButton'
import TopNav from '../../../../common/TopNav/TopNav'
import { toJS } from 'mobx'


const ReceptionSwitcher: FC = observer(() => {
  const device = useDeviceType()
  const { auth, reception, user, cart } = useStore()
  const navigate = useGoUTM()
  const {
    isWorkingNow,
    receptionType,
    selectLocationPopup: { show, close, open },
    currentOrganizaion,
  } = reception
  const address = reception.Location.confirmedAddress


  const getHint = () => {
    const { DeliveryCost } = user.info
    const deliveryCost = DeliveryCost.find((dc, currindex) => 
      dc.minSum <= cart.totalPrice
        && (DeliveryCost[currindex + 1]
          ? cart.totalPrice < DeliveryCost[currindex + 1].minSum
          : true
        )
    )
    return receptionType === 'initial'
      ? 'или заберёте сами?'
      : receptionType === 'delivery'
        ? isWorkingNow 
          ? deliveryCost ? 'Доставка ' + deliveryCost?.DeliverySum + ' ₽' : 'Доставка'
          : <Red>Сейчас не доставляем. Доставляем с 9.30 до 21.30</Red>
        : isWorkingNow
          ? 'Забрать из Гурмага'
          : <Red>Закрыто - Откроется в 9:30</Red>
  }
    

  const getAddress = () =>
    receptionType === 'initial'
      ? 'Вам доставить'
      : receptionType === 'delivery'
        ? address.road ? (address.road + ' ' + address.house_number) : 'Укажите адрес доставки'
        : currentOrganizaion?.Name.replace('_', ' ') ?? 'Точка не выбрана'


  const ReceptionTypesImages: Record<ReceptionType, string> = {
    initial: IconChoice,
    delivery: IconDelivery,
    pickup: IconPickup,
  }

  function handleClose() {
    close()
    navigate('/')
  }

  return <div
    className={styles.head_wrapper}
    style={auth.isFailed && auth.bannerToTg.show
      ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
      : undefined
    }
  >
    <Container>
      <SelectLocationPopup
        show={show}
        close={handleClose}
        onContinue={handleClose}
      />
      <Row
        className='justify-content-sm-center'
        style={auth.isFailed && auth.bannerToTg.show
          ? {
            background: 'var(--tg-theme-bg-color)',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            marginTop: 2
          }
          : { background: 'var(--tg-theme-secondary-bg-color)', marginTop: 2 }
        }
      >
        <Col
          xs={{ order: 2, span: 'auto' }}
          md={{ order: 1 }}
        >
          <CircleIcon
            image={ReceptionTypesImages[receptionType]}
            size={36}
          />
        </Col>
        <Col
          xs={{ order: 3 }}
          md={{ order: 2 }}
          className='p-0'
          style={{ marginBottom: 7 }}
        >
          <div
            onClick={open}
            style={{ width: receptionType === 'initial' ? '100%' : 'auto' }}
          >
            {receptionType === 'initial'
              ? <Button
                color='primary'
                onClick={open}
                shape='rounded'
                className='w-100'
              >
                Доставить или забрать?
              </Button>
              :
              <div className={styles.reception_wrapper}>
                <div className={styles.text_box}>
                  <div className={styles.text_address_row}>
                    <p className={styles.text_address}>{getAddress()}</p>
                    <IconDown
                      width={10}
                      height={6}
                      color={"var(--громкий-текст)"}
                    />
                  </div>
                  <p className={styles.reception_hint}>{getHint()}</p>
                </div>
              </div>
            }
          </div>
        </Col>

        <Col xs={{ order: 4, span: 'auto' }}>
          <div
            className={styles.icon_wrapper}
            onClick={() => navigate(
              auth.state !== 'AUTHORIZED'
                ? '/authorize'
                : '/me'
            )}
          >
            <CircleIcon image={LogoGurmag} size={36} />
          </div>
        </Col>
        {device !== 'mobile'
          ? <Col xs={{ order: 5, span: 'auto' }} className='p-0'>
            <NavButton>
              <TopNav />
            </NavButton>
          </Col>
          : null
        }
      </Row>
    </Container>
  </div>
})

/** эта шляпа должна занимать столько же места что и ReceptionSwitcher
 * но без логики 
 */
export const ReceptionSwitcherEmpty = observer(() => {
  return (
    <div className={styles.head_wrapper}>
      <Container>
        <Row className='justify-content-sm-center' style={{ marginTop: 2 }}>
          <Col xs={{ order: 2, span: 'auto' }} md={{ order: 1 }}>
            <CircleIcon image={IconChoice} size={36} />
          </Col>
          <Col xs={{ order: 3 }} md={{ order: 2 }} style={{ marginBottom: 2 }}>
            <div>
              <Button color='primary' shape='rounded' className='w-100'>
                Доставить или забрать?
              </Button>
            </div>
          </Col>
          <Col xs={{ order: 4, span: 'auto' }}>
            <div className={styles.icon_wrapper}>
              <CircleIcon image={LogoGurmag} size={36} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
})

export default ReceptionSwitcher