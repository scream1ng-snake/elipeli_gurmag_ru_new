import { Popup, Selector, Space, Button, DotLoading } from 'antd-mobile'
import { CloseOutline } from 'antd-mobile-icons'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useStore } from '../../features/hooks'
import { ReceptionType } from '../../stores/reception.store'
import Maps from '../special/Map'
import InputAddressForm from '../forms/InputAddr/InputAddressForm'
import styles from './SelectLocation.module.css'
import { Mask } from '../special/Mask'

type P = {
  show: boolean,
  close: () => void
}
const SelectLocationPopup: FC<P> = observer(p => {
  const {
    reception: {
      receptionType,
      options,
      setReceptionType,
      addrsBindings, 
      setAddrByCordinates,
      location,
      reverseGeocoderApi,
      geocoderApi
    }
  } = useStore()

  const PopupHeader: FC = () =>
    <div className={styles.shtorka_box}>
      <div className={styles.shtorka}></div>
    </div>

  function getContent(rc: ReceptionType) {
    switch (rc) {
      case 'delivery':
        return <div className={styles.container}>
          <div className={styles.map_area}>
            {reverseGeocoderApi.state === 'LOADING' || geocoderApi.state === 'LOADING'
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
            <PopupHeader />
            <InputAddressForm />
          </div>
        </div>

      case 'pickup':
        return <React.Fragment>
          <Maps.RadioPicker
            onSwitch={console.log}
            items={addrsBindings.map(val => {
              const [lat, lon] = val.pos.split(' ').map(Number)
              return { lat, lon, key: val.Id }
            })}
          />
        </React.Fragment>

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
          <Selector
            style={{
              '--border-radius': '100px',
              '--border': 'solid transparent 1px',
              '--checked-border': 'solid var(--adm-color-primary) 1px',
              '--padding': '8px 24px',
            }}
            showCheckMark={false}
            options={options}
            value={[receptionType]}
            onChange={function (v) {
              setReceptionType(v[0])
            }}
          />
        </Space>
      </div>
      {getContent(receptionType)}
    </Popup>
  )
})

export default SelectLocationPopup