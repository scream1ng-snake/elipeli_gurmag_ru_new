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
  noCloseBtn?: boolean,
  bodyClassName?: string
}
const AdaptivePopup: FC<Props> = props => {
  return <>
    <Popup
      closeOnSwipe
      closeOnMaskClick
      showCloseButton={!props.noCloseBtn}
      visible={props.visible}
      bodyStyle={props.bodyStyle}
      onClose={props.onClose}
      maskClassName="d-xs-block d-sm-none"
      bodyClassName={`d-xs-block d-sm-none ${props.bodyClassName || ''}`}
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
      maskClassName="d-none d-sm-block"
      bodyClassName={`d-none d-sm-block ${props.bodyClassName || ''}`}
      closeOnMaskClick
      showCloseButton={!props.noCloseBtn}
      visible={props.visible}
      bodyStyle={props.bodyStyle}
      onClose={props.onClose}
      disableBodyScroll
      getContainer={document.body}
    >
      {props.children}
    </CenterPopup>
  </>
}

export default AdaptivePopup