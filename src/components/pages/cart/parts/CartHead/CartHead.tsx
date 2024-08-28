import { Space } from "antd-mobile"
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styles from './styles.module.css'

const CartHead: FC =() => {
  const go = useNavigate()
  return <Space justify='center' className={styles.cartHead}>
  <span
    className={styles.cartClose}
    onClick={() => { go(-1) }}
  >
    Закрыть
  </span>
  <span>Корзина</span>
</Space>
}

export default CartHead