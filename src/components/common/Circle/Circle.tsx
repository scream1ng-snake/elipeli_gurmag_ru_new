import { CSSProperties, FC, ReactNode } from "react";

type CircleProps = {
  children: ReactNode
  bgcolor?: string,
  styles?: CSSProperties
}
export const Circle: FC<CircleProps> = ({ children, bgcolor, styles }) => {
  return <div 
    style={{ 
      borderRadius: 1000, 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width:14,
      height:14,
      background: bgcolor, 
      ...styles 
    }}
  >
    {children}
  </div>
}