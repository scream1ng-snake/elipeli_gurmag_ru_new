import { observer } from "mobx-react-lite"
import { FC } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import Menu from "./parts/Menu/Menu"
import BottomNavigation from "../../common/BottomNav/BottomNav"
import Banner from "./parts/Banner/Banner"

const MainPage: FC = observer(() => {
  return <Wrapper>
    <Banner />
    <ReceptionSwitcher />
    <Stories />
    <Collections />
    <Cooks />
    <Menu />
    <BottomNavigation />
  </Wrapper>
})




export default MainPage