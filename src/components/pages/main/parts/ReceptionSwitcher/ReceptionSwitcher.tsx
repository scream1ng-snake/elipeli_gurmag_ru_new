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
import InfoBlock from '../../../../special/InfoBlock'

import IconDelivery from '../../../../../assets/icon_delivery.png'
import IconChoice from '../../../../../assets/icon_choice.png'
import IconPickup from '../../../../../assets/icon_pickup.png'
import IconDown from '../../../../../assets/icon_down.svg'
import ImageBaker from '../../../../../assets/image_baker.png'

import LogoGurmag from '../../../../../assets/logo_gurmag.png'
import LogoGurmagApp from '../../../../../assets/logo_gurmag_app.png'

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
    address
  } = reception



  /* const getIcon = () =>
    receptionType === 'initial'
      ? <QuestionCircleOutline fontSize={32} color={"var(--gurmag-accent-color)"} />
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

  useEffect(() => {
    if (hash.includes('#selectLocation')) reception.selectLocationPopup.open()
  }, [hash])

  return <div className={styles.head_wrapper}>
    <InfoBlock 
      image={LogoGurmagApp}
      onClose={() => {}}
      title={'Гурмаг - ЕлиПели. Доставка вкусных блюд.'}
      text={'Удобное приложение в Telegram БЕЗ СКАЧИВАНИЯ'}
      button={
        <CustomButton
          text={'Приложение в Telegram'}
          onClick={() => {}}
          height={'35px'}
          maxWidth={'auto'}
          
          marginTop={'10px'}
          marginBottom={'0px'}
          marginHorizontal={'14px'}
          paddingHorizontal={'24px'}
          fontWeight={'700'}
          
          backgroundVar={'--gur-accent-color'}
          appendImage={null}
        />
      }
    />
    {
      (false)
      ? <CustomButton
        text={'Войти по номеру телефона'}
        onClick={() => {}}
        height={'35px'}
        maxWidth={'auto'}
        
        marginTop={'0px'}
        marginBottom={'8px'}
        marginHorizontal={'9px'}
        paddingHorizontal={'24px'}
        fontWeight={'400'}
        
        backgroundVar={'--gur-secondary-accent-color'}
        appendImage={ImageBaker}
      />
      : null
    }
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