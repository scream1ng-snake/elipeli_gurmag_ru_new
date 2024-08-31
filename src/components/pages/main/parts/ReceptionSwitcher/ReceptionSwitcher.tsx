import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'
import styles from './ReceptionSwitcher.module.css'
import { DownOutline } from 'antd-mobile-icons'
import { useStore } from '../../../../../features/hooks'
import SelectLocationPopup from '../../../../popups/SelectLocation'
import { useLocation, useNavigate } from 'react-router-dom'
import Red from '../../../../special/RedText'
import { Popover } from 'antd-mobile/es/components/popover/popover'
import { Image, Button } from 'antd-mobile'
/*
import DeliveryIcon from '../../../../icons/Delivery'
import PickupIcon from '../../../../icons/Pickup'
import { QuestionCircleOutline } from 'antd-mobile-icons'
*/
import CircleIcon from '../../../../icons/Circle'
import CustomButton from '../../../../special/CustomButton'

import { Void } from '../../../../layout/Void'
import { Pickup36x36 } from '../../../../icons/Pickup'
import { Delivery36x36 } from '../../../../icons/Delivery'
import { Question36x36 } from '../../../../icons/Question36x36'
import { Gurmag36x36 } from '../../../../icons/Gurmag36x36'
import { IconDown } from '../../../../icons/IconDown'

import IconDelivery from '../../../../../assets/icon_delivery@2x.png'
import IconChoice from '../../../../../assets/icon_choice@2x.png'
import IconPickup from '../../../../../assets/icon_pickup@2x.png'

import LogoGurmag from '../../../../../assets/logo_gurmag@2x.png'

import { receptionTypes } from "../../../../../stores/reception.store"
const ReceptionSwitcher: FC = observer(() => {
  const { auth, reception } = useStore()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const {
    isWorkingNow,
    receptionType,
    selectLocationPopup: { show, close },
    currentOrganizaion,
    needAskLocation,
    address,
  } = reception



  /* const getIcon = () =>
    receptionType === 'initial'
      ? <Question36x36 />
      : receptionType === 'delivery'
        ? <DeliveryIcon fontSize={32} color={"var(--gurmag-accent-color)"} />
        : <PickupIcon fontSize={32} color={"var(--gurmag-accent-color)"} /> */
  const getIcon = (receptionType: any) => {
    let image: any = null;
    switch (receptionType) {
      case 'initial':
        image = IconChoice;
        break;
      case 'delivery':
        image = IconDelivery;
        break;
      case 'pickup':
        image = IconPickup;
        break;
    }
    return <CircleIcon image={image} size={36} />
  }
  const getHint = () =>
  receptionType === 'initial'
    ? 'или заберёте сами?'
    : receptionType === 'delivery'
      ? isWorkingNow ? 'Доставка бесплатно' : <Red>Сейчас не доставляем. Доставляем с 9.30 до 21.30</Red>
      : isWorkingNow ? 'Забрать из Гурмага' : <Red>Закрыто - Откроется в 9:30</Red>

  const getAddress = () =>
    receptionType === 'initial'
      ? 'Вам доставить'
      : receptionType === 'delivery'
        ? address.road ? (address.road + ' ' + address.house_number) : 'Укажите адрес доставки'
        : currentOrganizaion?.Name.replace('_', ' ') ?? 'Точка не выбрана'

  const getPopText = () => {
    if(receptionType === 'initial') 
      return 'Выберите место обслуживания или доставку на дом*'
    if(!address.road && receptionType === 'delivery') 
      return 'Уточните адрес доставки*'
    if(!currentOrganizaion && receptionType === 'pickup') 
      return 'Выберите заведение для посещения*'
  }

  const DownArrow = () => <DownOutline style={{ marginLeft: 5 }} />

  const onClick = () => { navigate('#selectLocation') }
  const getCenter = () => {
    switch (receptionType) {
      case 'delivery':
        if (address?.road && address?.house_number) {
          return <div className={styles.text_box}>
            <p>{address.road + ' ' + address.house_number} <DownArrow /></p>
            <p className={styles.receptiom_hint}>
              {isWorkingNow
                ? 'Доставка бесплатно'
                : <Red>Сейчас не доставляем. Доставляем с 9.30 до 21.30</Red>
              }
            </p>
          </div>
        } else {
          return <p>Уточните адрес доставки*<DownArrow /></p>
        }
      case 'initial':
        return <Button
          className={styles.initial_button}
          shape='rounded'
          onClick={onClick}
        >
          Доставить или забрать?
        </Button>
      case 'pickup':
        if (currentOrganizaion) {
          return <div className={styles.text_box}>
            <p>{currentOrganizaion?.Name.replace('_', ' ')} <DownArrow /></p>
            <p className={styles.receptiom_hint}>
              {isWorkingNow
                ? 'Заберу сам'
                : <Red>Закрыто - Откроется в 9:30</Red>
              }
            </p>
          </div>
        } else {
          return <p>Выберите заведение для посещения*<DownArrow /></p>
        }
    }
  }

  useEffect(() => {
    if (hash.includes('#selectLocation')) {
      if (reception.receptionType === receptionTypes.initial) {
        reception.setReceptionType(receptionTypes.delivery)
      }
      reception.selectLocationPopup.open()
    }
  }, [hash])

  return <div
    className={styles.head_wrapper}
    style={
      (auth.isFailed && auth.bannerToTg.show)
      ? { /* Если баннер */
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
      }
      : {
      }
    }
  >
    <SelectLocationPopup
      show={show}
      close={function () {
        close()
        navigate('/')
      }}
      onContinue={function () {
        close()
        navigate('/')
      }}
    />
    <div
      className={styles.head_shell}
      style={
        (auth.isFailed && auth.bannerToTg.show)
        ? { /* Если баннер красим в белый */
          background:' var(--tg-theme-bg-color)',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
        }
        : {
          background:' var(--tg-theme-secondary-bg-color)'
        }
      }
    >
      <div
        className={styles.head_row}
      >
        <div
          className={styles.switcher_button}
          onClick={function () { navigate('#selectLocation') }}
          style={{ width: receptionType === 'initial' ? '100%' : 'auto' }}
        >
          <div
            className={styles.icon_wrapper}
          >
            {getIcon(receptionType)}
          </div>
          {
            (receptionType === 'initial')
              ? 
                <CustomButton
                  text={'Доставить или забрать?'}
                  onClick={function () { navigate('#selectLocation') }}
                  height={'35px'}
                  maxWidth={'215px'}
                  marginTop={'0px'}
                  marginBottom={'0px'}
                  marginHorizontal={'14px'}
                  paddingHorizontal={'24px'}
                  fontWeight={'400'}
                  fontSize={'14.5px'}
                  backgroundVar={'--gurmag-accent-color'}
                  colorVar={'--gur-custom-button-text-color'}
                  appendImage={null}
                />
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
                {/* <DownOutline /> */}
              </div>
          }
        </div>
        <div
          className={styles.icon_wrapper}
          onClick={function () { navigate( auth.state !== 'AUTHORIZED' ? '/authorize' : '/me') }}
        >
          <CircleIcon image={LogoGurmag} size={36} />
        </div>
      </div>
    </div>
    {/* <div
      className={styles.switcher_button}
      onClick={function () { navigate('#selectLocation') }}
    >
      {getIcon(receptionType)}
      {getCenter()}
    </div>
    <Gurmag36x36 /> */}
  </div>
})

export default ReceptionSwitcher