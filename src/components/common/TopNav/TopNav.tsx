import { UnorderedListOutline } from "antd-mobile-icons"
import { FC } from "react"

const styles = {
  icon: {
    fontSize: 20,
  },
  icon_wrapper: {
    background: 'var(--tg-theme-bg-color)',
    border: '1px solid var(--adm-color-border)',
    borderRadius: 1000,
    width: 36,
    height: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

const TopNav: FC = () => {
  return <div style={styles.icon_wrapper}>
    <UnorderedListOutline style={styles.icon} />
  </div>
} 

export default TopNav