import { Image, Skeleton, Space } from "antd-mobile"
import ImageCircleBaker from '../../../../../assets/image_circle_baker@2x.png'
import { list_styles, wrapperStyle } from "./styles"

export const LoaderTitle = () =>
  <Skeleton animated style={{ height: 22.27, width: 100, borderRadius: 13 }} />
export const ImgPlaceholder = () =>
  <Image
    style={{ margin: -1 }}
    src={ImageCircleBaker}
    placeholder={<Skeleton animated style={{ height: 70, width: 70, borderRadius: 100 }} />}
    fallback={<Skeleton animated style={{ height: 70, width: 70, borderRadius: 100 }} />}
    width={70}
    height={70}
    fit='contain'
  />

export const CookSkeleton = () =>
  <Space
    style={wrapperStyle}
    direction="vertical"
    justify="center"
    align="center"
  >
    <ImgPlaceholder />
    {/* <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
  <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} /> */}
  </Space>
export const Loader = () => <>
  {new Array(3).fill(null).map((_, index) => <CookSkeleton key={index} />)}
</>
