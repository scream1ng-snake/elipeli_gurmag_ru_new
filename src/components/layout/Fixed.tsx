import { observer } from 'mobx-react-lite'
import { FC, ReactNode, Fragment } from 'react'
import { useStore } from '../../features/hooks'
const bannerHeight = 150
const switcherHeight = 68
const authBtnHeight = 56
const Fixed: FC<{ children: ReactNode }> = observer(props => {
  const { auth } = useStore()
  return <Fragment>
    <div
      style={{
        position: 'fixed',
        zIndex: 1,
        background: 'var(--gur-header-bg-color)',
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
          ? auth.bannerToTg.show
            ? bannerHeight + switcherHeight
            : authBtnHeight + switcherHeight
          : switcherHeight
      }}
    />
  </ Fragment>

})
export default Fixed;