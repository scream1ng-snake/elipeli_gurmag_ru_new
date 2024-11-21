import { Button, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import AdaptivePopup from "../common/Popup/Popup"

const popup = { 
  padding: '1rem',
  borderTopLeftRadius: 13,
  borderTopRightRadius: 13,
  zIndex:10000
}
const btn = { 
  width: '100%',  
  fontWeight: 600 
}

const AskLocation: FC = observer(() => {
  const go = useGoUTM()
  const { reception, auth } = useStore()
  const visible = !reception.nearestOrgForDelivery && !reception.selectedOrgID && auth.bannerAskAdress.show /* reception.receptionType === 'initial' && auth.isFailed */

  return (
    <AdaptivePopup
      visible={visible}
      noBottomNav
      noCloseBtn
      bodyStyle={popup}
    >
      <h1>Какой у вас адрес?</h1>
      <br />
      <p>Хотим убедиться, что вы в зоне доставки. Адрес сохраним для будущих заказов</p>
      <br />
      <Space direction='vertical' className="w-100">
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
    </AdaptivePopup>
  )
})

export default AskLocation