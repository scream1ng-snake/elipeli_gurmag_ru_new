import { Button, CenterPopup, Image, Popup, Space, Stepper, Swiper, Toast } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useEffect, useState } from "react"
import { CourseItem } from "../../stores/menu.store"
import { useDeviceType, useStore } from "../../features/hooks"
import { toJS } from "mobx"
import config from "../../features/config"
import { LinkOutline, LeftOutline } from "antd-mobile-icons"
import { copyToClipboard } from "../../features/helpers";
import CustomButton from "../special/CustomButton"
import IconStar from '../../assets/icon_star.svg'
import ImageReviewsModal from '../../assets/image_reviews_modal.svg'
import Metrics from "../../features/Metrics"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import { Skeleton } from "antd-mobile/es/components/skeleton/skeleton"
import CourseReviewPopup from "./CourseReviewPopup.tsx"
import { Container } from "react-bootstrap"

export const ItemModal: FC<{ close?: () => void }> = observer(p => {
  const { reception: { menu, nearestOrgForDelivery, selectedOrgID }, cart, auth, vkMiniAppMetrics, user } = useStore();
  const { coursePopup } = menu
  const device = useDeviceType()

  const close = () => {
    coursePopup.close()
    p.close?.()
  }

  const currentCouse = toJS(coursePopup.content) as CourseItem


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
          Metrics.addToCart(currentCouse)
          vkMiniAppMetrics.addToCart(user.ID || '')
        }
        setCount(1)
        coursePopup.close()
        Toast.show('Добавлено')
      }
    }
    if (device === 'mobile') {
      return (
        <Popup
          closeIcon
          visible={coursePopup.show}
          onClose={close}
          onMaskClick={close}
          closeOnMaskClick
          style={{ height: '100%' }}
          bodyClassName={'item_modal'}
        >
          <CourseReviewPopup />
          <div className='item_modal_wrapper container p-0'>
            <div style={{ position: 'relative' }}>
              <Button
                onClick={close}
                shape='rounded'
                style={{
                  height: 35,
                  width: 35,
                  position: 'absolute',
                  top: '-1rem',
                  left: '1rem',
                  boxShadow: '0px 2px 2px 0px #00000026',
                  borderRadius: 100,
                  padding: 0,
                  zIndex: 1000
                }}
                className='item_modal_exit_btn'
              >
                <LeftOutline
                  fontSize={'11px'}
                  style={{
                    marginTop: '-2px',
                    marginLeft: '-2px',
                  }}
                />
              </Button>
            </div>
            <Row className="p-0 m-0 w-100">
              <Col md={5} className="p-0">
                <div className='item_modal_image_wrapper'>
                  <Swiper
                    indicator={(total, current) =>
                      <Indicator total={total} current={current} />
                    }>
                    {isHaveCarusel
                      ? currentCouse.CompressImages?.map(image =>
                        <Swiper.Item key={image}>
                          <Image
                            placeholder={<Skeleton animated className="item_modal_image_item" />}
                            fallback={<Skeleton animated className="item_modal_image_item" />}
                            className="item_modal_image_item"
                            fit='cover'
                            src={config.staticApi
                              + "/api/v2/image/FileImage?fileId="
                              + image
                            }
                          />
                        </Swiper.Item>
                      )
                      : <Swiper.Item>
                        <Image
                          placeholder={<Skeleton animated className="item_modal_image_item" />}
                          fallback={<Skeleton animated className="item_modal_image_item" />}
                          fit='cover'
                          className="item_modal_image_item"
                          // style={{ width: '100%', height: '263px', maxHeight: '33vh' }}
                          src={config.staticApi
                            + "/api/v2/image/FileImage?fileId="
                            + currentCouse.Images?.[0]
                          }
                        />
                      </Swiper.Item>
                    }

                  </Swiper>
                </div>
              </Col>
              <Col md={7} className="p-0">
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
                      style={{ marginRight: '3px' }}
                    >
                      <Image
                        src={ImageReviewsModal}
                        width={63.12}
                        height={45.43}
                        fit='contain'
                        onClick={() => menu.courseReviewsPopup.watch(currentCouse)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  <div style={{ height: '100%', overflow: 'scroll', display: 'flex', flexDirection: 'column' }}>
                    <div className="item_modal_top_wrapper">
                      <h1 className="item_modal_title_text">
                        {currentCouse.Name}
                      </h1>
                      {!currentCouse.NoResidue
                        ? <div className="item_modal_count_text">
                          {'В наличии ' + currentCouse.EndingOcResidue + ' шт'}
                        </div>
                        : currentCouse.CookingTime
                          ? <div className="item_modal_count_text">
                            {'Готовим под заказ ' + currentCouse.CookingTime + ' мин.'}
                          </div>
                          : null
                      }
                      <Space
                        style={{ '--gap': '20px', width: '100%', marginTop: '4.78px' }}
                        align={'center'}
                        justify={'between'}
                      >
                        <Space
                          style={{ '--gap': '20px' }}
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
                          style={{ cursor: 'pointer' }}
                        >
                          <LinkOutline
                            style={{ color: 'var(--gur-card-weight-text-color)' }}
                            fontSize={24}
                          />
                        </div>
                      </Space>
                      <Space
                        style={{ '--gap': '14px', width: 'calc(100%)', marginTop: '20px' }}
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
                            if (!nearestOrgForDelivery && !selectedOrgID) {
                              auth.bannerAskAdress.open();
                            }
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
                        {currentCouse.CourseDescription
                          .split('\n')
                          .map((str, index) =>
                            <p key={index}>{str}</p>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Popup>
      )
    } else {
      return (
        <CenterPopup
          onClose={close}
          onMaskClick={close}
          visible={coursePopup.show}
          bodyClassName="mediaPopup"
        >
          <Container>
            <Row>
              <Col md={6} className="p-0">
                <Swiper
                  indicator={(total, current) =>
                    <Indicator
                      total={total}
                      current={current}
                    />
                  }
                >
                  {isHaveCarusel
                    ? currentCouse.CompressImages?.map(image =>
                      <Swiper.Item key={image}>
                        <Image
                          style={{ height: '100%' }}
                          src={config.staticApi
                            + "/api/v2/image/FileImage?fileId="
                            + image
                          }
                        />
                      </Swiper.Item>
                    )
                    : <Swiper.Item>
                      <Image
                        style={{ height: '100%' }}
                        src={config.staticApi
                          + "/api/v2/image/FileImage?fileId="
                          + currentCouse.Images?.[0]
                        }
                      />
                    </Swiper.Item>
                  }

                </Swiper>
              </Col>
              <Col md={6} className="p-0">
                <div className="item_modal_content">
                  <div style={{ height: '100%', overflow: 'scroll', display: 'flex', flexDirection: 'column' }}>
                    <div className="item_modal_top_wrapper">
                      <h1 className="item_modal_title_text">
                        {currentCouse.Name}
                      </h1>
                      {!currentCouse.NoResidue
                        ? <div className="item_modal_count_text">
                          {'В наличии ' + currentCouse.EndingOcResidue + ' шт'}
                        </div>
                        : currentCouse.CookingTime
                          ? <div className="item_modal_count_text">
                            {'Готовим под заказ ' + currentCouse.CookingTime + ' мин.'}
                          </div>
                          : null
                      }
                      <Space
                        style={{ '--gap': '20px', width: '100%', marginTop: '4.78px' }}
                        align={'center'}
                        justify={'between'}
                      >
                        <Space
                          style={{ '--gap': '20px' }}
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
                          style={{ cursor: 'pointer' }}
                        >
                          <LinkOutline
                            style={{ color: 'var(--gur-card-weight-text-color)' }}
                            fontSize={24}
                          />
                        </div>
                      </Space>
                      <Space
                        style={{ '--gap': '14px', width: 'calc(100%)', marginTop: '20px' }}
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
                            if (!nearestOrgForDelivery && !selectedOrgID) {
                              auth.bannerAskAdress.open();
                            }
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
                        {currentCouse.CourseDescription
                          .split('\n')
                          .map((str, index) =>
                            <p key={index}>{str}</p>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </CenterPopup>
      )
    }
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