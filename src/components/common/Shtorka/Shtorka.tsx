import { FC } from "react"


const Shtorka: FC = () => <div
  style={{
    width: '100%',
    position: 'relative'
  }}
>
  <div
    style={{
      position: 'absolute',
      top: 'calc(-10px - 0.75rem)',
      width: 46,
      height: 5,
      background: 'var(--tg-theme-bg-color)',
      borderRadius: '100px',
      left: 'calc(50% - 23px)',
    }}
  />
</div>

export default Shtorka