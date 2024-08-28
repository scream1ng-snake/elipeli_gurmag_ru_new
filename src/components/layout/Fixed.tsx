import { observer } from 'mobx-react-lite'
import { FC, ReactNode, Fragment } from 'react'
import { useStore } from '../../features/hooks'
const bannerHeight = 149
const switcherHeight = 68
const authBtnHeight = 68
const Fixed: FC<{ children: ReactNode }> = observer(props => {
  const { auth } = useStore()
  return <Fragment>
    <div style={{ position: 'fixed', zIndex: 1, background: 'var(--tg-theme-secondary-bg-color)' }}>
      {props.children}
    </div>
    <div
      style={{
        height: auth.isFailed
          ? auth.bannerToTg.show
            ? bannerHeight + switcherHeight
            : authBtnHeight + switcherHeight
          : switcherHeight
      }}
    />
  </ Fragment>

})
export default Fixed;