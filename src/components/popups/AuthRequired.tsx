import { Button, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import AdaptivePopup from "../common/Popup/Popup"

const dividerStyles = {
  line: {
    width: '106px',
    height: '1px',
    background: 'rgba(0, 0, 0, 1)'
  },
  word: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: 18,
    lineHeight: '100%'
  }
}
const MyDivider: FC = () => {
  return <Space justify='center' align='center' className="w-100">
    <div style={dividerStyles.line} />
    <span style={dividerStyles.word}>или</span>
    <div style={dividerStyles.line} />
  </Space>
}

const popup = {
  padding: '1rem',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
}
const btn = {
  width: '100%',
  fontWeight: 600,
  color: '#000'
}

const AuthRequiredPopap: FC = observer(() => {
  const go = useGoUTM()
  const { auth } = useStore()
  useEffect(() => {
    if (auth.isFailed) {
      auth.authRequired.open()
    } else {
      auth.authRequired.close()
    }
  }, [auth.isFailed])

  return (
    <AdaptivePopup
      visible={auth.authRequired.show}
      bodyStyle={popup}
      noCloseBtn
      noBottomNav
      shtorkaOffset="-25px"
    >
      <h1
        style={{
          fontFamily: "Arial",
          fontWeight: '700',
          fontSize: "26px",
          lineHeight: '100%',
          textAlign: 'center',
          marginTop: '10px',
          marginBottom: '27px'
        }}
      >
        Войдите по номеру
      </h1>
      <Space direction='vertical' className="w-100" style={{ "--gap": "14px" }}>
        {auth.state !== "AUTHORIZED"
          ? <Button
            shape='rounded'
            color='primary'
            style={btn}
            onClick={() => { go('/authorize') }}
          >
            Уже есть аккаунт? Войти
          </Button>
          : null
        }
        {auth.state !== 'AUTHORIZED'
          ? <Button
            shape='rounded'
            color='primary'
            style={btn}
            onClick={() => { go('/authorize') }}
          >
            Зарегистрироваться
          </Button>
          : null
        }
        {auth.state !== 'AUTHORIZED'
          ? <MyDivider />
          : null
        }
        <Button
          shape='rounded'
          style={{ 
            ...btn, 
            background: "rgba(197, 199, 198, 1)", 
            boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 1)',
            border: 'none'
          }}
          onClick={auth.authRequired.close}
        >
          Продолжить без регистрации
        </Button>
      </Space>
    </AdaptivePopup>
  )
})

export default AuthRequiredPopap