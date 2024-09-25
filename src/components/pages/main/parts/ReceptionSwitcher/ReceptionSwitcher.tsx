import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import styles from './ReceptionSwitcher.module.css'
import { useGoUTM, useStore } from '../../../../../features/hooks'
import SelectLocationPopup from '../../../../popups/SelectLocation'
import Red from '../../../../special/RedText'
// import { Popover } from 'antd-mobile/es/components/popover/popover'
// import { Image, Button } from 'antd-mobile'
/*
import DeliveryIcon from '../../../../icons/Delivery'
import PickupIcon from '../../../../icons/Pickup'
import { QuestionCircleOutline } from 'antd-mobile-icons'
*/
import CircleIcon from '../../../../icons/Circle'
import CustomButton from '../../../../special/CustomButton'

// import { Void } from '../../../../layout/Void'
// import { Pickup36x36 } from '../../../../icons/Pickup'
// import { Delivery36x36 } from '../../../../icons/Delivery'
// import { Question36x36 } from '../../../../icons/Question36x36'
// import { Gurmag36x36 } from '../../../../icons/Gurmag36x36'
import { IconDown } from '../../../../icons/IconDown'

import IconDelivery from '../../../../../assets/icon_delivery@2x.png'
import IconChoice from '../../../../../assets/icon_choice@2x.png'
import IconPickup from '../../../../../assets/icon_pickup@2x.png'

import LogoGurmag from '../../../../../assets/logo_gurmag@2x.png'

const ReceptionSwitcher: FC = observer(() => {
  const { auth, reception } = useStore()
  const navigate = useGoUTM()
  const {
    isWorkingNow,
    receptionType,
    selectLocationPopup: { show, close, open },
    currentOrganizaion,
    address,
  } = reception

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
            background: ' var(--tg-theme-bg-color)',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
            borderBottomLeftRadius: '0px',
            borderBottomRightRadius: '0px',
          }
          : {
            background: ' var(--tg-theme-secondary-bg-color)'
          }
      }
    >
      <div
        className={styles.head_row}
      >
        <div
          className={styles.switcher_button}
          onClick={open}
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
                onClick={open}
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
              </div>
          }
        </div>
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
      </div>
    </div>
  </div>
})

export default ReceptionSwitcher