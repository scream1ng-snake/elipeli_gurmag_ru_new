import { Form, Input } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStore } from "../../../../../features/hooks"

const style = {
  border: '2px solid var(--adm-color-border)',
  margin: '0.5rem 1rem',
  padding: '0 0.5rem',
  borderRadius: '13px',
}
const NoteToOrder: FC = observer(() => {
  const { cart } = useStore()
  return (
    <Form.Item style={style}>
      <Input 
        value={cart.note} 
        onChange={cart.setNote}
        placeholder='Введите пожелание к заказу'
      />
    </Form.Item>
  )
})

export default NoteToOrder