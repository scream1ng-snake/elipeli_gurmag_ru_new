import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import styles from './Categories.module.css'
import { useGoUTM, useStore } from "../../../../../../features/hooks";
import { Image, Skeleton, Toast } from "antd-mobile";
import { CourseItem, RecomendationItem } from "../../../../../../stores/menu.store";
import config from "../../../../../../features/config";
import IconStar from '../../../../../../assets/icon_star.svg'
import ImageReviews from '../../../../../../assets/image_reviews.svg'
import hotCampaign from '../../../../../../assets/hotCampaign.png'
import CustomButton from '../../../../../special/CustomButton'
import Metrics from "../../../../../../features/Metrics";

const CampaignLabel: FC = () => <div className="w-100" style={{ position: 'relative' }}>
  <img src={hotCampaign} style={{ position: 'absolute', top: 4, right: 7 }} />
</div>

type CourseItemProps = {
  course: CourseItem,
  priceWithDiscount?: number,
  watchCourse: () => void
  haveCampaign: boolean
}
export const CourseItemComponent: FC<CourseItemProps> = observer(props => {
  const { course, priceWithDiscount, watchCourse, haveCampaign } = props
  return (
    <div className={styles.course_item + ' course_item_card'}>
      {haveCampaign
        ? <CampaignLabel />
        : null
      }

      <Image
        lazy
        src={`${config.staticApi}/api/v2/image/FileImage?fileId=${course.CompressImages?.[0]}`}
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
      <CardBodyComponent
        course={course}
        watchCourse={watchCourse}
        priceWithDiscount={priceWithDiscount}
      />
    </div>
  )
})
type CardBodyProps = {
  course: CourseItem,
  watchCourse: () => void,
  priceWithDiscount?: number
}
const CardBodyComponent: FC<CardBodyProps> = observer(({ course, watchCourse, priceWithDiscount }) => {
  const { reception: { menu, selectedOrgID, nearestOrgForDelivery }, cart, auth, user, vkMiniAppMetrics } = useStore()

  const handleAddToCart = useCallback((e?: any) => {
    if (!nearestOrgForDelivery && !selectedOrgID) auth.bannerAskAdress.open()
    e?.stopPropagation()
    cart.addCourseToCart(course)
    Metrics.addToCart(course)
    vkMiniAppMetrics.addToCart(user.ID || '')
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
          {!course.NoResidue
            ? <div className={styles.count_text}>
              {'В наличии ' + course.EndingOcResidue + ' шт'}
            </div>
            : course.CookingTime
              ? <div className={styles.count_text}>
                {'Готовим под заказ ' + course.CookingTime + ' мин.'}
              </div>
              : null
          }
          <div className={styles.price_text}>
            {priceWithDiscount && priceWithDiscount < course.Price
              ? <span>
                <span className={styles.hotPrice}>{priceWithDiscount + ' ₽'}</span>
                {' '}
                <span><s>{course.Price + ' ₽'}</s></span>
              </span>
              : <span>{`${course.Price} ₽`}</span>
            }

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

export const RecomendationItemComponent: FC<{ course: RecomendationItem, priceWithDiscount: number, haveCampaign: boolean }> = observer((props) => {
  
  const { course, priceWithDiscount, haveCampaign } = props
  return (
    <div className={styles.recomendation_item + ' course_item_card'}>
      {haveCampaign
        ? <CampaignLabel />
        : null
      }
      <Image
        lazy
        src={`${config.staticApi}/api/v2/image/FileImage?fileId=${course.CompressImages?.[0]}`}
        // onClick={watchCourse}
        placeholder={<Skeleton style={{ width: '100%', height: '134px' }} animated />}
        fit='cover'
        width="auto"
        height="134px"
        style={{
          "--height": "134px",
          "--width": "auto"
        }}
      />
      <RecomendationBodyComponent 
        course={course} 
        priceWithDiscount={priceWithDiscount}
      />
    </div>
  )
})

const RecomendationBodyComponent: FC<{ course: RecomendationItem, priceWithDiscount: number }> = observer(({ course, priceWithDiscount }) => {
  const { reception: { menu, selectedOrgID, nearestOrgForDelivery }, cart, auth, user, vkMiniAppMetrics } = useStore()

  const handleAddToCart = useCallback((e?: any) => {
    if (!nearestOrgForDelivery && !selectedOrgID) auth.bannerAskAdress.open()
    e?.stopPropagation()
    cart.addCourseToCart(course)
    Metrics.addToCart(course)
    vkMiniAppMetrics.addToCart(user.ID || '')
    Toast.show({
      position: 'center',
      content: 'Добавлено'
    })
  }, [])

  const go = useGoUTM()

  return (
    <div className={styles.item_bady} style={{ position: 'relative' }}>
      <div className={styles.item_top_wrapper}>
        <div className={styles.rating_wrapper}>
          <div
            className={styles.rating}
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
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
      <div className={styles.item_bottom_wrapper}>
      <div className={styles.item_bottom_content}>
          {!course.NoResidue
            ? <div className={styles.count_text}>
              {'В наличии ' + course.EndingOcResidue + ' шт'}
            </div>
            : course.CookingTime
              ? <div className={styles.count_text}>
                {'Готовим под заказ ' + course.CookingTime + ' мин.'}
              </div>
              : null
          }
          <div className={styles.price_text}>
            {priceWithDiscount && priceWithDiscount < course.Price
              ? <span>
                <span className={styles.hotPrice}>{priceWithDiscount + ' ₽'}</span>
                {' '}
                <span><s>{course.Price + ' ₽'}</s></span>
              </span>
              : <span>{`${course.Price} ₽`}</span>
            }

          </div>
          <h3
            className={styles.title_text}
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
            marginTop={'5px'}
            marginBottom={'0px'}
            marginHorizontal={'0px'}
            paddingHorizontal={'0px'}
            fontWeight={'400'}
            fontSize={cart.isInCart(course) ? '14.5px' : '18.5px'}
            backgroundVar={'--gur-card-button-bg-color'}
            colorVar={'--громкий-текст'}
            appendImage={null}
          />
          <CustomButton
            text={course.LinkName}
            onClick={() => go(course.Link)}
            height={'24px'}
            maxWidth={'auto'}
            marginTop={'5px'}
            marginBottom={'0px'}
            marginHorizontal={'0px'}
            paddingHorizontal={'0px'}
            fontWeight={'700'}
            fontSize={'12px'}
            backgroundVar={'--gurmag-accent-color'}
            colorVar={'--громкий-текст'}
            appendImage={null}
          />
        </div>
      </div>
    </div>
  )
})