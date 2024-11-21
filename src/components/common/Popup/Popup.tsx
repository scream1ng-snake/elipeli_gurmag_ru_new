import { CenterPopup, Popup } from "antd-mobile";
import { CSSProperties, FC, ReactNode } from "react";
import { BottomNavigation } from "../BottomNav/BottomNav";
import Shtorka from "../Shtorka/Shtorka";

interface Props {
  visible: boolean
  bodyStyle?: CSSProperties
  onClose?: () => void
  children: ReactNode
  noBottomNav?: boolean,
  noCloseBtn?: boolean
}
const AdaptivePopup: FC<Props> = props => {
  return <>
    <Popup
      mask={false}
      closeOnSwipe
      closeOnMaskClick
      showCloseButton={!props.noCloseBtn}
      visible={props.visible}
      bodyStyle={props.bodyStyle}
      onClose={props.onClose}
      bodyClassName="d-xs-block d-sm-none"
      disableBodyScroll
    >
      <Shtorka />
      {props.children}
      {props.noBottomNav
        ? null
        : <BottomNavigation style={{ position: 'sticky', bottom: 0, zIndex: 100 }} />
      }
    </Popup>
    <CenterPopup
      bodyClassName="d-none d-sm-block"
      closeOnMaskClick
      showCloseButton={!props.noCloseBtn}
      visible={props.visible}
      bodyStyle={props.bodyStyle}
      onClose={props.onClose}
      disableBodyScroll
    >
      {props.children}
    </CenterPopup>
  </>
}

export default AdaptivePopup