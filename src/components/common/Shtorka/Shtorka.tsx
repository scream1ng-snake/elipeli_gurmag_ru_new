import { FC } from "react"

const defaultOffset = 'calc(-10px - 0.75rem)'
type ShtorkaProps = {
  offset?: string
}
const Shtorka: FC<ShtorkaProps> = props => <div
  style={{
    width: '100%',
    position: 'relative'
  }}
>
  <div
    style={{
      position: 'absolute',
      top: props.offset ? props.offset : defaultOffset,
      width: 46,
      height: 5,
      background: 'var(--tg-theme-bg-color)',
      borderRadius: '100px',
      left: 'calc(50% - 23px)',
    }}
  />
</div>

export default Shtorka