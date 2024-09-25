import { Button, Image, Popup, Space, Toast } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import { useNavigate } from "react-router-dom"
import BackIcon from "../icons/Back"
import { CloseOutline } from "antd-mobile-icons"
import { copyToClipboard } from "../../features/helpers"
import Ekler from '../../assets/Ekler.png'
import Shtorka from "../common/Shtorka/Shtorka"

const popup = {
  width: '100vw',
  padding: '0.75rem 0',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  background: 'rgba(247, 187, 15, 1)',
  color: 'black',
}

const bigText = { fontSize: 29, fontWeight: 700, lineHeight: '33px', margin: '0 1rem' }
const smallText = { fontSize: 15, fontWeight: 700, lineHeight: '17px', margin: '0 1rem' }
const badge = {
  background: 'rgba(1, 98, 65, 1)',
  borderRadius: 10,
  position: 'absolute',
  padding: '0.5rem 1rem',
  color: 'white',
  fontSize: 14,
  marginLeft: '1rem',
  '--gap': '-10'
} as CSSProperties

const AskAuthorize: FC = observer(() => {
  const go = useGoUTM()
  const { auth } = useStore()
  const { bannerAuthForGift: { show, close } } = auth

  return (
    <Popup
      visible={show}
      closeOnMaskClick
      onClose={close}
      bodyStyle={popup}
      closeOnSwipe
    >
      <Shtorka />
      
      <Space style={{ width: 'calc(100% - 2rem)', margin: '0 1rem' }} justify='between' align='center'>
        <BackIcon onClick={close} />
        <CloseOutline onClick={close} fontSize={20} />
      </Space>

      <br />
      <br />
      <p style={bigText}>Волшебный</p>
      <p style={bigText}>Шоколадный эклер</p>
      <br />
      <p style={smallText}>В ПОДАРОК</p>
      <p style={smallText}>ПРИ РЕГИСТРАЦИИ!</p>
      <br />
      <br />
      <br />
      <div>
        <Space
          direction='vertical'
          style={badge}
          align='center'
          justify='center'
          onClick={() => {
            copyToClipboard('1703')
            Toast.show('Промокод скопирован')
          }}
        >
          <span>Промокод</span>
          <span style={{ fontSize: 30 }}>1703</span>
        </Space>
        <Image src={Ekler} />
      </div>
      <br />
      <Button 
        fill='outline'
        onClick={() => {
          go('/authorize')
          close()
        }}
        style={{ 
          width: 'calc(100% - 2rem)', 
          background: 'rgba(1, 98, 65, 1)', 
          color: 'white',
          fontSize:16,
          fontWeight:600,
          borderRadius:10, 
          padding:'0.75rem',
          margin: '0 1rem'
        }}
      >
        Получить подарок!
      </Button>
    </Popup >
  )
})

export default AskAuthorize