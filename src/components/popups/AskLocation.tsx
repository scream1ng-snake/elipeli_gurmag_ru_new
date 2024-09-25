import { Button, Popup, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import { useNavigate } from "react-router-dom"
import { receptionTypes } from "../../stores/reception.store"

const popup = { 
  width: 'calc(100vw - 2rem)', 
  padding: '1rem',
  borderTopLeftRadius: 13,
  borderTopRightRadius: 13,
}
const btn = { 
  width: 'calc(100vw - 2rem)',  
  fontWeight: 600 
}

const AskLocation: FC = observer(() => {
  const go = useGoUTM()
  const { reception, auth } = useStore()
  const visible = !reception.nearestOrgForDelivery && !reception.selectedOrgID && auth.bannerAskAdress.show /* reception.receptionType === 'initial' && auth.isFailed */

  return (
    <Popup
      visible={visible}
      bodyStyle={popup}
    >
      <h1>Какой у вас адрес?</h1>
      <br />
      <p>Хотим убедиться, что вы в зоне доставки. Адрес сохраним для будущих заказов</p>
      <br />
      <Space direction='vertical'>
        <Button 
          shape='rounded'
          color='primary'
          style={btn}
          onClick={() => {
            auth.bannerAskAdress.close()
            reception.setReceptionType('delivery')
            reception.selectLocationPopup.open()
          }}
        >
          Указать адрес доставки
        </Button>
        <Button 
          shape='rounded'
          color='warning'
          fill='outline'
          onClick={() => {
            auth.bannerAskAdress.close()
            reception.setReceptionType('pickup')
            reception.selectLocationPopup.open()
          }}
          style={btn}
        >
          Заберу сам
        </Button>
        {
          auth.state !== "AUTHORIZED"
          ? <Button 
            shape='rounded'
            style={btn}
            onClick={() => { go('/authorize') }}
          >
            Уже есть аккаунт? <span style={{ color: 'var(--adm-color-warning)' }}>Войти</span>
          </Button>
          : null
        }
      </Space>
    </Popup>
  )
})

export default AskLocation