import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback, useEffect, useState } from "react"
import styles from './Menu.module.css'
import CourseReviewPopup from "../../../../popups/CourseReviewPopup.tsx"
import { useGoUTM, useStore } from "../../../../../features/hooks"
import { CategoryCourse } from "../../../../../stores/menu.store"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import { Image, Skeleton, Toast } from "antd-mobile"
import config from "../../../../../features/config"
import CategoryPopup from "../../../../popups/CategoryPopup"
import { toJS } from "mobx"
import { useLocation, useParams } from "react-router-dom"
import { logger } from "../../../../../features/logger"
// import Categories from "./Categories/Categories"

const Menu: FC = observer(() => {
  const go = useGoUTM()
  const { category } = useParams<{ category: string }>()
  const { reception } = useStore()
  const { loadMenu, categories, categoryPopup } = reception.menu

  useEffect(() => {
    if (category && loadMenu.state === 'COMPLETED') {
      const categ = categories.find(cat => cat.VCode == Number(category))
      if (categ) {
        categoryPopup.watch(categ)
      } else {
        Toast.show('Товар не найден')
        logger.log(`Товар с vcode ${categ} не найден`)
        go('/')
      }
    }
  }, [loadMenu.state, category])

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
  </div>
})

const colStyle: CSSProperties = {
  padding: '4.5px 6px',
  position: 'relative'
}
const imgStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  aspectRatio: '351/491',
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
  const go = useGoUTM()
  return <Col style={colStyle} xs={4} sm={3} md={2} xl={2}>
    {err &&
      <span style={labelStyle}>
        {category.Name}
      </span>
    }
    <Image
      lazy
      fallback={<Skeleton style={imgStyle} />}
      placeholder={<Skeleton style={imgStyle} animated />}
      src={config.staticApi
        + "/api/v2/image/FileImage?fileId="
        + category.Image
      }
      onError={() => setErr(true)}
      onContainerClick={() => {
        go('/categories/' + category.VCode)
      }}
      fit='cover'
      style={imgStyle}
    />
  </Col>
}
const CategoryPlaceholder: FC = () => <Col style={colStyle} xs={4} sm={3} md={2}>
  <Skeleton style={imgStyle} animated />
</Col>


export default Menu