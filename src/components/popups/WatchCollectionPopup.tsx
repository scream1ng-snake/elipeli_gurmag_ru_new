import { NavBar, Popup, Image, Toast, Skeleton } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC, useCallback, useEffect } from 'react'
import { useGoUTM, useStore } from '../../features/hooks'
import { toJS } from 'mobx'
import { Selection } from '../../stores/menu.store'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { Optional } from '../../features/helpers'

import config from '../../features/config'
import BackIcon from '../icons/Back'
import BottomNavigation from '../common/BottomNav/BottomNav'



export const CollectionPopup: FC = observer(p => {
  const { VCode } = useParams<{ VCode: string }>()
  const { reception: { menu } } = useStore()

  const go = useGoUTM()
  function close() {
    go('/')
    menu.selectionPopup.close()
  }
  const currentCollection = toJS(menu.selectionPopup.content) as Optional<Selection>

  useEffect(() => {
    console.log('qq')
    if (menu.loadMenu.state === 'COMPLETED') {
      console.log('sasa')
      if (VCode) {
        const target = menu.getSelection(VCode)
        console.log(toJS(target))
        target
          ? menu.selectionPopup.watch(target)
          : (Toast.show('Такой подборки не нашли(')
            && close())
      }
    }
  }, [menu.loadMenu.state, VCode, menu.categories.length, menu.loadMenuBg.state])

  console.log('c length ' + menu.categories.length)
  console.log('s length ' + menu.selections.length)
  console.log('stote ' + menu.loadMenu.state)
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
        <BottomNavigation />

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
    <Popup
      position='bottom'
      visible
      onClose={close}
      onMaskClick={close}
      closeOnSwipe
      bodyStyle={{
        width: '100vw',

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
      {getContent()}
    </Popup>
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
    <Popup
      position='bottom'
      visible
      onClose={close}
      onMaskClick={close}
      closeOnSwipe
      bodyStyle={{
        width: '100vw',
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
      <BottomNavigation />
    </Popup >
  )
})

