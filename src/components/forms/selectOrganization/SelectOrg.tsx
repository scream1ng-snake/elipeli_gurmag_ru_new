import { FC, Fragment, useMemo } from 'react'
import styles from '../form.module.css'
import { Form, Input, Button, Popup, List, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../../features/hooks'
import _ from 'lodash'
import { LeftOutline } from 'antd-mobile-icons'
import Red from '../../special/RedText'
import { Optional } from '../../../features/helpers'
import CustomButton from '../../special/CustomButton'
import { IconClose } from '../../icons/IconClose'
import AdaptivePopup from '../../common/Popup/Popup'

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
      setClickedOrgID={p.setClickedOrgID}
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
        : 
        <Button
          onClick={() => p.setClickedOrgID(null)}
          shape='rounded'
          style={{
            height: '38px',
            width: '38px',
            marginRight: '1rem'
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
      }
    </Space>

    <Form layout='vertical' style={{ '--border-top': 'none' }}>
      {!p.clickedOrgID
        ? <Form.Item className={styles.addr_from_input}>
          <Input placeholder='Найти заведение' onClick={selectOrgPopup.open} />
        </Form.Item>
        : <Form.Item
          onClick={selectOrgPopup.open} 
          clickable={false}
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
      <Form.Item
        style={{ marginRight: '4px'}}
      >
        <CustomButton
          text={'Заказать здесь'}
          onClick={function() {
            if (p.clickedOrgID) {
              reception.currentOrgID = p.clickedOrgID
              p.onContinue()
            }
          }}
          height={'35px'}
          maxWidth={'auto'}
          
          marginTop={'0px'}
          marginBottom={'0px'}
          marginHorizontal={'0px'}
          paddingHorizontal={'24px'}
          fontWeight={'400'}
          fontSize={'14.5px'}
          backgroundVar={'--gurmag-accent-color'}
          colorVar={'--gur-custom-button-text-color'}
          appendImage={null}
          disabled={
            !p.clickedOrgID
          }
        />
      </Form.Item>
    </Form>
  </Fragment>
})
export default SelectOrgForm

type P = {
  show: boolean,
  close: () => void
  setClickedOrgID: (id: Optional<number>) => void
}
const SelectOrgPopup: FC<P> = observer(p => {
  const { reception } = useStore()
  return (
    <AdaptivePopup
      visible={p.show}
      onClose={p.close}
      noBottomNav
      noCloseBtn
    >
      <Space
        style={{
          minWidth:'400px',
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
            onClick={() => { 
              reception.currentOrgID = o.Id 
              p.close()
              p.setClickedOrgID(o.Id)
            }}
          >
            {o.Name?.replace('_', ' ')}
          </List.Item>
        )}
      </List>
    </AdaptivePopup>
  )
})