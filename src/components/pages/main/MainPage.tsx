import { observer } from "mobx-react-lite"
import { FC, ReactNode } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import Categories from "./parts/Menu/Menu"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import styles from './styles.module.css'
import Menu from "./parts/Menu/Menu"

const MainPage: FC = observer(() => {
  return <Wrapper>
    <ReceptionSwitcher />
    <EmptyUnderFixed height="60px" />
    <MainContent >
      <Stories />
      <Collections />
      <Cooks />
      <Menu />
    </MainContent>

  </Wrapper>
})

const EmptyUnderFixed: FC<{ height: string }> = props =>
  <div style={{ height: props.height }} />

const MainContent: FC<{ children: ReactNode }> = props => 
  <div className={styles.gur_main_content} >
     {props.children}
  </div>

export default MainPage