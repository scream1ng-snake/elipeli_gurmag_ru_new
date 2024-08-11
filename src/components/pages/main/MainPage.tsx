import { observer } from "mobx-react-lite"
import { FC } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import styles from './styles.module.css'
import Menu from "./parts/Menu/Menu"

const MainPage: FC = observer(() => {
  return <Wrapper>
    <ReceptionSwitcher />
    <EmptyUnderFixed height="85px" />
    <Stories />
    <Collections />
    <Cooks />
    <Menu />

  </Wrapper>
})

const EmptyUnderFixed: FC<{ height: string }> = props =>
  <div style={{ height: props.height }} />


export default MainPage