import { Image, Skeleton } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { useGoUTM, useStore } from '../../features/hooks'
import { toJS } from 'mobx'
import { Selection } from '../../stores/menu.store'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { Optional } from '../../features/helpers'

import config from '../../features/config'
import BackIcon from '../icons/Back'
import AdaptivePopup from '../common/Popup/Popup'



export const CollectionPopup: FC = observer(p => {
  const { reception: { menu } } = useStore()

  const go = useGoUTM()
  function close() {
    menu.selectionPopup.close()
    go('/')
  }
  const currentCollection = toJS(menu.selectionPopup.content) as Optional<Selection>


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
        <Image
          height={262}
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + currentCollection.Image2
          }
          style={{
            borderTopLeftRadius: 33,
            borderTopRightRadius: 33,
          }}
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
        <p
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
        </p>
        <br />
        <div>
          <div className={styles.courses_list}>
            {currentCollection.CourseList.map(course =>
              <CourseItemComponent
                key={course.VCode}
                course={course}
              />
            )}
          </div>
        </div>
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
export const CollectionsPage: FC = observer(p => {
  const { reception: { menu } } = useStore()

  const go = useGoUTM()
  function close() {
    go('/')
    menu.selectionPopup.close()
  }


  return (
    <AdaptivePopup
      visible
      onClose={close}
      noCloseBtn
      bodyStyle={{
        borderTopLeftRadius: 33,
        borderTopRightRadius: 33,
        marginTop: 40,
        position: 'relative',
      }}
    >
      <BackIcon
        onClick={close}
        styles={{
          position: 'absolute',
          top: -12,
          left: 30,
          zIndex: 1000
        }}
      />
      <div className={styles.shtorka} />
      <section className={styles.categories_wrapper}>
        <div
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 80px)',
          }}
        >
          <br />
          {menu.selections.map((selection, index) =>
            <div key={index}>
              <h2
                onClick={() => { go('collections/' + selection.VCode) }}
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  margin: '10px 36px 0 36px',
                }}
              >
                {selection.Name}
              </h2>
              <br />
              <div className={styles.courses_list}>
                {selection.CourseList.map(course =>
                  <CourseItemComponent
                    key={course.VCode + selection.VCode}
                    course={course}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </AdaptivePopup>
  )
})

