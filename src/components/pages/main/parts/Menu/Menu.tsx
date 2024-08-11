import { observer } from "mobx-react-lite"
import { FC } from "react"
import styles from './Menu.module.css'
import CourseReviewPopup from "../../../../popups/CourseReviewPopup.tsx"
import { MenuTabs } from "./MenuTabs/MenuTabs"
import Categories from "./Categories/Categories"

const Menu: FC = observer(() => {
  return <div className={styles.Menu_wrapper}>
    <CourseReviewPopup />
    <MenuTabs />
    <Categories />
  </div>
})



export default Menu