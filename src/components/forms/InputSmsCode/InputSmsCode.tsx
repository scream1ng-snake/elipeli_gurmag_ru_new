import { Space, PasscodeInput, Form, NavBar, Popup, PasscodeInputRef } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef } from "react"
import { useGoUTM, useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import { FullscreenLoading } from "../../common/Loading/Loading"


const InputSmsCode: FC = observer(() => {
  const ref = useRef<PasscodeInputRef>(null)
  const go = useGoUTM()
  const LENGHT = 4

  const { auth } = useStore()
  function onFill(val: string) {
    auth.inputSmsCode.run(val)
  }

  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <Popup visible bodyClassName={styles.wrapper}>
      {auth.inputSmsCode.state === 'LOADING' 
        ? <FullscreenLoading />
        : null
      }
      <NavBar onBack={() => { go('/') }}>
        Подтвердите номер
      </NavBar>
      <Form>
        <Form.Item
          label='Мы отправили SMS с кодом на указанный номер. Введите код подтверждения:'
        >
          <Space justify='center' style={{ width: "100%" }}>
            <PasscodeInput 
              ref={ref} 
              length={LENGHT} 
              onFill={onFill} 
            />
          </Space>
        </Form.Item>
      </Form>
    </Popup>
  )
})

export default InputSmsCode