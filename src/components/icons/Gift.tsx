
import { Image, Skeleton } from "antd-mobile"
import { FC } from "react"
import Logo from '../../assets/gift.png'

const w35h35 = { height: '25px', width: '25px', padding: 5 }

const Loader: FC = () => 
  <Skeleton style={w35h35} />

export const Gift: FC = () => 
  <Image 
    style={w35h35}
    src={Logo}
    fallback={<Loader />}
    placeholder={<Loader />}
  />