import { Popup, Selector, Space, Button } from 'antd-mobile'
import { CloseOutline } from 'antd-mobile-icons'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { useStore } from '../../features/hooks'

type P = {
  show: boolean,
  close: () => void
}
const SelectLocationPopup: FC<P> = observer(p => {
  const { reception: { receptionType, options, setReceptionType } } = useStore()

  return (
    <Popup
      position='bottom'
      visible={p.show}
      onClose={p.close}
      onMaskClick={p.close}
      bodyStyle={{ width: '100vw', height: '100vh' }}
    >
      <Space 
        style={{ 
          width: 'calc(100vw - 1rem)', 
          marginTop: '0.75rem',
          padding: '0 0.5rem'
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
    </Popup>
  )
})

export default SelectLocationPopup