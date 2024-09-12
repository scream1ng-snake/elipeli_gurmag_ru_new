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
import BackIcon from '../icons/Back'



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
          <div
            style={{
              margin: '0 36px 16px 36px',
              fontSize: 16,
              fontWeight: 400,
              textAlign: 'left',
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
      <NavBar
        onBack={close}
        backIcon={<BackIcon />}
        style={{ height: 60, padding: '0 20px' }}
      >
        <p
          style={{
            fontSize: 31,
            fontWeight: 700,
            textAlign: 'left'
          }}
        >
          {currentCollection?.Name ?? 'Подборки'}
        </p>
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
      <NavBar
        onBack={close}
        backIcon={<BackIcon />}
        style={{ height: 60, padding: '0 20px' }}
      >
        <p
          style={{
            fontSize: 31,
            fontWeight: 700,
            textAlign: 'left'
          }}
        >
          Подборки
        </p>
      </NavBar>
      <section className={styles.categories_wrapper}>
        <div
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 80px)',
          }}
        >
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
    </Popup >
  )
})

