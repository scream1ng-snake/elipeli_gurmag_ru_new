import { Button, Image, Space } from "antd-mobile"
import { CloseOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Gurmag36x36Bordered } from "../../../../icons/Gurmag36x36"
import styles from './Banner.module.css'
import { useStore } from "../../../../../features/hooks"
import { useNavigate } from "react-router-dom"
import { Wizard35x35 } from "../../../../icons/Wizard35x35"

const W100 = { width: '100%' }

const Banner: FC = observer(() => {
  const go = useNavigate()
  const { auth, instance } = useStore()
  function handleClick() {
    const src = 'https://t.me/Gurmagbot'
    window.open(src)
  }

  if (auth.isFailed) {
    if (instance === 'WEB_BROWSER' && auth.bannerToTg.show) {
      return (
        <Space direction='vertical' className={styles.banner}>
          <Space style={W100} justify='center'>
            <Gurmag36x36Bordered />
            <div>
              <p><b>Гурмаг - ЕлиПели. Доставка <br />вкусных блюд</b></p>
              <p>Удобное приложение в Telegram</p>
              <p>БЕЗ СКАЧИВАНИЯ</p>
            </div>
            <CloseOutline
              className={styles.banner_close}
              onClick={() => { auth.bannerToTg.close() }}
            />
          </Space>
          <Button
            shape='rounded'
            className={styles.banner_button}
            onClick={handleClick}
          >
            Приложение в Telegram
          </Button>
        </Space>
      )
    } else {
      return (
        <Space className={styles.banner}>
          <Button
            shape='rounded'
            className={styles.wizard_button}
            onClick={() => { go('/authorize') }}
          >
            <Space align='center'>
              Войти по номеру телефона
              <Wizard35x35 />
            </Space>
          </Button>
        </Space>
      )
    }
  } else {
    return null
  }
})

export default Banner