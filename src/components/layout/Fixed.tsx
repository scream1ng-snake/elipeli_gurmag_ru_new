import { observer } from 'mobx-react-lite'
import { FC, ReactNode, Fragment } from 'react'
import { useStore } from '../../features/hooks'
const bannerHeight = 150
const switcherHeight = 68
const authBtnHeight = 56
const Fixed: FC<{ children: ReactNode }> = observer(props => {
  const { auth, instance } = useStore()
  return <Fragment>
    <div
      style={{
        position: 'fixed',
        zIndex: 1,
        background: 'var(--tg-theme-secondary-bg-color)',
        width: '100%',
        borderBottomLeftRadius: '15px',
        borderBottomRightRadius: '15px',
      }}
    >
      {props.children}
    </div>
    <div
      style={{
        height: auth.isFailed
          ? auth.bannerToTg.show && instance === 'WEB_BROWSER'
            ? bannerHeight + switcherHeight
            : authBtnHeight + switcherHeight
          : switcherHeight
      }}
    />
  </ Fragment>

})
export default Fixed;