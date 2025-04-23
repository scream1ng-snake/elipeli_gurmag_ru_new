import { DatePicker, Input, Button, Form, NavBar, Popup } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import { useGoUTM, useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import { FullscreenLoading } from "../../common/Loading/Loading"
import InputMask from 'react-input-mask';
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import { useSearchParams } from "react-router-dom"


const Registration: FC = observer(() => {
  const [params] = useSearchParams()
  const go = useGoUTM()
  const { auth } = useStore()
  const [name, setName] = useState('')
  const [birthday, setBirthDay] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)

  const [showBirthdayInput, setShowBirthdayInput] = useState(false)

  useEffect(() => {
    name.length && birthday.length
      ? setIsDisabled(false)
      : setIsDisabled(true)
  }, [name, birthday])

  function submit() {
    const [DD, MM, YYYY] = birthday.split(".")
    if(params.get('fromPostOrder') === 'true') {
      auth.registration.run({
        name,
        birthday: YYYY && MM && DD
          ? YYYY + MM + DD
          : '19710101'
      }, true)
    } else {
      auth.registration.run({
        name,
        birthday: YYYY && MM && DD
          ? YYYY + MM + DD
          : '19710101'
      })
    }
  }

  const now = new Date()
  return (
    <Popup visible bodyClassName={styles.wrapper}>
      {auth.registration.state === 'LOADING'
        ? <FullscreenLoading />
        : null
      }
      <DatePicker
        visible={showBirthdayInput}
        onClose={() => setShowBirthdayInput(false)}
        onConfirm={isoStr => setBirthDay(isoStr.toISOString())}
        defaultValue={now}
        max={now}
        min={new Date("1924-01-01")}
        confirmText='Сохранить'
        cancelText='Закрыть'
      />
      <Container>
        <NavBar onBack={() => { go('/') }}>
          Расскажите о себе
        </NavBar>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Item
                label='Как вас зовут?'
                name='name'
                className={styles.addr_from_input}
              >
                <Input
                  placeholder='Ваше имя'
                  value={name}
                  onChange={val => { setName(val) }}
                />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label='Когда у вас день рождения?'
                name='birthday'
                className={styles.addr_from_input}
              >
                <InputMask
                  maskChar={null}
                  mask="99.99.9999"
                  value={birthday}
                  onChange={setBirthDay as any}
                >
                  {/* @ts-ignore */}
                  {(inputProps: any) =>
                    <Input
                      {...inputProps}
                      type='tel'
                      placeholder='ДД.ММ.ГГГГ'
                    />
                  }
                </InputMask>
              </Form.Item>
            </Col>
          </Row>
          <Row className="justify-content-md-center">
            <Col md={6}>
              <Button
                disabled={isDisabled}
                shape='rounded'
                onClick={submit}
                className={styles.submit_button}
              >
                Отправить
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </Popup>
  )
})

export default Registration