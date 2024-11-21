import { CenterPopup, Popup } from "antd-mobile";
import { CSSProperties, FC, ReactNode } from "react";
import { BottomNavigation } from "../BottomNav/BottomNav";

interface Props {
  visible: boolean
  bodyStyle: CSSProperties
  onClose: () => void
  children: ReactNode
}
const AdaptivePopup: FC<Props> = props => {
  return <>
    <Popup
      mask={false}
      closeOnSwipe
      closeOnMaskClick
      showCloseButton
      visible={props.visible}
      bodyStyle={props.bodyStyle}
      onClose={props.onClose}
      bodyClassName="d-xs-block d-sm-none"
    >
      {props.children}
      <BottomNavigation style={{ position: 'sticky', bottom: 0, zIndex: 100 }} />
    </Popup>
    <CenterPopup
      bodyClassName="d-none d-sm-block"
      closeOnMaskClick
      showCloseButton
      visible={props.visible}
      bodyStyle={props.bodyStyle}
      onClose={props.onClose}
    >
      {props.children}
    </CenterPopup>
  </>
}

export default AdaptivePopup