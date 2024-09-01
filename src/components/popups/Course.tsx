import { ShoppingCartOutlined } from "@ant-design/icons"
import { Button, Grid, Image, Popup, Space, Stepper, Swiper, Toast } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useState } from "react"
import { CourseItem } from "../../stores/menu.store"
import { useStore } from "../../features/hooks"
import { toJS } from "mobx"
import config from "../../features/config"
import { useNavigate } from "react-router-dom"
import { LinkOutline } from "antd-mobile-icons"

export const ItemModal: FC = observer(() => {
  const go = useNavigate()
  const { reception: { menu }, cart } = useStore();
  const { loadCourseReviews, coursePopup } = menu

  const close = () => {
    coursePopup.close()
    go('/')
  }

  const currentCouse = toJS(coursePopup.content) as CourseItem
  const reviews = toJS(coursePopup.saved)
  const isLoading =
    loadCourseReviews.state === 'LOADING'


  const [count, setCount] = useState(1);

  if (currentCouse) {
    const isHaveCarusel = currentCouse.CompressImages
      && currentCouse.CompressImages.length


    const addToCart = () => {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          cart.addCourseToCart(currentCouse)
          // Metrics.addToCart(course.VCode, course.Price) todo
        }
        setCount(1)
        coursePopup.close()
        Toast.show('Добавлено')
      }
    }
    return (
      <Popup
        closeIcon
        visible={coursePopup.show}
        onClose={close}
        onMaskClick={close}
        closeOnMaskClick
      >
        <Swiper indicator={(total, current) => <Indicator total={total} current={current} />}>
          {isHaveCarusel
            ? currentCouse.CompressImages?.map(image =>
              <Swiper.Item key={image}>
                <Image
                  // placeholder={ } todo
                  // fallback={ }
                  src={config.staticApi
                    + "/api/v2/image/FileImage?fileId="
                    + image
                  }
                />
              </Swiper.Item>
            )
            : <Swiper.Item>
              <Image
                // placeholder={ }
                // fallback={ } todo
                src={config.staticApi
                  + "/api/v2/image/Material?vcode="
                  + currentCouse.VCode
                }
              />
            </Swiper.Item>
          }

        </Swiper>
        <h1>{currentCouse.Name}</h1>
        <p>{currentCouse.CourseDescription}</p>
        <Grid columns={2}>
          {!currentCouse.NoResidue
            ? <Grid.Item span={2}>
              <p>Сейчас в наличии:</p>
              <h2>{currentCouse.EndingOcResidue}</h2>
            </Grid.Item>
            : null
          }
          <Grid.Item span={1}>
            <p>Количество:</p>
            <Stepper
              value={count}
              onChange={setCount}
              min={0}
            />
          </Grid.Item>
          <Grid.Item span={1}>
            <p>Стоимость:</p>
            <p>{currentCouse.Price + ' ₽'}</p>
          </Grid.Item>
        </Grid>
        <Button
          onClick={addToCart}
          disabled={count <= 0}
          shape='rounded'
          color='primary'
        >
          <Space>
            <ShoppingCartOutlined />
            Добавить в корзину
          </Space>
        </Button>
        <Button
          onClick={() => {
            window.navigator.clipboard.writeText(window.location.href)
            Toast.show('Ссылка скопирована')
          }}
          shape='rounded'
          color='primary'
          fill='outline'
        >
          <Space>
            <LinkOutline />
            Копировать ссылку
          </Space>
        </Button>
      </Popup >
    )
  }
  return null
})


const indicatorStyle: CSSProperties = {
  top: 6,
  borderRadius: 4,
  position: "absolute",
  background: "rgba(0, 0, 0, 0.3)",
  padding: "4px 8px",
  color: "#ffffff",
  userSelect: "none",
}
const Indicator: FC<{ total: number, current: number }> = p =>
  <div style={indicatorStyle}>
    {`${p.current + 1} / ${p.total}`}
  </div>