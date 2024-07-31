import { observer } from "mobx-react-lite"
import { FC } from "react"
import Wrapper from "../../layout/Wrapper"
import ReceptionSwitcher from "./parts/ReceptionSwitcher"
import styles from './styles.module.css'

const MainPage: FC = observer(() => {
  return <Wrapper>
    <ReceptionSwitcher />
  </Wrapper>
})
export default MainPage