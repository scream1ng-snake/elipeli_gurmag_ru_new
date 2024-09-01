import { FC } from 'react'
import { Image } from 'antd-mobile'
import styles from './styles.module.css'

const CustomButton: FC<{
  text: string,
  onClick: Function,
  height: string,
  backgroundVar: string,
  colorVar: string,

  disabled?: boolean
  minWidth?: string,
  maxWidth?: string,
  marginTop?: string,
  marginHorizontal?: string,
  marginBottom?: string,
  paddingHorizontal?: string,
  borderRadius?: string,

  fontWeight?: string,
  fontSize?: string,

  prependImage?: any,
  prependImageInvert?: boolean,
  prependImageWidth?: string,
  prependImageHeight?: string,
  prependImageMargin?: string,

  appendImage?: any,
  appendImageInvert?: boolean,
  appendImageWidth?: string,
  appendImageHeight?: string,
  appendImageMargin?: string,
}> = props =>
  <div className={styles.custom_button_wrapper}>
    <div
      className={styles.custom_button}
      onClick={() => !props.disabled && props.onClick()}
      style={{
        height: props.height,
        maxWidth: props.maxWidth || 'auto',
        minWidth: props.minWidth || 'auto',
        marginTop: props.marginTop || '0px',
        marginBottom: props.marginBottom || '0px',
        marginLeft: props.marginHorizontal || '0px',
        marginRight: props.marginHorizontal || '0px',
        paddingLeft: props.paddingHorizontal || '0px',
        paddingRight: props.paddingHorizontal || '0px',
        borderRadius: props.borderRadius || '20px',
        backgroundColor: `var(${props.backgroundVar})`,
        color: `var(${props.colorVar})`,
        fontWeight: props.fontWeight,
        fontSize: props.fontSize,
        opacity: props.disabled ? 0.4 : 1
      }}
    >
      {
        props.prependImage
        ? <Image
            style={{
              marginRight: props.prependImageMargin || 16,
              filter: props.prependImageInvert ? 'grayscale(80%) invert(100%)' : 'none'
            }}
            src={props.prependImage}
            width={props.prependImageWidth || props.height}
            height={props.prependImageHeight || props.height}
            fit='contain'
          />
        : null
      }
      {props.text}
      {
        props.appendImage
        ? <Image
            style={{
              marginLeft: props.appendImageMargin || 16,
              filter: props.appendImageInvert ? 'grayscale(80%) invert(100%)' : 'none'
            }}
            src={props.appendImage}
            width={props.appendImageWidth || props.height}
            height={props.appendImageHeight || props.height}
            fit='contain'
          />
        : null
      }
    </div>
  </div>

export default CustomButton
