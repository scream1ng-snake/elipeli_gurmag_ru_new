import { Image, Skeleton } from "antd-mobile"
import { FC } from "react"
import Logo from '../../assets/Gurmag2.png'

const w36h36 = { height: '36px', width: '36px' }

const Loader: FC = () => 
  <Skeleton style={w36h36} />

export const Gurmag36x36: FC = () => 
  <Image 
    style={w36h36}
    src={Logo}
    fallback={<Loader />}
    placeholder={<Loader />}
  />

const borderStyle = { 
  padding: 3, 
  border: '1px solid #2B6959', 
  borderRadius: 8
}
export const Gurmag36x36Bordered: FC = () => 
  <div style={borderStyle}>
    <Gurmag36x36 />
  </div>