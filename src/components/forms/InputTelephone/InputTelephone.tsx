import { Input, Button, Popup, NavBar, Form } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import { getFormattedNumber, useMask } from "react-phone-hooks"
import { useNavigate, useParams } from "react-router-dom"
import { useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import Red from "../../special/RedText"


const defaultMask = "+7 ... ... .. .."
const defaultPrefix = "+7"
const phoneRegex = /^((\+8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/

const InputNumber: FC = observer(() => {
  const go = useNavigate()
  const { auth } = useStore()
  const { tel } = useParams()
  const [number, setNumber] = useState(defaultPrefix)
  const [errored, setErrored] = useState(false)

  function onChange(value: string) {
    setNumber(getFormattedNumber(value, defaultMask))
    phoneRegex.test(number)
      ? setErrored(false)
      : setErrored(true)
  }

  function submit() {
    const clearNumber = number.replace(/\D/g, '')
    auth.authorize.run(clearNumber)
  }

  useEffect(() => {
    if (tel?.length) setNumber(getFormattedNumber(tel, defaultMask))
  }, [])
  return <Popup visible bodyClassName={styles.wrapper}>
    <NavBar onBack={() => { go(-1) }}>
      Вход по номеру
    </NavBar>
    <Form>
      <Form.Item
        label={errored
          ? <Red>Номер введен не корректно</Red>
          : 'Введите номер телефона, чтобы войти или зарегестироваться'
        }
        name='number'
        className={styles.addr_from_input}
      >
        <Input
          type={"tel"}
          value={number}
          onChange={onChange}
          {...useMask(defaultMask)}
        />
      </Form.Item>
      <Button
        disabled={errored || number.length < 10}
        onClick={submit}
        className={styles.submit_button}
        shape='rounded'
      >
        Отправить
      </Button>
    </Form>
  </Popup>
})

export default InputNumber