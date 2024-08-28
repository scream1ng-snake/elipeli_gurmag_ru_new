import { FC, ReactNode } from 'react'
import styles from './Wrapper.module.css'
const Wrapper: FC<{ children: ReactNode }> = props => 
  <div className={styles.gur_wrapper}>
    {props.children}
  </div>

export default Wrapper;