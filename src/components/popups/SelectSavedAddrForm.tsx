import { Button, Checkbox, List, Space } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useStore } from "../../features/hooks";
import { Location, SavedAddr } from "../../stores/location.store";
type Props = {
  show: boolean,
  open: () => void
  close: () => void
  onContinue: () => void
}
export const SelectSavedAddrForm: FC<Props> = observer(props => {
  const { reception, reception: { Location }} = useStore()
  const { savedAddrs, inputingAddress, confirmedAddress } = Location
  const { road, house_number, entrance, storey, apartment, addrComment, incorrectAddr } = Location.confirmedAddress

  function setActive(myAddr: SavedAddr) {
    Location.setInputingAddrFromSaved(myAddr)
  }

  function goToInputAddress() {
    props.close()
  }
  const currentIsNotInList = !savedAddrs.find(sa => {
    return sa.street == road && sa.house == house_number
  }
  )
  console.log(currentIsNotInList)
  return <Space style={{ width: '100%', height: '100%', padding:'0 10px 10px 10px' }} direction='vertical'>
    <Space style={{ width: "100%" }} justify='between' align='center'>
      <p>Мои адреса</p>
      <Button
        fill='solid'
        style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
        shape='rounded'
        onClick={goToInputAddress}
      >
        + Новый адрес
      </Button>
    </Space>
    <List>
      {currentIsNotInList 
        ? <List.Item>
          <Checkbox 
            onClick={() => { 
              Location.setInputingLocation(Location.confirmedLocation as Location)
              Location.setAffectFields({ road, house_number })
              Location.setAdditionalFields({
                entrance,
                storey,
                apartment,
                addrComment,
                incorrectAddr,
              })
            }}
            checked={house_number === inputingAddress.house_number && road === inputingAddress.road}
          >
            {`${road ? 'ул. ' + road : ''} ${house_number ? 'д. ' + house_number : '' } ${entrance ? 'под. ' + entrance : ''} ${storey ? 'эт. ' + storey : ''} ${apartment ? 'кв. ' + apartment : ''}`}
          </Checkbox>
        </List.Item>
        : null
      }
      {savedAddrs.map((saved, index) => {
        const isActive = saved.house === inputingAddress.house_number
          && saved.street === inputingAddress.road
        return <List.Item key={index}>
          <Checkbox checked={isActive} onClick={() => setActive(saved)}>{saved.FullAddress}</Checkbox>
        </List.Item>
      })}
    </List>
    <Button 
      color="primary"
      size='large'
      style={{ width: '100%' }}
      shape='rounded'
      onClick={() => {
        props.onContinue()
        if(confirmedAddress.road === inputingAddress.road && confirmedAddress.house_number === inputingAddress.house_number) {
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