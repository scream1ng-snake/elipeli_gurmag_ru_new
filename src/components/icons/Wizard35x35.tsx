
import { Image, Skeleton } from "antd-mobile"
import { FC } from "react"
import Logo from '../../assets/Wizard.png'

const w35h35 = { height: '35px', width: '35px' }

const Loader: FC = () => 
  <Skeleton style={w35h35} />

export const Wizard35x35: FC = () => 
  <Image 
    style={w35h35}
    src={Logo}
    fallback={<Loader />}
    placeholder={<Loader />}
  />