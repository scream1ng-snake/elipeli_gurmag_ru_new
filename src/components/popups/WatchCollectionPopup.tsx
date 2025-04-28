import { Image, Skeleton } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { useDeviceType, useGoUTM, useStore } from '../../features/hooks'
import { toJS } from 'mobx'
import { Selection } from '../../stores/menu.store'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { Optional } from '../../features/helpers'

import config from '../../features/config'
import BackIcon from '../icons/Back'
import AdaptivePopup from '../common/Popup/Popup'
import { GiftButton } from '../icons/GiftButton'
import AskAuthorize from './AskAuthorize'



export const CollectionPopup: FC = observer(p => {
  const { reception: { menu }, auth } = useStore()
  const device = useDeviceType()

  const go = useGoUTM()
  function close() {
    menu.selectionPopup.close()
    go('/')
  }
  const currentCollection = toJS(menu.selectionPopup.content) as Optional<Selection>

  const Preloader: FC<{ animated?: boolean }> = props =>
    <Skeleton
      animated={props.animated}
      style={{
        aspectRatio: '401/290',
        width: '100%',
        height: 'auto',
      }}
    />

  function getContent() {
    // смотрим одну подборку
    if (currentCollection) {
      return <section
        style={{
          height: 'calc(100vh - 40px)',
          overflowY: 'scroll',
          borderTopLeftRadius: 33,
          borderTopRightRadius: 33,
        }}
        className={styles.categories_wrapper}
      >
        {auth.floatingIconAuthForGift.show
          ? <GiftButton
            onClick={auth.bannerAuthForGift.open}
            style={{ zIndex: 2, position: 'absolute', right: '16px', bottom: '81px' }}
          />
          : null
        }
        <Image
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + currentCollection.Image2
          }
          style={{
            borderTopLeftRadius: 33,
            borderTopRightRadius: 33,
          }}

          fallback={<Preloader />}
          placeholder={<Preloader />}
        />
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
          {currentCollection?.Name ?? 'Подборки'}
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
          {currentCollection.Description.split('\n').map((txt, index) => <p key={index}>{txt}</p>)}
        </div>
        <br />
        <div>
          <div className={styles.courses_list}>
            {currentCollection.CourseList
              .filter((course1, index, arr) =>
                arr.findIndex(course2 => (course2.VCode === course1.VCode)) === index
              )
              .map(course =>
                <CourseItemComponent
                  key={course.VCode}
                  course={course}
                  watchCourse={() => go('/menu/' + course.VCode)}
                />
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
        {auth.floatingIconAuthForGift.show
          ? <GiftButton
            onClick={auth.bannerAuthForGift.open}
            style={{ zIndex: 2, position: 'absolute', right: '16px', bottom: '81px' }}
          />
          : null
        }
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
  return (
    <AdaptivePopup
      visible={menu.selectionPopup.show && !!currentCollection}
      onClose={close}
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
      <AskAuthorize />
      <BackIcon
        onClick={close}
        styles={{
          position: 'absolute',
          top: -12,
          left: 30,
          zIndex: 1000
        }}
      />
      {getContent()}
    </AdaptivePopup>
  )
})
// export const CollectionsPopup: FC = observer(p => {
//   const { reception: { menu } } = useStore()

//   const go = useGoUTM()
//   function close() {
//     go('/')
//     menu.selectionsPopup.close()
//   }


//   return (
//     <AdaptivePopup
//       visible={menu.selectionsPopup.show}
//       onClose={close}
//       noCloseBtn
//       noBottomNavDesktop
//       bodyStyle={{
//         borderTopLeftRadius: 33,
//         borderTopRightRadius: 33,
//         marginTop: 40,
//         position: 'relative',
//       }}
//       mobileBodyStyle={{
//         position: 'fixed',
//         maxHeight: 'calc(100% - 40px)'
//       }}
//       shtorkaOffset='-10px'
//     >
//       <BackIcon
//         onClick={close}
//         styles={{
//           position: 'absolute',
//           top: -12,
//           left: 30,
//           zIndex: 1000
//         }}
//       />
//       <section className={styles.categories_wrapper}>
//         <div
//           style={{
//             overflowY: 'auto',
//             height: 'calc(100vh - 80px)',
//           }}
//         >
//           <br />
//           {menu.selections.map((selection, index) =>
//             <div key={index}>
//               <h2
//                 onClick={() => { go('collections/' + selection.VCode) }}
//                 style={{
//                   fontSize: 22,
//                   fontWeight: 700,
//                   margin: '10px 36px 0 36px',
//                 }}
//               >
//                 {selection.Name}
//               </h2>
//               <br />
//               <div className={styles.courses_list}>
//                 {selection.CourseList
//                   .filter((_, index) => index < 6)
//                   .map(course =>
//                     <CourseItemComponent
//                       key={course.VCode + selection.VCode}
//                       course={course}
//                     />
//                   )
//                 }
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//     </AdaptivePopup>
//   )
// })

