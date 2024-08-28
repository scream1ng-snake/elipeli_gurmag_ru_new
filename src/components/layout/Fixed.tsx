import { FC, ReactNode, Fragment } from 'react'
const Fixed: FC<{ children: ReactNode }> = props =>
  <Fragment>
    <div style={{ position: 'fixed', zIndex: 1001, background: 'var(--tg-theme-secondary-bg-color)' }}>
      {props.children}
    </div>
    <div style={{ position: 'static', visibility: 'hidden' }}>
      {props.children}
    </div>

  </ Fragment>

export default Fixed;