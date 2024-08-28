import { FC } from 'react'
import { Image, Skeleton } from 'antd-mobile'

const CircleIcon: FC<{ size: any, image: any }> = props =>
  <Image
    src={props.image}
    width={props.size}
    height={props.size}
    fallback={<CircleImagePreloder size={props.size}/>}
    placeholder={
      <CircleImagePreloder size={props.size}/>
    }
    fit='cover'
  />

export default CircleIcon

export const CircleImagePreloder: FC<{ size: any }> = props =>
  <Skeleton 
    animated 
    style={{
      width: props.size,
      height: props.size,
      objectFit: 'cover'
    }} 
  />
