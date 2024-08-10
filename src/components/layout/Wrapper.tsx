import { FC, ReactNode } from 'react'
const Wrapper: FC<{ children: ReactNode }> = props => 
  <div style={{ width: '100%', height: '100%' }}>
    {props.children}
  </div>

export default Wrapper;