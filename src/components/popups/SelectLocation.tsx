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
import AdaptivePopup from '../common/Popup/Popup'
import { Col, Row } from 'react-bootstrap'
import { FullscreenLoading } from '../common/Loading/Loading'

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
    savedAdresses,
    jsonMap
  } = Location

  const [clickedOrgID, setClickedOrgID] = useState<Optional<number>>(currentOrgID)

  const PopupHeader: FC = () =>
    <div className={styles.shtorka_box}>
      <div className={styles.shtorka}></div>
    </div>

  const AskLocation: FC<any> = props =>
    <div className={styles.location_box + " " + (props.className || '')}>
      <Button onClick={props.onClick} className={styles.location_ico}>
        <LocationOutline className={styles.location_svg} />
      </Button>
    </div>

  const isMapSearching = [
    geocoderApi.state,
    loadOrganizations.state,
    reverseGeocoderApi.state
  ].includes('LOADING')

  const TopRow: FC = () => 
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

  function getContent(rc: ReceptionType) {
    switch (rc) {
      case 'delivery':
        if(user.loadUserInfo.state === 'LOADING') {
          return <Mask>
            <DotLoading style={{ fontSize: 48 }} color='primary' />
          </Mask>
        }
        if (Array.from(savedAdresses.onServer.values()).length && user.loadUserInfo.state === 'COMPLETED' && savedAdresses.page.show) {
          return <Row className='h-100 superRow'>
            <Col md={6} className='superCol'>
              <TopRow />
              {isMapSearching
                ? <FullscreenLoading />
                : null
              }
              <Maps.Picker
                value={inputingLocation}
                onSelect={coords => {
                  if(savedAdresses.page.show) savedAdresses.page.close()
                  setAddressByCoords(coords)
                }}
                features={jsonMap?.features}
                resizeSignal={savedAdresses.page.show}
              />
              <AskLocation 
                className="d-none d-sm-block" 
                onClick={requestGeolocation} 
              />
            </Col>
            <Col md={6}>
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
            </Col>
          </Row>
        } else {
          return <Row className='h-100 superRow'>
            <Col md={6} className='superCol'>
              <TopRow />
              {isMapSearching
                ? <FullscreenLoading />
                : null
              }
              <Maps.Picker
                value={inputingLocation}
                onSelect={setAddressByCoords}
                features={jsonMap?.features}
                resizeSignal={savedAdresses.page.show}
              />
              <AskLocation 
                className="d-none d-sm-block" 
                onClick={requestGeolocation} 
              />
            </Col>
            <Col md={6} className='p-md-3'>
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
            </Col>
          </Row>
        }

      case 'pickup':
        return <Row className='h-100 superRow'>
          <Col md={6} className='superCol'>
          <TopRow />
            {isMapSearching
              ? <FullscreenLoading />
              : null
            }
            <Maps.RadioPicker
              features={jsonMap?.features}
              onSwitch={(s) => {
                s?.Id
                  ? setClickedOrgID(s.Id)
                  : setClickedOrgID(null)
              }}
              items={orgsCoords}
              defaultSelected={orgsCoords.find(val => val.Id === clickedOrgID)}
              // features={jsonMap.features}
            />
            <AskLocation 
              className="d-none d-sm-block" 
              onClick={requestGeolocation} 
            />
          </Col>
          <Col md={6} className='p-md-3'>
            <PopupHeader />
            <Container className='p-0'>
              <AskLocation onClick={requestGeolocation} />
              <SelectOrgForm
                clickedOrgID={clickedOrgID}
                setClickedOrgID={setClickedOrgID}
                onContinue={p.onContinue}
              />
            </Container>
          </Col>
        </Row>
    }
  }

  const closeFn = () => {
    p.close()
    Location.savedAdresses.page.open()
  }
  return (
    <AdaptivePopup
      visible={p.show}
      onClose={closeFn}
      noCloseBtn
      noBottomNav
      bodyClassName='mediaPopup'
    >
      <Container className='p-0 w-100 h-100'>
        <YMaps query={{ apikey }}>
          {getContent(receptionType)}
        </YMaps>
      </Container>
    </AdaptivePopup>
  )
})

export default SelectLocationPopup