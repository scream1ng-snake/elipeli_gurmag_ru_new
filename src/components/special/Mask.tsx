import { FC } from "react";
import { WithChildren } from "../../features/helpers";

export const Mask: FC<WithChildren> = p => 
<div 
  style={{ 
    background: 'rgba(0, 0, 0, 0.15)',
    opacity: 1,
    position: 'absolute', 
    display: 'flex',
    justifyContent: 'center',
    alignItems:'center',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 101
  }}>
    {p.children}
</div>