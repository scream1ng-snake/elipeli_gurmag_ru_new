import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'
import DeliveryIcon from '../../../icons/Delivery'
import styles from './ReceptionSwitcher.module.css'
import { DownOutline } from 'antd-mobile-icons'
import { useStore } from '../../../../features/hooks'
import PickupIcon from '../../../icons/Pickup'
import SelectLocationPopup from '../../../popups/SelectLocation'
import { useLocation, useNavigate } from 'react-router-dom'
import { QuestionCircleOutline } from 'antd-mobile-icons'
import Red from '../../../special/RedText'

const ReceptionSwitcher: FC = observer(() => {
  const { reception } = useStore()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const {
    isWorkingNow,
    receptionType,
    selectLocationPopup: { show, close },
    currentOrganizaion,
    address
  } = reception

  

  const getIcon = () =>
    receptionType === 'initial'
      ? <QuestionCircleOutline fontSize={32} color={"var(--gurmag-accent-color)"} />
      : receptionType === 'delivery'
        ? <DeliveryIcon fontSize={32} color={"var(--gurmag-accent-color)"} />
        : <PickupIcon fontSize={32} color={"var(--gurmag-accent-color)"} />

  const getHint = () =>
    receptionType === 'initial'
      ? 'или заберёте сами?'
      : receptionType === 'delivery'
        ? isWorkingNow ? 'Доставка бесплатно' : <Red>По этому адресу заведение закрыто</Red>
        : isWorkingNow ? 'Забрать из Гурмага' : <Red>Закрыто - Откроется в 9:30</Red>

  const getAdress = () =>
    receptionType === 'initial'
      ? 'Вам доставить'
      : receptionType === 'delivery'
        ? address.road + ' ' + address.house_number
        : currentOrganizaion?.Name.replace('_', ' ')

  useEffect(() => {
    if (hash.includes('#selectLocation')) reception.selectLocationPopup.open()
  }, [hash])

  return <div className={styles.head_wrapper}>
    <SelectLocationPopup
      show={show}
      close={function () {
        close()
        navigate('/')
      }}
    />
    <div
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
    </div>
  </div>
})

export default ReceptionSwitcher