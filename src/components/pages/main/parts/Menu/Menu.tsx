import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useState } from "react"
import styles from './Menu.module.css'
import CourseReviewPopup from "../../../../popups/CourseReviewPopup.tsx"
import { useStore } from "../../../../../features/hooks"
import { CategoryCourse } from "../../../../../stores/menu.store"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { Image, Skeleton } from "antd-mobile"
import config from "../../../../../features/config"
import CategoryPopup from "../../../../popups/CategoryPopup"
// import Categories from "./Categories/Categories"

const Menu: FC = observer(() => {
  const { reception } = useStore()
  const { loadMenu, categories } = reception.menu

  if (!categories.length && loadMenu.state === 'COMPLETED') return null
  return <div className={styles.Menu_wrapper}>
    <CourseReviewPopup />
    <CategoryPopup />
    <Row className="me-2" style={{ marginLeft: -5 }}>
      {loadMenu.state === 'COMPLETED'
        ? categories.map((category, index) =>
          <Category category={category} key={index} />
        )
        : new Array(9).fill(null).map((_, index) =>
          <CategoryPlaceholder key={index} />
        )
      }
    </Row>
    {/* <Categories /> */}
  </div>
})

const colStyle: CSSProperties = {
  padding: '4.5px 6px',
  position: 'relative'
}
const imgStyle: CSSProperties = {
  width: '100%',
  height: 142,
  borderRadius: 10,
}
const labelStyle: CSSProperties = {
  position: 'absolute',

  padding: '0.5rem',
  width: 'calc(100% - 1rem)',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '15.23px',
  color: "black"
}
const Category: FC<{ category: CategoryCourse }> = ({ category }) => {
  const [err, setErr] = useState(false)
  const { reception: { menu }} = useStore()
  const watchCategory = () => menu.categoryPopup.watch(category)
  return <Col style={colStyle} xs={4} sm={3} md={2}>
    {err &&
      <span style={labelStyle}>
        {category.Name}
      </span>
    }
    <Image
      fallback={<Skeleton style={imgStyle} />}
      placeholder={<Skeleton style={imgStyle} animated />}
      src={config.staticApi
        + "/api/v2/image/FileImage?fileId="
        + category.Image
      }
      onError={() => setErr(true)}
      onContainerClick={watchCategory}
      fit='cover'
      style={imgStyle}
    />
  </Col>
}
const CategoryPlaceholder: FC = () => <Col style={colStyle} xs={4} sm={3} md={2}>
  <Image
    fallback={<Skeleton style={imgStyle} animated />}
    placeholder={<Skeleton style={imgStyle} animated />}
    src=''
    style={imgStyle}
  />
</Col>


export default Menu