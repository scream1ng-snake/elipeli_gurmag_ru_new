import { FC } from 'react'
import { Image } from 'antd-mobile'
import styles from './styles.module.css'
import CustomButton from './CustomButton'
import ImageBaker from '../../assets/image_baker.png'
const ToggleSelector: FC<{
  options: Array<any>,
  onChange: Function,
  value: any,
  backgroundVar: string,
  buttonBackgroundVar: string,
  buttonActiveBackgroundVar: string,
  colorVar: string,
  activeColorVar: string,
}> = props =>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    height: '36px',
    padding: '2px',
    borderRadius: '20px',
    boxShadow: '1px 1px 3px 0px rgba(0, 0, 0, 0.25)',
    background: `var(${props.backgroundVar})`,
    boxSizing: 'border-box',
    gap: '2px',
  }}>
    {
      props.options.map((option, index) => (
        <CustomButton
          key={'ts_cb_' + index}
          text={option.text}
          onClick={() => { props.onChange(option.value) }}
          height={'32px'}
          minWidth={'134px'}
          fontWeight={'400'}
          fontSize={'14.5px'}
          backgroundVar={(option.value === props.value) ? props.buttonActiveBackgroundVar : props.buttonBackgroundVar }
          colorVar={(option.value === props.value) ? props.activeColorVar : props.colorVar }
          prependImage={option.prependImage}
          prependImageMargin={option.prependImageMargin}
          prependImageWidth={option.prependImageWidth}
          prependImageHeight={option.prependImageHeight}
        />
      ))
    }
  </div>


export default ToggleSelector
