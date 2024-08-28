import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'
import styles from './ReceptionSwitcher.module.css'
import { DownOutline } from 'antd-mobile-icons'
import { useStore } from '../../../../../features/hooks'
import SelectLocationPopup from '../../../../popups/SelectLocation'
import { useLocation, useNavigate } from 'react-router-dom'
import Red from '../../../../special/RedText'
import { Void } from '../../../../layout/Void'
import { Pickup36x36 } from '../../../../icons/Pickup'
import { Delivery36x36 } from '../../../../icons/Delivery'
import { Question36x36 } from '../../../../icons/Question36x36'
import { Gurmag36x36 } from '../../../../icons/Gurmag36x36'
import { Button } from 'antd-mobile'

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
      ? <Question36x36 />
      : receptionType === 'delivery'
        ? <Delivery36x36 />
        : <Pickup36x36 />

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
      {getIcon()}
      {getCenter()}
    </div>
    <Gurmag36x36 />
  </div>
})

export default ReceptionSwitcher