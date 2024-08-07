import { Avatar, Divider, Ellipsis, Image, List, Popup, Rate, Result, Skeleton, Space } from "antd-mobile"
import { ClockCircleOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import moment from "moment"
import { FC } from "react"
import config from "../../../features/config"
import { useStore, useTheme } from "../../../features/hooks"
import { Cook } from "../../../stores/employees.store"
import { CourseItem } from "../../../stores/menu.store"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import Cooks from "./parts/Cooks/Cooks"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import styles from './styles.module.css'

const MainPage: FC = observer(() => {
  const { reception, reception: { menu, employees } } = useStore()
  return <Wrapper>
    <ReceptionSwitcher />
    <EmptyUnderFixed height="85px" />
    <Stories />
    <Collections />
    <Cooks />



  </Wrapper>
})

const EmptyUnderFixed: FC<{ height: string }> = props =>
  <div style={{ height: props.height }} />


export default MainPage