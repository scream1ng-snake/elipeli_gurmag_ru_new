import { FC } from 'react'
import { Image, Skeleton } from 'antd-mobile'

const CircleIcon: FC<{ size: any, image: any }> = props =>
  <Image
    src={props.image}
    width={props.size}
    height={props.size}
    fallback={<CircleImagePreloder />}
    placeholder={
      <CircleImagePreloder />
    }
    fit='cover'
  />

export default CircleIcon

export const CircleImagePreloder = () =>
  <Skeleton 
    animated 
    style={{
      width: '36vw',
      height: '100px',
      objectFit: 'cover'
    }} 
  />
