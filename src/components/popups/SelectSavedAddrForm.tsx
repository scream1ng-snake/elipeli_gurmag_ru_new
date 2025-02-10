import { Button, Checkbox, Image, List, Space } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { CSSProperties, FC } from "react";
import { useStore } from "../../features/hooks";
import { initial, Location } from "../../stores/location.store";
import Pencil from '../../assets/Pencil.png'
import { SavedAddress } from "../../stores/SavedAddresses";
import { FullscreenLoading } from "../common/Loading/Loading";
import { toJS } from "mobx";
type Props = {
  show: boolean,
  open: () => void
  close: () => void
  onContinue: () => void
}

const w100 = { width: "100%" }

const containerStyle = {
  width: '100%',
  height: '100%',
  padding: '13px 16px 16px 18px'
}

const myAddrs = {
  fontSize: 22,
  fontWeight: 500,
  lineHeight: '13px',
  letterSpacing: '0.02em'
}

const listItemStyle = {
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: 400,
  lineHeight: '18.4px',
  paddingLeft: 0,
}
const newAddrStyle = {
  background: 'var(--tg-theme-secondary-bg-color)',
  fontSize: 13,
  fontWeight: 400,
  lineHeight: 1,
  padding: '6px 21px'
}
export const SelectSavedAddrForm: FC<Props> = observer(props => {
  const { reception: { Location, suggestitions } } = useStore()
  const { savedAdresses, inputingAddress, confirmedAddress, ConfirmedVcode } = Location
  const { road, house_number, entrance, storey, apartment, addrComment, incorrectAddr } = confirmedAddress

  function setActive(myAddr: SavedAddress) {
    Location.setInputingAddrFromSaved(myAddr)
  }

  function goToInputAddressEdit() {
    suggestitions.setList([])
    props.close()
  }
  function goToInputAddressClear() {
    Location.setInputingVcode(null)
    Location.inputingAddress = initial
    suggestitions.setList([])
    Location.inputingLocation = null
    props.close()
  }
  const setActiveNotSavedAddr = () => {
    Location.setInputingVcode(null)
    Location.setInputingLocation(Location.confirmedLocation as Location)
    Location.setAffectFields({ road, house_number })
    Location.setAdditionalFields({
      entrance,
      storey,
      apartment,
      addrComment,
      incorrectAddr,
    })
  }
  return <Space style={containerStyle} direction='vertical'>
    {savedAdresses.isPending 
      || Location.geocoderApi.state === 'LOADING' 
      || Location.reverseGeocoderApi.state === 'LOADING'
      ? <FullscreenLoading />
      : null
    }
    <Space style={w100} justify='between' align='center'>
      <p style={myAddrs}>
        Мои адреса
      </p> 
      <Button
        fill='solid'
        style={newAddrStyle}
        shape='rounded'
        onClick={goToInputAddressClear}
        size='small'
      >
        + Новый адрес
      </Button>
    </Space>
    <List style={{ "--border-bottom": '1px solid var(--tg-theme-secondary-bg-color)' }}>
      {!ConfirmedVcode
        ? <List.Item 
          style={listItemStyle} 
          extra={
            <Image 
              src={Pencil} 
              onClick={() => {
                setActiveNotSavedAddr()
                goToInputAddressEdit()
              }} 
            />
          }
        >
          <Checkbox
            style={{ "--gap": '10px' }}
            icon={getIcon}
            onClick={setActiveNotSavedAddr}
            checked={house_number === inputingAddress.house_number && road === inputingAddress.road}
          >
            {`${road ? 'ул. ' + road : ''} ${house_number ? 'д. ' + house_number : ''} ${entrance ? 'под. ' + entrance : ''} ${storey ? 'эт. ' + storey : ''} ${apartment ? 'кв. ' + apartment : ''}`}
          </Checkbox>
        </List.Item>
        : null
      }
      {Array.from(savedAdresses.onServer.values()).map((saved, index) => {
        const isActive = saved.house === inputingAddress.house_number
          && saved.street === inputingAddress.road
        return <List.Item
          key={index}
          style={listItemStyle}
          extra={
            <Image
              src={Pencil}
              onClick={() => {
                setActive(saved)
                goToInputAddressEdit()
              }}
            />
          }
        >
          <Checkbox style={{ "--gap": '10px' }} icon={getIcon} checked={isActive} onClick={() => setActive(saved)}>{saved.FullAddress}</Checkbox>
        </List.Item>
      })}
    </List>
    <Button
      color="primary"
      size='large'
      style={{
        ...w100,
        "--background-color": 'rgba(241, 187, 51, 1)',
        "--text-color": 'white'
      }}
      shape='rounded'
      onClick={() => {
        props.onContinue()
        if (road === inputingAddress.road && house_number === inputingAddress.house_number) {
          return
        } else {
          Location.setConfirmedAddrFromSaved()
        }
      }}
    >
      Доставить сюда
    </Button>
  </Space>
})

const getIcon = (checked: boolean) => <Icon checked={checked} />

const checkboxStyle: CSSProperties = {
  width: 19,
  height: 19,
  borderRadius: 100,
  boxSizing: 'border-box'
}
const Icon: FC<{ checked: boolean }> = ({ checked }) => checked
  ? <div
    style={{
      ...checkboxStyle,
      background: 'none',
      border: '6px solid rgba(1, 98, 65, 1)'
    }}
  />
  : <div
    style={{
      ...checkboxStyle,
      background: 'var(--tg-theme-secondary-bg-color)',
      border: 'none'
    }}
  />