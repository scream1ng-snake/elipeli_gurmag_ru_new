import { observer } from "mobx-react-lite"
import { FC } from "react"
import Wrapper from "../../layout/Wrapper"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import styles from './styles.module.css'

const MainPage: FC = observer(() => {
  return <Wrapper>
    <ReceptionSwitcher />
    <EmptyUnderFixed height="85px" />
    <Stories />
    {/* <Collections />
    <HelloCooks />
    <Menu /> */}
  </Wrapper>
})

const EmptyUnderFixed: FC<{ height: string }> = props => 
  <div style={{ height: props.height }} />
export default MainPage