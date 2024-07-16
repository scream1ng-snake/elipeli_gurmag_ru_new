import { FC, ReactNode } from 'react'
const Wrapper: FC<{ children: ReactNode }> = props => 
  <div style={{ width: '100vw', height: '100vh' }}>
    {props.children}
  </div>

export default Wrapper;