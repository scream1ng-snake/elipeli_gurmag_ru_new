import { Button, Image, Space } from "antd-mobile"
import { CloseOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Gurmag36x36Bordered } from "../../../../icons/Gurmag36x36"
import styles from './Banner.module.css'
import { useStore } from "../../../../../features/hooks"
import { useNavigate } from "react-router-dom"
import { Wizard35x35 } from "../../../../icons/Wizard35x35"
import InfoBlock from '../../../../special/InfoBlock'
import CustomButton from '../../../../special/CustomButton'
import LogoGurmagApp from '../../../../../assets/logo_gurmag_app.png'
import ImageBaker from '../../../../../assets/image_baker.png'

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
        <div
          style={{
            width: 'calc(100% - 32px)',
            padding: '16px 16px 20px 16px'
          }}
        >
          <InfoBlock
            image={LogoGurmagApp}
            onClose={() => { auth.bannerToTg.close() }}
            title={'Гурмаг - ЕлиПели. Доставка вкусных блюд.'}
            text={'Удобное приложение в Telegram БЕЗ СКАЧИВАНИЯ'}
            button={
              <CustomButton
                text={'Приложение в Telegram'}
                onClick={() => { handleClick() }}
                height={'35px'}
                maxWidth={'auto'}
                
                marginTop={'10px'}
                marginBottom={'0px'}
                marginHorizontal={'25px'}
                paddingHorizontal={'0px'}
                fontWeight={'700'}
                
                fontSize={'14.5px'}
                backgroundVar={'--gurmag-accent-color'}
                colorVar={'--gur-custom-button-text-color'}
                appendImage={null}
              />
            }
          />
        </div>
      )
    } else {
      return (
        <CustomButton
          text={'Войти по номеру телефона'}
          onClick={() => { go('/authorize') }}
          height={'35px'}
          maxWidth={'auto'}
          
          marginTop={'16px'}
          marginBottom={'5px'}
          marginHorizontal={'25px'}
          paddingHorizontal={'24px'}
          fontWeight={'400'}
          fontSize={'14.5px'}
          backgroundVar={'--gur-secondary-accent-color'}
          colorVar={'--gur-custom-button-text-color'}
          appendImage={ImageBaker}
          appendImageMargin={'16px'}
        />
      )
    }
  } else {
    return null
  }
})

export default Banner

  {/* 
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
    </Space> */}

   {/*
    
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
*/}