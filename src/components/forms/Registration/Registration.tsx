import { DatePicker, Input, Button, Form, NavBar, Popup } from "antd-mobile"
import { observer } from "mobx-react-lite"
import moment from "moment"
import { FC, useState, useEffect } from "react"
import { useGoUTM, useStore } from "../../../features/hooks"
import styles from '../form.module.css'
import { FullscreenLoading } from "../../common/Loading/Loading"
import InputMask from 'react-input-mask';


const Registration: FC = observer(() => {
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
    const [DD,MM,YYYY] = birthday.split(".")
    auth.registration.run({
      name,
      birthday: YYYY&&MM&&DD
        ? YYYY+MM+DD
        : '19710101'
    })
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
      <NavBar onBack={() => { go('/') }}>
        Расскажите о себе
      </NavBar>
      <Form>
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
          {/* <span onClick={() => setShowBirthdayInput(true)}>
            {birthday.length
              ? moment(birthday).format('DD-MM-YYYY')
              : 'ДД-ММ-ГГГГ'
            }
          </span> */}
        </Form.Item>
        <Button
          disabled={isDisabled}
          shape='rounded'
          onClick={submit}
          className={styles.submit_button}
        >
          Отправить
        </Button>
      </Form>
    </Popup>
  )
})

export default Registration