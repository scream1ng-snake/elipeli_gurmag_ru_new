import { FC, ReactNode } from 'react'
import { Image, Skeleton, Button } from 'antd-mobile'
import styles from './styles.module.css'
import ImageClose from '../../assets/icon_close.png'
const InfoBlock: FC<{
  title: string,
  text: string,
  onClose: Function,
  image: any,
  
  button: ReactNode,
}> = props =>
  <div className={styles.info_block_wrapper}>
    <div
      className={styles.info_block_close}
      onClick={() => props.onClose()}
    >
      <Image
        src={ImageClose}
        width={22}
        height={22}
        fit='contain'
      />
    </div>
    <div className={styles.info_block_row}>
      <div className={styles.info_block_image}>
      {
        props.image
        ? <Image
            src={props.image}
            width={50}
            height={50}
            fit='contain'
          />
        : null
      }
      </div>
      <div className={styles.info_block_data}>
        <div className={styles.info_block_title}>
          {props.title}
        </div>
        <div className={styles.info_block_text}>
          {props.text}
        </div>
      </div>
    </div>
    {props.button}
  </div>

export default InfoBlock