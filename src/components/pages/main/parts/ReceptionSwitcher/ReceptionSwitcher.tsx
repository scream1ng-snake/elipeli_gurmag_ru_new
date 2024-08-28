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

import IconDelivery from '../../../../../assets/icon_delivery.png'
import IconChoice from '../../../../../assets/icon_choice.png'
import IconPickup from '../../../../../assets/icon_pickup.png'
import IconDown from '../../../../../assets/icon_down.svg'

import LogoGurmag from '../../../../../assets/logo_gurmag.png'

const ReceptionSwitcher: FC = observer(() => {
  const { reception } = useStore()
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
      ? isWorkingNow ? 'Доставка бесплатно' : <Red>По этому адресу заведение закрыто</Red>
      : isWorkingNow ? 'Забрать из Гурмага' : <Red>Закрыто - Откроется в 9:30</Red>

  const getAddress = () =>
    receptionType === 'initial'
      ? 'Вам доставить'
      : receptionType === 'delivery'
        ? address.road ? (address.road + ' ' + address.house_number) : 'Укажите адрес'
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
                : <Red>По этому адресу заведение закрыто</Red>
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
    if (hash.includes('#selectLocation')) reception.selectLocationPopup.open()
  }, [hash])

  return <div className={styles.head_wrapper}>
    {/* <div
      className={styles.switcher_button}
      onClick={function () { navigate('#selectLocation') }}
    >
      {getIcon(receptionType)}
      {getCenter()}
    </div>
    <Gurmag36x36 /> */}
    <div className={styles.head_row}>
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
                backgroundVar={'--gur-accent-color'}
                appendImage={null}
              />
            : 
            <div className={styles.reception_wrapper}>
              <div className={styles.text_box}>
                <div className={styles.text_address_row}>
                  <p className={styles.text_address}>{getAddress()}</p>
                  <Image
                    src={IconDown}
                    width={10}
                    height={6}
                    fit='cover'
                  />
                </div>
                <p className={styles.reception_hint}>{getHint()}</p>
              </div>
              {/* <DownOutline /> */}
            </div>
        }
      </div>
      <div className={styles.icon_wrapper}>
        <CircleIcon image={LogoGurmag} size={36} />
      </div>
    </div>
    {
    (false)
      ? <div className={styles.head_row}>
        <SelectLocationPopup
          show={show}
          close={function () {
            close()
            navigate('/')
          }}
        />
        <Popover
          visible={needAskLocation}
          content={getPopText()}
          placement='bottom-end'
          style={{ zIndex: 1000 }}
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
                    onClick={() => {}}
                    height={'35px'}
                    maxWidth={'215px'}
                    marginTop={'0px'}
                    marginBottom={'0px'}
                    marginHorizontal={'14px'}
                    paddingHorizontal={'24px'}
                    fontWeight={'400'}
                    fontSize={'14.5px'}
                    backgroundVar={'--gur-accent-color'}
                    appendImage={null}
                  />
                : 
                <div className={styles.reception_wrapper}>
                  <div className={styles.text_box}>
                    <div className={styles.text_address_row}>
                      <p className={styles.text_address}>{getAddress()}</p>
                      <Image
                        src={IconDown}
                        width={10}
                        height={6}
                        fit='cover'
                      />
                    </div>
                    <p className={styles.reception_hint}>{getHint()}</p>
                  </div>
                  {/* <DownOutline /> */}
                </div>
            }
          </div>
        </Popover>
        <div className={styles.icon_wrapper}>
          <CircleIcon image={LogoGurmag} size={36} />
        </div>
      </div>
      : null
    }
  </div>
})

export default ReceptionSwitcher