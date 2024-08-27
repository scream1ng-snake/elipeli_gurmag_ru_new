import { Button, Grid, Image } from "antd-mobile"
import { FC } from "react"
import { WithChildren } from "../../../features/helpers"
import styles from './styles.module.css'
import { AddOutline } from "antd-mobile-icons"
import { CourseItem } from "../../../stores/menu.store"
import { observer } from "mobx-react-lite"
import { useStore } from "../../../features/hooks"
import config from "../../../features/config"

const List: FC<WithChildren> = propas =>
  <Grid columns={2} gap={8}>
    {propas.children}
  </Grid>


type P = { course: CourseItem }
const Item: FC<P> = observer(({ course }) => {
  const { reception: { menu }} = useStore()

  return <Grid.Item className={styles.couse}>
    <Image 
      lazy
      src={`${config.apiURL}/api/v2/image/Material?vcode=${course.VCode}&compression=true`} 
      onClick={() => menu.coursePopup.watch(course)} 
    />
    <div></div>
    <Button>
      <AddOutline />
    </Button>
  </Grid.Item>
})

/** Компоненты списка и блюда */
const Course = {
  List: List,
  Item: Item,
}
export default Course