import { Input, Button, Popup, NavBar, Form } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import { getFormattedNumber, useMask } from "react-phone-hooks"
import { useParams } from "react-router-dom"
import { useGoUTM, useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import Red from "../../special/RedText"
import { FullscreenLoading } from "../../common/Loading/Loading"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import bridge from "@vkontakte/vk-bridge"


const defaultMask = "+7 ... ... .. .."
const defaultPrefix = "+7"
const phoneRegex = /^((\+8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{14,15}$/

const InputNumber: FC = observer(() => {
  const go = useGoUTM()
  const { auth } = useStore()
  const { tel } = useParams()
  const [number, setNumber] = useState(defaultPrefix)
  const [errored, setErrored] = useState(false)

  function onChange(value: string) {
    setNumber(getFormattedNumber(value, defaultMask))
    phoneRegex.test(value)
      ? setErrored(false)
      : setErrored(true)
  }

  function submit(number: string, vkConfirmed: boolean) {
    const clearNumber = number.replace(/\D/g, '')
    auth.authorize.run(clearNumber, vkConfirmed)
  }

  useEffect(() => {
    if (tel?.length) setNumber(getFormattedNumber(tel, defaultMask))
    bridge?.send('VKWebAppGetPhoneNumber')
      .then((data) => {
        if (data.phone_number) {
          onChange(data.phone_number)
          submit(data.phone_number, true)
        }
      })
      .catch(console.error)
  }, [])
  return <Popup visible bodyClassName={styles.wrapper}>
    <Container>
      <NavBar 
        onBack={() => { 
          go('/')
          auth.dismissAskAuth() 
        }}
      >
        Вход по номеру
      </NavBar>
      {auth.authorize.state === 'LOADING' || auth.inputSmsCode.state === 'LOADING'
        ? <FullscreenLoading />
        : null
      }
      <Form>
        <Form.Item
          label={errored
            ? <Red>Номер введен не корректно</Red>
            : 'Введите номер телефона, чтобы войти или зарегестироваться'
          }
          className={styles.addr_from_input}
        >
          <Input
            type={"tel"}
            value={number}
            onChange={onChange}
            {...useMask(defaultMask)}
          />
        </Form.Item>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Button
              disabled={errored || number.length < 16}
              onClick={() => submit(number, false)}
              className={styles.submit_button}
              shape='rounded'
            >
              Отправить
            </Button>
          </Col>

        </Row>
      </Form>
    </Container>
  </Popup>
})

export default InputNumber