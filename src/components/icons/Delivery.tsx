import { Image, Skeleton } from "antd-mobile"
import { FC } from "react"
import Logo from '../../assets/Delivery.png'

const w36h36 = { height: '36px', width: '36px' }

const Loader: FC = () => 
  <Skeleton style={w36h36} />

export const Delivery36x36: FC = () => 
  <Image 
    style={w36h36}
    src={Logo}
    fallback={<Loader />}
    placeholder={<Loader />}
  />