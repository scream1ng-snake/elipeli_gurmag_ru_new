import { NavBar, Popup, Image, Toast } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'
import { useStore } from '../../features/hooks'
import { toJS } from 'mobx'
import { Selection } from '../../stores/menu.store'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { Optional } from '../../features/helpers'

import config from '../../features/config'
import { FullscreenLoading } from '../common/Loading/Loading'

export const CollectionPopup: FC = observer(p => {
  const { VCode } = useParams<{ VCode: string }>()
  const { reception: { menu } } = useStore()

  const go = useNavigate()
  function close() {
    go('/')
    menu.selectionPopup.close()
  }
  const currentCollection = toJS(menu.selectionPopup.content) as Optional<Selection>

  useEffect(() => {
    if (menu.loadMenu.state === 'COMPLETED') {
      if (VCode) {
        const target = menu.getSelection(VCode)
        target
          ? menu.selectionPopup.watch(target)
          : (Toast.show('Такой подборки не нашли(')
          && close())
      }
    }
  }, [VCode, menu.loadMenu.state])

  function getContent() {
    // смотрим одну подборку
    if (currentCollection) {
      return <section className={styles.categories_wrapper}>
        <div
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 80px)',
          }}
        >
          <Image
            src={config.staticApi
              + "/api/v2/image/FileImage?fileId="
              + currentCollection.Image2
            }
            fit='cover'
            style={{
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              "--height": "263px",
              "--width": "100%",
            }}
          />
          <div
            style={{
              margin: '8px 16px'
            }}
          >
            {currentCollection.Description}
          </div>
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
      return <FullscreenLoading />
    }
  }
  return (
    <Popup
      position='bottom'
      visible
      onClose={close}
      onMaskClick={close}
      bodyStyle={{ width: '100vw', height: '100%' }}
    >
      <NavBar onBack={close}>
        {currentCollection?.Name ?? 'Подборки'}
      </NavBar>
      {getContent()}
    </Popup>
  )
})
export const CollectionsPage: FC = observer(p => {
  const { reception: { menu } } = useStore()

  const go = useNavigate()
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
      bodyStyle={{ width: '100vw', height: '100%' }}
    >
      <NavBar onBack={close}>Подборки</NavBar>
      <section className={styles.categories_wrapper}>
        <div
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 80px)',
          }}
        >
          {menu.selections.map((selection, index) =>
            <div key={index}>
              <h2 onClick={() => { go('#collections/' + selection.VCode) }}>{selection.Name}</h2>
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
    </Popup>
  )
})

