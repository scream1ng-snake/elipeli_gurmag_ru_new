import { Space } from "antd-mobile"
import { FC } from "react"
import styles from './styles.module.css'
import { useGoUTM } from "../../../../../features/hooks"

const CartHead: FC =() => {
  const go = useGoUTM()
  return <Space justify='center' className={styles.cartHead}>
  <span
    className={styles.cartClose}
    onClick={() => { go('/') }}
  >
    Закрыть
  </span>
  <span>Корзина</span>
</Space>
}

export default CartHead