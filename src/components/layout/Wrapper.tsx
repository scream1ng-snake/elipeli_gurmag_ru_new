import { CSSProperties, FC, ReactNode } from 'react'
import styles from './Wrapper.module.css'
const Wrapper: FC<{ children: ReactNode, styles?: CSSProperties }> = props => 
  <div className={styles.gur_wrapper} style={props.styles}>
    {props.children}
  </div>

export default Wrapper;