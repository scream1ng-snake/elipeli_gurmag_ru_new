import { Input, InputRef, List } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useRef } from "react"
import { useStore } from "../../../../../features/hooks"
import { CheckOutline } from "antd-mobile-icons"
import { Optional } from "../../../../../features/helpers"

const Promocode: FC = observer(() => {
  const inputref = useRef<Optional<InputRef>>(null)
  const { cart } = useStore()
  return <List>
    <List.Item 
      arrowIcon={cart.confirmedPromocode?.length
        ? <CheckOutline style={{ color: "var(--adm-color-success)" }} />
        : null
      }
    >
      <Input
        style={{
          '--placeholder-color': 'var(--gurmag-accent-color)',
          '--text-align': 'center'
        }}
        disabled={Boolean(cart.confirmedPromocode)}
        ref={inputref}
        value={cart.inputPromocode}
        onChange={str => { cart.setInputPromo(str, inputref) }}
        placeholder='Ввести промокод'
      />
    </List.Item>
  </List>
})
export default Promocode