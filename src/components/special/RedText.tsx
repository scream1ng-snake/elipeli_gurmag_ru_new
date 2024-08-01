import { FC } from "react"
import { WithChildren } from "../../features/helpers"

const Red: FC<WithChildren> = p =>
  <span style={{ color: 'var(--adm-color-danger)' }}>
    {p.children}
  </span>
export default Red