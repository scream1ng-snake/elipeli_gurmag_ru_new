import { observer } from 'mobx-react-lite';
import { FC } from "react";
import Wrapper from '../../layout/Wrapper';
import { FullscreenLoading } from '../../common/Loading/Loading';
import { useStore } from '../../../features/hooks';
import InputNumber from '../../forms/InputTelephone/InputTelephone';
import Registration from '../../forms/Registration/Registration';
import InputSmsCode from '../../forms/InputSmsCode/InputSmsCode';
import { useNavigate } from 'react-router-dom';



const LoginPage: FC = observer(() => {
  const navigate = useNavigate()
  const { auth } = useStore()
  function getContent() {
    switch (auth.stage) {
      case 'COMPLETED':
        navigate(-1)
        return null
      case 'INPUT_TELEPHONE':
        return <InputNumber />
      case 'INPUT_SMS_CODE':
        return <InputSmsCode />
      case 'REGISTRATION': 
        return <Registration />
      default:
        return <FullscreenLoading />
    }
  }
  return(
    <Wrapper>
      {getContent()}
    </Wrapper>
  )
})






export default LoginPage