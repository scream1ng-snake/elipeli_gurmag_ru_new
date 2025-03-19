import { observer } from "mobx-react-lite"
import { FC, useEffect, useMemo, useRef } from "react"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import Menu from "./parts/Menu/Menu"
import BottomNavigation from "../../common/BottomNav/BottomNav"
import Fixed from "../../layout/Fixed"
import styles from './styles.module.css'
import { useGoUTM, useStore, useTelegram } from '../../../features/hooks'
import AskLocation from "../../popups/AskLocation"
import { ItemModal } from "../../popups/Course"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button, Space, Toast } from "antd-mobile"
import { logger } from "../../../features/logger"
import AskAuthorize from "../../popups/AskAuthorize"
import { NiceToMeetYooPopup } from "../../popups/CartActions"
import Container from "react-bootstrap/Container"
import AmountScaleForGift from "./parts/AmountScale/AmountSCaleForGift"
import { CollectionPopup, /*CollectionsPopup*/ } from "../../popups/WatchCollectionPopup"
import CartPopup from "../cart/CartPage"
import BannerCarusel from "./parts/BannerCarusel/BannerCarusel"
import CampaignCollectionPopup from "../../popups/CampaignCollectionPopup"
import config from "../../../features/config"

const NewWindowExample = () => {
  const newWindowRef = useRef<WindowProxy | null>(null);

  const openNewWindow = () => {
    // Открытие нового окна  
    newWindowRef.current = window.open(
      'http://example.com', // URL для загрузки  
      'newWindow',          // Имя окна  
      'width=600,height=400' // Параметры окна  
    );

    // Передача данных в новое окно  
    if (newWindowRef.current) {
      newWindowRef.current.onload = () => {
        newWindowRef.current!.document.body.innerHTML = '<h1>Hello from the parent window!</h1>';
      };
    }
  };

  const closeNewWindow = () => {
    if (newWindowRef.current) {
      newWindowRef.current.close(); // Закрытие окна  
      newWindowRef.current = null;   // Обнуление ссылки  
    }
  };

  return (
    <div>
      <button onClick={openNewWindow}>Open New Window</button>
      <button onClick={closeNewWindow}>Close New Window</button>
    </div>
  );
};

const MainPage: FC = observer(() => {
  const { reception: { menu }, user, cart } = useStore()
  const location = useLocation()
  const { VCode } = useParams<{ VCode: string }>()
  const go = useGoUTM()

  useEffect(() => {
    if (location.pathname.includes('/menu/')) {
      if (VCode && menu.loadMenu.state === 'COMPLETED') {
        const targetDish = menu.getDishByID(VCode)
        if (targetDish) {
          menu.coursePopup.watch(targetDish)
        } else {
          menu.coursePopup.close()
          Toast.show('Товар не найден')
          logger.log(`Товар с vcode ${VCode} не найден`)
          go('/')
        }
      }
    } else {
      menu.coursePopup.close()
    }
    if (location.pathname.includes('/collections/')) {
      if (VCode && menu.loadMenu.state === 'COMPLETED') {
        const targetSelection = menu.getSelection(VCode)
        if (targetSelection) {
          menu.selectionPopup.watch(targetSelection)
        } else {
          Toast.show('Подборка не найдена')
          logger.log(`Подборка с vcode ${VCode} не найдена`)
          menu.selectionPopup.close()
          go('/')
        }
      }
    } else {
      menu.selectionPopup.close()
    }
    // if(location.pathname.includes("/collections")) {
    //   if(!VCode && menu.loadMenu.state === 'COMPLETED') {
    //     menu.selectionsPopup.open()
    //   } 
    // }
    if (location.pathname.includes("/basket")) {
      if (menu.loadMenu.state === 'COMPLETED' && user.loadUserInfo.state === 'COMPLETED') {
        cart.cart.open()
      }
    } else {
      cart.cart.close()
    }
  }, [
    VCode,
    location,
    menu.loadMenu.state,
    menu.categories.length,
    menu.loadMenuBg.state
  ])

  const PresentAction = useMemo(() => {
    return user.info.allCampaign.filter(c => c.PresentAction)
  }, [menu.loadMenu.state, VCode])

  return <Wrapper>
    <NiceToMeetYooPopup />
    <ItemModal close={() => { go('/') }} />
    <CollectionPopup />
    <CampaignCollectionPopup />
    <CartPopup />
    {/* <CollectionsPopup /> */}
    <Fixed>
      <ReceptionSwitcher />
    </Fixed>
    <Container className={styles.gur_main_content}>
      <AskLocation />
      <AskAuthorize />
      <Stories />
      <Collections />
      {user.hasHotCampaign.length
        ? <BannerCarusel />
        : <Cooks />
      }
      <Menu />
    </Container>
    {PresentAction.length
      ? <><AmountScaleForGift /> <div style={{ height: 110 }} /></>
      : null
    }
    <BottomNavigation />
  </Wrapper>
})

export default MainPage