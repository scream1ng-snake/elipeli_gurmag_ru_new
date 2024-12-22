import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import Menu from "./parts/Menu/Menu"
import BottomNavigation from "../../common/BottomNav/BottomNav"
import Fixed from "../../layout/Fixed"
import styles from './styles.module.css'
import { useGoUTM, useStore } from '../../../features/hooks'
import AskLocation from "../../popups/AskLocation"
import { ItemModal } from "../../popups/Course"
import { useParams } from "react-router-dom"
import { Toast } from "antd-mobile"
import { logger } from "../../../features/logger"
import AskAuthorize from "../../popups/AskAuthorize"
import { NiceToMeetYooPopup } from "../../popups/CartActions"
import Container from "react-bootstrap/Container"
// import AmountScaleForGift from "./parts/AmountScale/AmountSCaleForGift"


const MainPage: FC = observer(() => {
  const { reception: { menu } } = useStore()

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
      <ReceptionSwitcher />
    </Fixed>
    <Container fluid='xl' className={styles.gur_main_content}>
      <AskLocation />
      <AskAuthorize />
      <Stories />
      <Collections />
      <Cooks />
      <Menu />
    </Container>
    {/* <AmountScaleForGift /> */}
    <BottomNavigation />
  </Wrapper>
})

export default MainPage