import { observer } from "mobx-react-lite";
import { FC } from "react";
import AdaptivePopup from "../common/Popup/Popup";
import BackIcon from "../icons/Back";
import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { Image, Skeleton } from "antd-mobile";
import { toJS } from "mobx";
import { Optional } from "../../features/helpers";
import { useDeviceType, useStore } from "../../features/hooks";
import config from "../../features/config";
import { CourseItemComponent } from "../pages/main/parts/Menu/Categories/Categories";
import { CourseItem, CourseReview } from "../../stores/menu.store";
import { AddOne, AllCampaignUser, DishDiscount, DishSetDiscount } from "../../stores/cart.store";
import Popup from "../../features/modal";
import { ItemModal } from "./Course";
import { MyBadge } from "./CampaignPopup";

const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''
const CampaignCollectionPopup: FC<{ popup: Popup<AllCampaignUser>, childCousePopup: Popup<CourseItem, CourseReview[]>, onClose?: () => void }> = (props) => {
  const { reception: { menu }, user, cart } = useStore()

  function closeFn() {
    props.popup.close()
    props.onClose?.()
  }


  const currentCampaign = toJS(props.popup.content) as Optional<AllCampaignUser>

  const courses: Set<CourseItem & { priceWithDiscount: number }> = new Set()
  if (currentCampaign) {
    const { dishDiscounts, dishSet, addOne } = user.info
    const findByVcode = (item: DishDiscount | DishSetDiscount | AddOne) =>
      item.vcode === currentCampaign.VCode

    const dishDiscount = dishDiscounts.find(findByVcode)
    const setDiscount = dishSet.find(findByVcode)
    const addOneDiscount = addOne.find(findByVcode)
    const getDishByDiscount = (dish: DishDiscount) => {
      const course = menu.getDishByID(dish.dish)
      if (course) {
        if (dish.price) course.priceWithDiscount = dish.price
        if (dish.discountPercent)
          course.priceWithDiscount = course.Price * (100 - dish.discountPercent) / 100

        courses.add(course)
      }
    }
    if (dishDiscount) {
      const dishes = dishDiscounts.filter(ds =>
        ds.vcode === currentCampaign?.VCode
      )
      dishes?.forEach(getDishByDiscount)
    }
    if (setDiscount) {
      setDiscount.dishes.forEach(getDishByDiscount)
    }
    if(addOneDiscount) {
      // @ts-ignore
      addOneDiscount.dishes.forEach(getDishByDiscount)
    }
  }

  const Preloader: FC<{ animated?: boolean }> = props =>
    <Skeleton
      animated={props.animated}
      style={{
        aspectRatio: '401/290',
        width: '100%',
        height: 'auto',
      }}
    />

  const device = useDeviceType()
  function getContent() {
    if (currentCampaign) {
      return <section
        style={{
          height: 'calc(100vh - 40px)',
          overflowY: 'scroll',
          borderTopLeftRadius: 33,
          borderTopRightRadius: 33,
        }}
        className={styles.categories_wrapper}
      >
        <ItemModal popup={props.childCousePopup} />
        <Image
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + currentCampaign.image
          }
          style={{
            borderTopLeftRadius: 33,
            borderTopRightRadius: 33,
          }}

          fallback={<Preloader />}
          placeholder={<Preloader />}
        />
        {currentCampaign &&
          <MyBadge
            endtime={currentCampaign.endtime}
            begintime={currentCampaign.begintime}
            EndDate={currentCampaign.EndDate}
            BeginDate={currentCampaign.BeginDate}
            style={{ marginLeft: 20 }}
          />
        }
        <p
          style={{
            fontFamily: 'Arial',
            fontSize: 22.5,
            fontWeight: 400,
            lineHeight: '25.87px',
            textAlign: 'left',
            margin: '3px 29px'
          }}
        >
          {Prepare(currentCampaign?.Name) ?? 'Акция'}
        </p>
        <div
          style={{
            fontFamily: 'Arial',
            fontSize: 14.5,
            fontWeight: 400,
            lineHeight: '17px',
            textAlign: 'left',
            margin: '5px 31px',
            color: 'rgba(112, 112, 112, 1)',
            textIndent: '1rem'
          }}
        >
          {Prepare(currentCampaign.Description).split('\n').map((txt, index) => <p key={index}>{txt}</p>)}
        </div>
        <br />
        <div>
          <div className={styles.courses_list}>
            {
              Array.from(courses)
                // .filter((course1, index, arr) =>
                //   arr.findIndex(course2 => (course2.VCode === course1.VCode)) === index
                // )
                // .filter((course) => course.NoResidue || (!course.NoResidue && (course.EndingOcResidue > 0)))
                .map(cic => {
                  const couse = cart.countDiscountForCouses(cic)
                  return <CourseItemComponent
                    priceWithDiscount={couse.priceWithDiscount}
                    key={couse.couse.VCode}
                    course={couse.couse}
                    watchCourse={() => props.childCousePopup.watch(couse.couse)}
                    haveCampaign={Boolean(couse.campaign)}
                  />
                }
                )
            }
          </div>
        </div>
        {device === 'mobile'
          ? <div style={{ height: 65 }} />
          : null
        }
      </section>
    } else {
      return <section
        style={{
          height: 'calc(100vh - 40px)',
          overflowY: 'scroll',
          borderTopLeftRadius: 33,
          borderTopRightRadius: 33,
        }}
        className={styles.categories_wrapper}
      >
        <Skeleton
          animated
          style={{
            borderTopLeftRadius: 33,
            borderTopRightRadius: 33,
            height: 262,
            width: '100%'
          }}
        />
        <Skeleton.Title />
        <Skeleton.Paragraph />
      </section>
    }
  }
  return <AdaptivePopup
    visible={props.popup.show && !!currentCampaign}
    onClose={closeFn}
    noCloseBtn
    noBottomNavDesktop
    bodyStyle={{
      borderTopLeftRadius: 33,
      borderTopRightRadius: 33,
      marginTop: 40,
      position: 'relative',
    }}
    mobileBodyStyle={{
      position: 'fixed',
      maxHeight: 'calc(100% - 40px)'
    }}
    shtorkaOffset='-10px'
  >
    <BackIcon
      onClick={closeFn}
      styles={{
        position: 'absolute',
        top: -12,
        left: 30,
        zIndex: 1000
      }}
    />
    {getContent()}
  </AdaptivePopup>
}

export default observer(CampaignCollectionPopup)