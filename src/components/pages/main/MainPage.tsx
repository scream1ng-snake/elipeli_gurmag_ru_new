import { observer } from "mobx-react-lite"
import { FC, ReactNode } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import Menu from "./parts/Menu/Menu"
import BottomNavigation from "../../common/BottomNav/BottomNav"
import Banner from "./parts/Banner/Banner"
import Fixed from "../../layout/Fixed"
import { MenuTabsFixed } from "./parts/Menu/MenuTabs/MenuTabs"
import styles from './styles.module.css'

const MainPage: FC = observer(() => {
  return <Wrapper>
    <Fixed>
      <Banner />
      <ReceptionSwitcher />
      <MenuTabsFixed />
    </Fixed>
    <MainContent >
      <Stories />
      <Collections />
      <Cooks />
      <Menu />
    </MainContent>
  </Wrapper>
})


const MainContent: FC<{ children: ReactNode }> = props => 
  <div className={styles.gur_main_content} >
     {props.children}
  </div>


export default MainPage