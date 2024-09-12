import { LeftOutline } from "antd-mobile-icons";
import { FC } from "react";


const BackIcon: FC<{ onClick?: () => any }> = p =>
  <div
    onClick={p?.onClick}
    style={{
      boxShadow: 'rgba(0, 0, 0, 0.3) 0 0 5px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 36,
      height: 36,
      borderRadius: 100,
      background: 'var(--tg-theme-bg-color)'
    }}
  >
    <LeftOutline style={{ fontSize: 18, marginRight: 3 }} />
  </div>

export default BackIcon