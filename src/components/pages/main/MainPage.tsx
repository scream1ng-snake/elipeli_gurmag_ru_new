import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
/* import Stories from "./parts/Stories/Stories" */
import Menu from "./parts/Menu/Menu"
import BottomNavigation from "../../common/BottomNav/BottomNav"
import Banner from "./parts/Banner/Banner"
import Fixed from "../../layout/Fixed"
import { MenuTabsFixed } from "./parts/Menu/MenuTabs/MenuTabs"
import styles from './styles.module.css'
import { useGoUTM, useStore } from '../../../features/hooks'
import AskLocation from "../../popups/AskLocation"
import { ItemModal } from "../../popups/Course"
import { useNavigate, useParams } from "react-router-dom"
import { Toast } from "antd-mobile"
import { logger } from "../../../features/logger"
import AskAuthorize from "../../popups/AskAuthorize"
import { NiceToMeetYooPopup } from "../../popups/CartActions"
const MainPage: FC = observer(() => {
  const { auth, reception: { menu } } = useStore()

  const { VCode } = useParams<{ VCode: string }>()
  const go = useGoUTM()

  useEffect(() => {
    if (VCode && menu.loadMenu.state === 'COMPLETED') {
      const targetDish = menu.getDishByID(VCode)
      if (targetDish) {
        menu.coursePopup.watch(targetDish)
      } else {
        Toast.show('Товар не найден')
        logger.log(`Товар с vcode ${VCode} не найден`)
        go('/')
      }
    }
  }, [menu.loadMenu.state, VCode])

  return <Wrapper>
    <NiceToMeetYooPopup />
    <ItemModal close={() => { go('/') }} />
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
      <AskAuthorize />
      {/* <Stories /> */}
      <Collections />
      <Cooks />
      <Menu />
    </div>
    <BottomNavigation />
  </Wrapper>
})

export default MainPage