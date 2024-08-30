import { Popup, Space, Button, DotLoading } from 'antd-mobile'
import { CloseOutline, LocationOutline, TravelOutline } from 'antd-mobile-icons'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'
import { useStore } from '../../features/hooks'
import { ReceptionType } from '../../stores/reception.store'
import Maps from '../special/Map'
import InputAddressForm from '../forms/InputAddr/InputAddressForm'
import styles from './SelectLocation.module.css'
import { Mask } from '../special/Mask'
import SelectOrgForm from '../forms/selectOrganization/SelectOrg'
import { useLocation, useNavigate } from 'react-router-dom'
import { Optional } from '../../features/helpers'
import ToggleSelector from '../special/ToggleSelector'

type P = {
  show: boolean,
  close: () => void,
  onContinue: () => void
}
const SelectLocationPopup: FC<P> = observer(p => {
  const { hash } = useLocation()
  const navigate = useNavigate()
  let {
    reception: {
      receptionType,
      options,
      setReceptionType,
      addrsBindings,
      setAddrByCordinates,
      location,
      reverseGeocoderApi,
      loadOrganizations, 
      geocoderApi,
      currentOrgID,
      requestGeolocation
    }
  } = useStore()

  const [clickedOrgID, setClickedOrgID] = useState<Optional<number>>(currentOrgID)
  useEffect(() => {
    if(hash.includes('#selectLocation/delivery')) {
      setReceptionType('delivery')
    } else if(hash.includes('#selectLocation/pickup')) {
      setReceptionType('pickup')
    }
  }, [hash])

  const PopupHeader: FC = () =>
    <div className={styles.shtorka_box}>
      <div className={styles.shtorka}></div>
    </div>

  const AskLocation: FC<any> = props => 
    <div className={styles.location_box}>
      <Button onClick={props.onClick} className={styles.location_ico}>
        <LocationOutline className={styles.location_svg} />
      </Button>
    </div>

  const isMapSearching = [
    geocoderApi.state, 
    loadOrganizations.state, 
    reverseGeocoderApi.state
  ].includes('LOADING')

  function getContent(rc: ReceptionType) {
    switch (rc) {
      case 'delivery':
        return <div className={styles.container}>
          <div className={styles.map_area}>
            {isMapSearching
              ? <Mask>
                <DotLoading style={{ fontSize: 48 }} color='primary' />
              </Mask>
              : null
            }
            <Maps.Picker
              value={location}
              onSelect={setAddrByCordinates}
            />
          </div>
          <div className={styles.popup_area}>
            <AskLocation onClick={requestGeolocation} />
            <PopupHeader />
            <InputAddressForm onContinue={p.onContinue} />
          </div>
        </div>

      case 'pickup':
        return <div className={styles.container}>
          <div className={styles.map_area}>
            {isMapSearching
              ? <Mask>
                <DotLoading style={{ fontSize: 48 }} color='primary' />
              </Mask>
              : null
            }
            <Maps.RadioPicker
              onSwitch={(s) => {
                s?.key
                  ? setClickedOrgID(s.key)
                  : setClickedOrgID(null)
               }}
              items={addrsBindings.map(val => {
                const [lat, lon] = val.pos.split(' ').map(Number)
                return { lat, lon, key: val.Id }
              })}
            />
          </div>
          <div className={styles.popup_area}>
            <AskLocation onClick={requestGeolocation} />
            <PopupHeader />
            <SelectOrgForm 
              clickedOrgID={clickedOrgID}
              setClickedOrgID={setClickedOrgID} 
              onContinue={p.onContinue}
            />
          </div>
        </div>
    }
  }

  return (
    <Popup
      position='bottom'
      visible={p.show}
      onClose={p.close}
      onMaskClick={p.close}
      bodyStyle={{ width: '100vw', height: '100%' }}
    >
      <div style={{ position: 'relative' }}>
        <Space
          style={{
            position: 'absolute',
            width: 'calc(100vw - 1rem)',
            marginTop: '0.75rem',
            padding: '0 0.5rem',
            zIndex: 100
          }}
          justify='between'
        >
          <Button onClick={p.close} shape='rounded'>
            <CloseOutline />
          </Button>
          <ToggleSelector
            options={options}
            value={receptionType}
            backgroundVar={'--tg-theme-bg-color'}
            buttonBackgroundVar={'--tg-theme-bg-color'}
            buttonActiveBackgroundVar={'--gurmag-accent-color'}
            colorVar={'--громкий-текст'}
            activeColorVar={'--gur-custom-button-text-color'}
            onChange={function (value:any) {
              navigate('#selectLocation/' + value)
            }}
          />
        </Space>
      </div>
      {getContent(receptionType)}
    </Popup>
  )
})

export default SelectLocationPopup