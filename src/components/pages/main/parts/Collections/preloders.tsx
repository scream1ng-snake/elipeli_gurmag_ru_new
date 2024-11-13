import { Skeleton } from "antd-mobile"

export const LoaderTitle = () =>
  <Skeleton animated style={{ height: 22.27, width: 100, borderRadius:13 }} />


export const ImagePreloder = () =>
  <Skeleton
    animated
    style={{
      width: 140,
      height: 90,
      objectFit: 'cover'
    }}
  />