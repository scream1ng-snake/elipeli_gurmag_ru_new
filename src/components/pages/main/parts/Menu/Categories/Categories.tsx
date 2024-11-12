import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback } from "react"
import styles from './Categories.module.css'
import { useGoUTM, useStore } from "../../../../../../features/hooks";
import { Image, Result, Skeleton, Toast } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";
import { CourseItem } from "../../../../../../stores/menu.store";
import config from "../../../../../../features/config";
import IconStar from '../../../../../../assets/icon_star.svg'
import ImageReviews from '../../../../../../assets/image_reviews.svg'
import CustomButton from '../../../../../special/CustomButton'
import Metrics from "../../../../../../features/Metrics";

const Categories: FC = observer(function () {
  const { reception: { menu } } = useStore()
  const { categories, dishSearcher, loadMenu } = menu;

  if (loadMenu.state === 'COMPLETED') {
    return (
      <section className={styles.categories_wrapper}>
        {dishSearcher.isSearching
          ? <div>
            {dishSearcher.result.length
              ? <h2>{'Найдено ' + dishSearcher.result.length + ' блюд'}</h2>
              : <Result
                icon={<SmileOutline />}
                status='success'
                title='Сегодня такого блюда в меню нет((('
                description='В ближающее время блюдо появится в меню'
              />
            }
            {
              dishSearcher.result.length
                ? <div className={styles.courses_list}>
                  {dishSearcher.result.map((course, index) =>
                    <CourseItemComponent
                      key={index}
                      course={course}
                    />
                  )}
                </div>
                : null
            }

          </div>
          : categories.map((category, index) =>
            <div key={index} id={String(category.VCode)}>
              <h2>{category.Name.replaceAll('_', ' ')}</h2>
              <br />
              <div className={styles.courses_list}>
                {category.CourseList.map((course, index) =>
                  <CourseItemComponent
                    key={`${category.Name}-${course.Name}-${index}`}
                    course={course}
                  />
                )}
              </div>
            </div>
          )
        }

      </section>
    )
  } else {
    const preloder = {
      label: { width: "16px", height: "16px" },
      text: { width: "40px", height: "10px" },

      title: { margin: '1rem' },
      image: { height: "134px", width: "100%" },
      count: { marginTop: '4.86px', marginBottom: '0.86px', width: "84px", height: "10px" },
      price: { marginTop: '2px', marginBottom: '1.5px', width: "42px", height: "14.5px" },
      name: { marginTop: '1.03px', marginBottom: '1.03px', height: "12px", width: "130px" },
      weight: { marginTop: '7.86px', marginBottom: '0.86px', height: "10px", width: "24px" },
      button: { height: "24px", width: "100%", borderRadius: '20px' },
    }
    return <>
      <Skeleton.Title style={preloder.title} animated />
      <section className={styles.categories_wrapper}>
        <div>
          <div className={styles.courses_list}>
            {new Array(2).fill(null).map((_, index) =>
              <div className={styles.course_item} key={index}>
                <Skeleton animated style={preloder.image} />
                <div className={styles.item_bady}>
                  <div
                    className={styles.item_bottom_wrapper}
                  >
                    <div
                      className={styles.item_bottom_content}
                    >
                      <div className={styles.count_text}>
                        <Skeleton animated style={preloder.count} />
                      </div>
                      <div className={styles.price_text}>
                        <Skeleton animated style={preloder.price} />
                      </div>
                      <h3
                        className={styles.title_text}
                      >
                        <Skeleton.Title style={preloder.name} />
                      </h3>
                      <div className={styles.weight_text}>
                        <Skeleton animated style={preloder.weight} />
                      </div>
                    </div>
                    <div style={{ margin: '0px -4px' }}>
                      <Skeleton animated style={preloder.button} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  }
})

export default Categories


const iconStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}
export const CourseItemComponent: FC<{ course: CourseItem }> = observer(({ course }) => {
  const go = useGoUTM()
  const watchCourse = useCallback(() => go('/menu/' + course.VCode), [])
  return (
    <div className={styles.course_item + ' course_item_card'}>
      <Image
        lazy
        src={`${config.staticApi}/api/v2/image/Material?vcode=${course.VCode}&compression=true`}
        onClick={watchCourse}
        placeholder={<Skeleton style={{ width: '100%', height: '134px' }} animated />}
        fit='cover'
        width="auto"
        height="134px"
        style={{
          "--height": "134px",
          "--width": "auto"
        }}
      />
      <CardBodyComponent course={course} watchCourse={watchCourse} />
    </div>
  )
})

const CardBodyComponent: FC<{ course: CourseItem, watchCourse: () => void }> = observer(({ course, watchCourse }) => {
  const { reception: { menu, selectedOrgID, nearestOrgForDelivery }, cart, auth } = useStore()

  const handleAddToCart = useCallback((e?: any) => {
    if (!nearestOrgForDelivery && !selectedOrgID) auth.bannerAskAdress.open()
    e?.stopPropagation()
    cart.addCourseToCart(course)
    Metrics.addToCart(course)
    Toast.show({
      position: 'center',
      content: 'Добавлено'
    })
  }, [])

  const watchReviews = useCallback(() => menu.courseReviewsPopup.watch(course), [])
  return (
    <div className={styles.item_bady} style={{ position: 'relative' }}>
      <div className={styles.item_top_wrapper}>
        <div className={styles.rating_wrapper}>
          <div
            className={styles.rating}
            onClick={watchReviews}
          >
            <Image
              src={IconStar}
              width={10}
              height={10}
              fit='contain'
            />
            <div className={styles.rating_text} >
              {Math.ceil(course.Quality * 10) / 10}
            </div>
          </div>
        </div>
        <div>
          <Image
            src={ImageReviews}
            width={44}
            height={35}
            fit='contain'
            onClick={watchReviews}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
      <div className={styles.item_bottom_wrapper}>
        <div className={styles.item_bottom_content}>
          <div className={styles.count_text}>
            {`В наличии ${(!course.NoResidue && course.EndingOcResidue > 0) ? course.EndingOcResidue : 0} шт`}
          </div>
          <div className={styles.price_text}>
            <span>{`${course.Price} ₽`}</span>
          </div>
          <h3
            className={styles.title_text}
            onClick={watchCourse}
          >
            <span>{course.Name}</span>
          </h3>
          <div className={styles.weight_text}>
            <span>{course.Weigth}</span>
          </div>
        </div>
        <div style={{ margin: '0px -4px' }}>
          <CustomButton
            text={cart.isInCart(course) ? ('' + cart.findItem(course.VCode)?.quantity) : '+'}
            onClick={handleAddToCart}
            height={'24px'}
            maxWidth={'auto'}
            marginTop={'0px'}
            marginBottom={'0px'}
            marginHorizontal={'0px'}
            paddingHorizontal={'0px'}
            fontWeight={'400'}
            fontSize={cart.isInCart(course) ? '14.5px' : '18.5px'}
            backgroundVar={'--gur-card-button-bg-color'}
            colorVar={'--громкий-текст'}
            appendImage={null}
          />
        </div>
      </div>
    </div>
  )
})