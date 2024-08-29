import { FC, Fragment, useMemo } from 'react'
import styles from '../form.module.css'
import { Form, Input, Button, Popup, List, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../../features/hooks'
import _ from 'lodash'
import { CloseOutline, LeftOutline } from 'antd-mobile-icons'
import Red from '../../special/RedText'
import { Optional } from '../../../features/helpers'

type Pr = {
  clickedOrgID: Optional<number>,
  setClickedOrgID: (id: Optional<number>) => void
  onContinue: () => void
}
const SelectOrgForm: FC<Pr> = observer(p => {
  const { reception } = useStore()
  let {
    selectOrgPopup,
    isWorkingNow,
    organizations
  } = reception

  const clickedOrg = useMemo(
    () => organizations.find(o => o.Id === p.clickedOrgID),
    [p.clickedOrgID]
  )

  return <Fragment>
    <SelectOrgPopup
      show={selectOrgPopup.show}
      close={selectOrgPopup.close}
    />
    <Space
      justify='between'
      align='center'
      style={{ width: '100%' }}
    >
      <div className={styles.city_label}>
        Уфа
      </div>
      {!p.clickedOrgID
        ? null
        : <Button
          style={{ marginTop: '1rem', marginRight: '0.75rem' }}
          onClick={() => p.setClickedOrgID(null)}
          shape='rounded'
        >
          <CloseOutline />
        </Button>
      }
    </Space>

    <Form layout='vertical' style={{ '--border-top': 'none' }}>
      {!p.clickedOrgID
        ? <Form.Item className={styles.addr_from_input}>
          <Input placeholder='Найти заведение' onClick={selectOrgPopup.open} />
        </Form.Item>
        : <Form.Item
          extra={<p>9:30 - 21:30</p>}
          className={styles.addr_from_input}
          label={isWorkingNow
            ? 'Открыто'
            : <Red>Закрыто</Red>
          }
        >
          <h3>{clickedOrg?.Name.replace('_', ' ')}</h3>
        </Form.Item>
      }
      <Form.Item>
        <Button
          color='primary'
          type="submit"
          fill='solid'
          shape='rounded'
          size='large'
          style={{ width: '100%' }}
          disabled={!p.clickedOrgID}
          onClick={() => {
            if (p.clickedOrgID) {
              reception.currentOrgID = p.clickedOrgID
              p.onContinue()
            }
          }}
        >
          Заказать здесь
        </Button>
      </Form.Item>
    </Form>
  </Fragment>
})
export default SelectOrgForm

type P = {
  show: boolean,
  close: () => void
}
const SelectOrgPopup: FC<P> = observer(p => {
  const { reception } = useStore()
  return (
    <Popup
      position='bottom'
      visible={p.show}
      onClose={p.close}
      onMaskClick={p.close}
      bodyStyle={{ width: '100vw', height: '100%' }}
    >
      <Space
        style={{
          width: 'calc(100vw - 1rem)',
          margin: '0.75rem 0',
          padding: '0 0.5rem',
        }}
        align='center'
      >
        <Button onClick={p.close} shape='rounded'>
          <LeftOutline />
        </Button>
        <h2>Заведения</h2>
      </Space>
      <List>
        {reception.organizations.map(o =>
          <List.Item
            key={o.Id}
            onClick={() => { reception.currentOrgID = o.Id }}
          >
            {o.Name?.replace('_', ' ')}
          </List.Item>
        )}
      </List>
    </Popup>
  )
})