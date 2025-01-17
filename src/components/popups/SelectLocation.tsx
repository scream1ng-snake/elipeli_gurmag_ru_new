import { Popup, Space, Button, DotLoading } from 'antd-mobile'
import { LocationOutline } from 'antd-mobile-icons'
import { observer } from 'mobx-react-lite'
import { FC, useState } from 'react'
import { useStore } from '../../features/hooks'
import { apikey, ReceptionType } from '../../stores/reception.store'
import Maps from '../special/Map'
import InputAddressForm from '../forms/InputAddr/InputAddressForm'
import styles from './SelectLocation.module.css'
import { Mask } from '../special/Mask'
import SelectOrgForm from '../forms/selectOrganization/SelectOrg'
import { Optional } from '../../features/helpers'
import ToggleSelector from '../special/ToggleSelector'
import { IconClose } from '../icons/IconClose'
import Container from "react-bootstrap/Container"
import { YMaps } from '@pbe/react-yandex-maps'
import { SelectSavedAddrForm } from './SelectSavedAddrForm'

type P = {
  show: boolean,
  close: () => void,
  onContinue: () => void
}
const SelectLocationPopup: FC<P> = observer(p => {
  let {
    user,
    reception: {
      receptionType,
      options,
      setReceptionType,
      orgsCoords,
      loadOrganizations,
      currentOrgID,
      Location
    }
  } = useStore()
  const {
    setAddressByCoords,
    inputingLocation,
    reverseGeocoderApi,
    geocoderApi,
    requestGeolocation,
    savedAdresses
  } = Location

  const [clickedOrgID, setClickedOrgID] = useState<Optional<number>>(currentOrgID)

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
        if(user.loadUserInfo.state === 'LOADING') {
          return <Mask>
            <DotLoading style={{ fontSize: 48 }} color='primary' />
          </Mask>
        }
        if (savedAdresses.onServer.length && user.loadUserInfo.state === 'COMPLETED' && Location.savedAdresses.page.show) {
          return <div className={styles.container}>
            <div className={styles.map_area}>
              {isMapSearching
                ? <Mask>
                  <DotLoading style={{ fontSize: 48 }} color='primary' />
                </Mask>
                : null
              }
              <Maps.Picker
                value={inputingLocation}
                onSelect={setAddressByCoords}
              />
            </div>
            <div className={styles.popup_area}>
              <PopupHeader />
              <Container className='p-0'>
                <AskLocation onClick={requestGeolocation} />
                <SelectSavedAddrForm 
                  show={Location.savedAdresses.page.show}
                  open={Location.savedAdresses.page.open}
                  close={Location.savedAdresses.page.close}
                  onContinue={p.onContinue} 
                />
              </Container>
            </div>
          </div>
        } else {
          return <div className={styles.container}>
            <div className={styles.map_area}>
              {isMapSearching
                ? <Mask>
                  <DotLoading style={{ fontSize: 48 }} color='primary' />
                </Mask>
                : null
              }
              <Maps.Picker
                value={inputingLocation}
                onSelect={setAddressByCoords}
              />
            </div>
            <div className={styles.popup_area}>
              <PopupHeader />
              <Container className='p-0'>
                <AskLocation onClick={requestGeolocation} />
                <InputAddressForm 
                  onContinue={() => {
                    p.onContinue()
                    Location.savedAdresses.page.open()
                  }} 
                />
              </Container>
            </div>
          </div>
        }

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
                s?.Id
                  ? setClickedOrgID(s.Id)
                  : setClickedOrgID(null)
              }}
              items={orgsCoords}
              defaultSelected={orgsCoords.find(val => val.Id === clickedOrgID)}
            />
          </div>
          <div className={styles.popup_area}>
            <PopupHeader />
            <Container className='p-0'>
              <AskLocation onClick={requestGeolocation} />
              <SelectOrgForm
                clickedOrgID={clickedOrgID}
                setClickedOrgID={setClickedOrgID}
                onContinue={p.onContinue}
              />
            </Container>
          </div>
        </div>
    }
  }

  const closeFn = () => {
    p.close()
    Location.savedAdresses.page.open()
  }
  return (
    <Popup
      position='bottom'
      visible={p.show}
      onClose={closeFn}
      onMaskClick={closeFn}
      bodyStyle={{ width: '100vw', height: '100%' }}
    >
      <Container className='p-0'>
        <div style={{ position: 'relative' }}>
          <Space
            style={{
              position: 'absolute',
              width: 'calc(100% - 1rem)',
              marginTop: '0.75rem',
              padding: '0 0.5rem',
              zIndex: 100
            }}
            justify='between'
          >
            <Button
              onClick={closeFn}
              shape='rounded'
              style={{
                height: '38px',
                width: '38px',
              }}
            >
              <span style={{ marginLeft: '-4px' }} >
                <IconClose
                  width={21}
                  height={23}
                  color={"var(--громкий-текст)"}
                />
              </span>
            </Button>
            <ToggleSelector
              options={options}
              value={receptionType}
              backgroundVar={'--tg-theme-bg-color'}
              buttonBackgroundVar={'--tg-theme-bg-color'}
              buttonActiveBackgroundVar={'--gurmag-accent-color'}
              colorVar={'--громкий-текст'}
              activeColorVar={'--gur-custom-button-text-color'}
              onChange={setReceptionType}
            />
          </Space>
        </div>
      </Container>
      <YMaps query={{ apikey }}>
        {getContent(receptionType)}
      </YMaps>
    </Popup>
  )
})

export default SelectLocationPopup