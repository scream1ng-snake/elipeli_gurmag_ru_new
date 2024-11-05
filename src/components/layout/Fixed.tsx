import { FC, ReactNode, Fragment } from 'react'
import { ReceptionSwitcherEmpty } from '../pages/main/parts/ReceptionSwitcher/ReceptionSwitcher'

const Fixed: FC<{ children: ReactNode }> = props => {
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
    <ReceptionSwitcherEmpty />
  </ Fragment>

}
export default Fixed;