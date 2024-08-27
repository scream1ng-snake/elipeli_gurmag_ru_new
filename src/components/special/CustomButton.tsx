import { FC } from 'react'
import { Image } from 'antd-mobile'
import styles from './styles.module.css'

const CustomButton: FC<{
  text: string,
  onClick: Function,
  height: string,
  maxWidth: string,
  marginTop: string,
  marginHorizontal: string,
  marginBottom: string,
  paddingHorizontal: string,
  backgroundVar: string,
  appendImage: any,
  fontWeight: string,
  fontSize: string,
}> = props =>
  <div className={styles.custom_button_wrapper}>
    <div
      className={styles.custom_button}
      onClick={() => props.onClick()}
      style={{
        height: props.height,
        maxWidth: props.maxWidth,
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        marginLeft: props.marginHorizontal,
        marginRight: props.marginHorizontal,
        paddingLeft: props.paddingHorizontal,
        paddingRight: props.paddingHorizontal,
        backgroundColor: `var(${props.backgroundVar})`,
        fontWeight: props.fontWeight,
        fontSize: props.fontSize,
      }}
    >
      {props.text}
      {
        props.appendImage
        ? <Image
            style={{
              marginLeft: 16
            }}
            src={props.appendImage}
            width={props.height}
            height={props.height}
            fit='contain'
          />
        : null
      }
    </div>
  </div>

export default CustomButton
