import { ShoppingCartOutlined } from "@ant-design/icons"
import { Button, Grid, Image, Popup, Space, Stepper, Swiper, Toast } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useEffect, useState } from "react"
import { CourseItem } from "../../stores/menu.store"
import { useStore } from "../../features/hooks"
import { toJS } from "mobx"
import config from "../../features/config"
import { useNavigate } from "react-router-dom"
import { LinkOutline, LeftOutline } from "antd-mobile-icons"
import { copyToClipboard } from "../../features/helpers";
import CustomButton from "../special/CustomButton"
import IconStar from '../../assets/icon_star.svg'
import ImageReviewsModal from '../../assets/image_reviews_modal.svg'

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

  useEffect(() => {
    setCount(1)
  }, [coursePopup.show])

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
        style={{height: '100%'}}
        bodyClassName={'item_modal'}
      >
        <div className={'item_modal_wrapper'}>
          <div className={'item_modal_image_wrapper'}>
            <Swiper
              indicator={(total, current) =>
              <Indicator total={total} current={current} />
              }>
              {isHaveCarusel
                ? currentCouse.CompressImages?.map(image =>
                  <Swiper.Item key={image}>
                    <Image
                      // placeholder={ } todo
                      // fallback={ }
                      fit='cover'
                      style={{ width: '100%', height: '263px', maxHeight: '33vh'}}
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
                    fit='cover'
                    style={{ width: '100%', height: '263px', maxHeight: '33vh'}}
                    src={config.staticApi
                      + "/api/v2/image/Material?vcode="
                      + currentCouse.VCode
                    }
                  />
                </Swiper.Item>
              }

            </Swiper>
          </div>
          <div className="item_modal_content">
            <div 
              className="item_modal_absolute_wrapper"
            >
              <div className="item_modal_rating_wrapper">
                <div 
                  className="item_modal_rating"
                  onClick={() => menu.courseReviewsPopup.watch(currentCouse)}
                >
                  <Image
                    src={IconStar}
                    width={13.47}
                    height={13.08}
                    fit='contain'
                  />
                  <div className="item_modal_rating_text" >
                    {Math.ceil(currentCouse.Quality * 10) / 10}
                  </div>
                </div>
              </div>
              <div 
                style={{marginRight: '3px'}}
              >
                <Image
                  src={ImageReviewsModal}
                  width={63.12}
                  height={45.43}
                  fit='contain'
                  onClick={() => menu.courseReviewsPopup.watch(currentCouse)}
                  style={{cursor: 'pointer'}}
                />
              </div>
            </div>
            <div className="item_modal_top_wrapper">
              <h1 className="item_modal_title_text">
                {currentCouse.Name}
              </h1>
              <div className="item_modal_count_text">
                {`В наличии ${(!currentCouse.NoResidue && currentCouse.EndingOcResidue > 0) ? currentCouse.EndingOcResidue : 0} шт`}
              </div>
              <Space
                style={{'--gap': '20px', width: '100%', marginTop: '4.78px'}}
                align={'center'}
                justify={'between'}
              >
                <Space
                  style={{'--gap': '20px'}}
                  align={'center'}
                >
                  <div className="item_modal_price_text_shell">
                    <div className="item_modal_price_text">
                      <span>{`${currentCouse.Price} ₽`}</span>
                    </div>
                  </div>
                  <div className="item_modal_weight_text">
                    <span>{currentCouse.Weigth}</span>
                  </div>
                </Space>
                <div
                  title="Копировать ссылку"
                  onClick={() => {
                    copyToClipboard(window?.location?.href)
                    Toast.show('Ссылка скопирована')
                  }}
                  style={{cursor: 'pointer'}}
                >
                  <LinkOutline
                    style={{color: 'var(--gur-card-weight-text-color)'}}
                    fontSize={24}
                  />
                </div>
              </Space>
              <Space
                style={{'--gap': '14px', width: 'calc(100vw - 32px)', marginTop: '20px'}}
                align={'center'}
                justify={'between'}
              >
                <Stepper
                  value={count}
                  onChange={setCount}
                  min={0}
                  className="item_modal_stepper"
                  style={{
                    '--button-text-color': 'var(--громкий-текст)',
                    '--input-font-color': 'var(--громкий-текст)',
                    '--input-font-size': '17px',
                    height: '43px',
                    borderRadius: '10px',
                    margin: '0px',
                  }}
                />
                <CustomButton
                  text={'Добавить'}
                  onClick={() => {
                    addToCart()
                    close()
                  }}
                  height={'43px'}
                  maxWidth={'auto'}
                  
                  marginTop={'0px'}
                  marginBottom={'0px'}
                  marginHorizontal={'0px'}
                  paddingHorizontal={'60px'}
                  fontWeight={'400'}
                  fontSize={'17px'}
                  backgroundVar={'--gurmag-accent-color'}
                  colorVar={'--gur-custom-button-text-color'}
                  borderRadius={'10px'}
                  appendImage={null}
                  disabled={count <= 0}
                />
              </Space>
            </div>
            <div className="item_modal_description_wrapper">
              <div className="item_modal_description_label">
                Описание
              </div>
              <div className="item_modal_description_text">
                {currentCouse.CourseDescription}
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={close}
          shape='rounded'
          style={{
            height: '35px',
            width: '35px',
            position: 'absolute',
            top: '-11px',
            left:' 29px',
            boxShadow: '0px 2px 2px 0px #00000026',
            borderRadius: '50%',
            padding: '0',
          }}
          className={'item_modal_exit_btn'}
        >
          <LeftOutline
            fontSize={'11px'}
            style={{
              marginTop: '-2px',
              marginLeft: '-2px',
            }}
          />
        </Button>
      </Popup >
    )
  }
  return null
})


const indicatorStyle: CSSProperties = {
  top: 6,
  right: 6,
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