import { Skeleton, Space } from "antd-mobile"

export const LoaderTitle = () =>
  <Skeleton animated style={{ marginTop: '1rem', marginLeft: '1rem', height: '18px', width: '150px' }} />


export const ImagePreloder = () =>
  <Skeleton 
    animated 
    style={{
      width:140,
      height:90,
      objectFit: 'cover'
    }} 
  />