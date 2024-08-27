import { observer } from "mobx-react-lite"
import { FC } from "react"
import BottomNavigation from "../../common/BottomNav/BottomNav"
import Wrapper from "../../layout/Wrapper"

const CartPage: FC = observer(() => {

  return (
    <Wrapper>
      <BottomNavigation />
    </Wrapper>
  )
})


export default CartPage