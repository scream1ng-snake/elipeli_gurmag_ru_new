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


const defaultMask = "+7 ... ... .. .."
const defaultPrefix = "+7"
const phoneRegex = /^((\+8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/

const InputNumber: FC = observer(() => {
  const go = useGoUTM()
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
    <Container>
      <NavBar onBack={() => { go('/') }}>
        Вход по номеру
      </NavBar>
      {auth.authorize.state === 'LOADING' || auth.inputSmsCode.state === 'LOADING'
        ? <FullscreenLoading />
        : null
      }
      <Form initialValues={{ number: defaultPrefix }}>
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
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Button
              disabled={errored || number.length < 10}
              onClick={submit}
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