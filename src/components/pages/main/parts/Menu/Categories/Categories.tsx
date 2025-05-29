import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback } from "react"
import styles from './Categories.module.css'
import { useGoUTM, useStore } from "../../../../../../features/hooks";
import { Image, Skeleton, Space, Toast } from "antd-mobile";
import { CourseItem, Label, RecomendationItem } from "../../../../../../stores/menu.store";
import config from "../../../../../../features/config";
import IconStar from '../../../../../../assets/icon_star.svg'
import ImageReviews from '../../../../../../assets/image_reviews.svg'
import hotCampaign from '../../../../../../assets/hotCampaign.png'
import CustomButton from '../../../../../special/CustomButton'
import Metrics from "../../../../../../features/Metrics";
import { MinusOutline } from "antd-mobile-icons";
import { PlusOutlined } from "@ant-design/icons";
import { Maybe } from "../../../../../../features/helpers";

const LabelStyles: Record<string, CSSProperties> = {
  root: { position: 'relative' },
  wrapper: { 
    position: 'absolute', 
    top: 4, 
    right: 7, 
    display: "flex", 
    flexDirection: 'column',
    alignItems: 'end',
    justifyContent: 'end'
  }
}
type LabelProps = {
  haveCampaign: boolean
  courselabels: Maybe<string>
  allLabels: Label[]
}
const Labels: FC<LabelProps> = ({ haveCampaign, allLabels, courselabels }) => {
  const labelVcodes = courselabels?.split(',')
  const labelsMap = allLabels.reduce((acc, label) => {  
    acc[label.VCode] = label
    return acc
  }, {} as Record<string, Label>)
  return (
    <div className="w-100" style={LabelStyles.root}>
      <div style={LabelStyles.wrapper}>
        {haveCampaign ? <img src={hotCampaign} /> : null}
        {labelVcodes?.map(labelVcode => {
          const label = labelsMap[labelVcode];  
          if (!label) return null;  
  
          return <img src={`/labels/${label.Name}.png`} alt={label.Name} />
        })}
      </div>
    </div>
  )
}

type CourseItemProps = {
  course: CourseItem,
  priceWithDiscount?: number,
  watchCourse: () => void
  haveCampaign: boolean
}
export const CourseItemComponent: FC<CourseItemProps> = observer(props => {
  const { course, priceWithDiscount, watchCourse, haveCampaign } = props
  const { cart, reception: { menu }} = useStore()
  const isAdded = cart.findItem(course.VCode)
  return (
    <div className={styles.course_item + ' course_item_card'}>
      <Labels
        haveCampaign={haveCampaign}
        courselabels={course.Labels}
        allLabels={menu.Labels}
      />
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
          "--width": "auto",
          filter: isAdded
            ? 'brightness(50%)'
            : 'none'
        }}
      />
      {isAdded
        ? <div style={{ position: 'relative', width: '100%' }}>
          <span
            style={{
              position: 'absolute',
              left: 'calc(50% - 7px)',
              top: '-75px',
              color: 'white',
              fontSize: 30
            }}
          >
            {isAdded.quantity}
          </span>
        </div>
        : null
      }

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

  const minusItem = (e?: any) => {
    if (!nearestOrgForDelivery && !selectedOrgID) auth.bannerAskAdress.open()
    e?.stopPropagation()
    cart.removeFromCart(course.VCode)
  }
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
          <div className={styles.price_text} onClick={watchCourse}>
            {course.Name}
          </div>
          <h3
            className={styles.title_text}
          >
            <span>{course.CourseDescription}</span>
          </h3>
          <div className={styles.weight_text}>
            <span>{course.Weigth}</span>
          </div>
        </div>
        {cart.isInCart(course)
          ? <Space
            style={{
              background: 'var(--gur-border-color)',
              height: 24,
              borderRadius: 100,
            }}
            className={styles.added + ' w-100 ' + styles.button_price}
            justify='around'
            align='center'
          >
            <MinusOutline
              style={{ fontSize: 20 }}
              onClick={minusItem}
            />
            <span className={styles.added + ' ' + styles.button_price}>
              {`${cart.findItem(course.VCode)?.priceWithDiscount || course.Price} ₽`}
            </span>
            <PlusOutlined
              style={{ fontSize: 20 }}
              onClick={handleAddToCart}
            />
          </Space>
          : <div style={{ margin: '0px -4px' }}>
            <CustomButton
              // text={cart.isInCart(course) ? ('' + cart.findItem(course.VCode)?.quantity) : '+'}
              text={priceWithDiscount && priceWithDiscount < course.Price
                ? <span className={styles.not_added + ' ' + styles.button_price}>
                  <span className={styles.dashed_button_price}><s>{course.Price + ' ₽'}</s></span>
                  {' '}
                  <span>{'+ ' + priceWithDiscount + ' ₽'}</span>
                </span>
                : <span className={styles.not_added + ' ' + styles.button_price}>{`+ ${course.Price} ₽`}</span>
              }
              onClick={handleAddToCart}
              height={'24px'}
              maxWidth={'auto'}
              marginTop={'0px'}
              marginBottom={'0px'}
              marginHorizontal={'0px'}
              paddingHorizontal={'0px'}
              backgroundVar={cart.isInCart(course)
                ? '--gur-border-color'
                : '--gur-card-button-bg-color'
              }
              appendImage={null}
            />
          </div>
        }
      </div>
    </div>
  )
})

export const RecomendationItemComponent: FC<{ course: RecomendationItem, priceWithDiscount: number, haveCampaign: boolean }> = observer((props) => {
  const { reception: { menu }} = useStore()
  const { course, priceWithDiscount, haveCampaign } = props
  return (
    <div className={styles.recomendation_item + ' course_item_card'}>
      <Labels
        haveCampaign={haveCampaign}
        courselabels={course.Labels}
        allLabels={menu.Labels}
      />
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