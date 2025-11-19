import { CenterPopup, Popup } from "antd-mobile";
import { CSSProperties, FC, ReactNode } from "react";
import { BottomNavigation } from "../BottomNav/BottomNav";
import Shtorka from "../Shtorka/Shtorka";
import { useDeviceType } from "../../../features/hooks";

interface Props {
  visible: boolean
  bodyStyle?: CSSProperties
  onClose?: () => void
  children: ReactNode
  noBottomNav?: boolean,
  noBottomNavDesktop?: boolean,
  noBottomNavMobile?: boolean,
  noCloseBtn?: boolean,
  bodyClassName?: string,
  noShtorka?: boolean,
  shtorkaOffset?: string,
  mobileBodyStyle?: CSSProperties,
  desktopBodyStyle?: CSSProperties,
}
const AdaptivePopup: FC<Props> = props => {
  const device = useDeviceType()
  if (device === 'mobile') {
    return <Popup
      destroyOnClose
      closeOnSwipe
      closeOnMaskClick
      showCloseButton={!props.noCloseBtn}
      visible={props.visible}
      bodyStyle={{
        ...props.bodyStyle,
        ...props.mobileBodyStyle
      }}
      onClose={props.onClose}
      maskClassName=""
      bodyClassName={` ${props.bodyClassName || ''}`}
      disableBodyScroll
    >
      {props.noShtorka
        ? null
        : <Shtorka offset={props.shtorkaOffset} />
      }
      {props.children}
      {props.noBottomNav
        ? null
        : props.noBottomNavMobile
          ? null
          : <BottomNavigation style={{ position: 'sticky', bottom: 0, zIndex: 100 }} />
      }
    </Popup>
  } else {
    return <CenterPopup
      destroyOnClose
      maskClassName=""
      bodyClassName={` ${props.bodyClassName || ''}`}
      closeOnMaskClick
      showCloseButton={!props.noCloseBtn}
      visible={props.visible}
      bodyStyle={{
        ...props.bodyStyle,
        ...props.desktopBodyStyle
      }}
      onClose={props.onClose}
      disableBodyScroll
      getContainer={document.body}
    >
      {props.children}
      {props.noBottomNav
        ? null
        : props.noBottomNavDesktop
          ? null
          : <BottomNavigation style={{ position: 'sticky', bottom: 0, zIndex: 100 }} />
      }
    </CenterPopup>
  }
}

export default AdaptivePopup