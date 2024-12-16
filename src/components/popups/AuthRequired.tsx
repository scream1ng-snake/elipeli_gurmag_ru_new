import { Button, Popup, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import AdaptivePopup from "../common/Popup/Popup"

const popup = { 
  padding: '1rem',
  borderTopLeftRadius: 13,
  borderTopRightRadius: 13,
}
const btn = { 
  width: '100%',  
  fontWeight: 600 
}

const AuthRequiredPopap: FC = observer(() => {
  const go = useGoUTM()
  const { reception, auth } = useStore()

  return (
    <AdaptivePopup
      visible={auth.authRequired.show}
      bodyStyle={popup}
      noCloseBtn
      noBottomNav
    >
      <h1>Войдите по номеру</h1>
      <br />
      <Space direction='vertical' className="w-100">
      <Button 
        shape='rounded'
        style={btn}
        onClick={() => { go('/authorize') }}
      >
        <span style={{ color: 'var(--adm-color-warning)' }}>Войти</span>
        {' или '}
        <span style={{ color: 'var(--adm-color-warning)' }}>Зарегистрироваться</span>
      </Button>
      </Space>
    </AdaptivePopup>
  )
})

export default AuthRequiredPopap