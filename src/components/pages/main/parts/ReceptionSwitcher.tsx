import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'
import DeliveryIcon from '../../../icons/Delivery'
import styles from './ReceptionSwitcher.module.css'
import { DownOutline } from 'antd-mobile-icons'
import { useStore } from '../../../../features/hooks'
import PickupIcon from '../../../icons/Pickup'
import SelectLocationPopup from '../../../popups/SelectLocation'
import { useLocation, useNavigate } from 'react-router-dom'

const ReceptionSwitcher: FC = observer(() => {
  const { reception } = useStore()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { 
    receptionType, 
    selectLocationPopup: { show, close }
  } = reception

  const getIcon = () =>
    receptionType === 'delivery'
      ? <DeliveryIcon fontSize={32} color={"var(--gurmag-accent-color)"} />
      : <PickupIcon fontSize={32} color={"var(--gurmag-accent-color)"} />

  const getHint = () => 
    receptionType === 'delivery'
      ? 'Доставка бесплатно'
      : 'Получить заказ в заведении'
  
  const getAdress = () => 
    receptionType === 'delivery'
      ? 'Заки Валиди 18/4'
      : 'Первомайская 70'

  useEffect(() => {
    if(hash === '#selectLocation') reception.selectLocationPopup.open()
  }, [hash])

  return <div className={styles.head_wrapper}>
    <SelectLocationPopup 
      show={show} 
      close={function() {
        close()
        navigate(-1)
      }} 
    />
    <button
      className={styles.switcher_button}
      onClick={function () { navigate('#selectLocation') }}
    >
      <div className={styles.icon_wrapper}>
        {getIcon()}
      </div>
      <div className={styles.text_box}>
        <p>{getAdress()}</p>
        <p className={styles.receptiom_hint}>{getHint()}</p>
      </div>
      <DownOutline />
    </button>
  </div>
  })

export default ReceptionSwitcher