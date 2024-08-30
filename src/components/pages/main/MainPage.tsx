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
import { useStore } from '../../../features/hooks'
import AskLocation from "../../popups/AskLocation"
const MainPage: FC = observer(() => {
  const { auth } = useStore()
  return <Wrapper>
    <Fixed>
      <Banner />
      <ReceptionSwitcher />
      <MenuTabsFixed />
    </Fixed>
    <div
      className={styles.gur_main_content}
      style={
        (auth.isFailed && auth.bannerToTg.show)
        ? { /* Если баннер, то убираем скругление углов */
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
        }
        : {
        }
      }
    >
      <AskLocation />
      <Stories />
      <Collections />
      <Cooks />
      <Menu />
    </div>
    <BottomNavigation />
  </Wrapper>
})

export default MainPage