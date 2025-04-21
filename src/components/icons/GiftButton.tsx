
import { Image, Skeleton } from "antd-mobile"
import { CSSProperties, FC } from "react"
import Logo from '../../assets/GiftButton.png'

const w66h66 = { height: '66px', width: '66px', borderRadius: 100 }

const Loader: FC = () => 
  <Skeleton style={w66h66} />

type Props = {
  style?: CSSProperties,
  onClick?: () => void
}
export const GiftButton: FC<Props> = props => 
  <Image 
    style={{ ...w66h66, ...props.style }}
    src={Logo}
    fallback={<Loader />}
    placeholder={<Loader />}
    onContainerClick={props.onClick}
  />