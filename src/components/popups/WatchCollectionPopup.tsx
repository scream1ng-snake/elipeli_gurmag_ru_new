import { NavBar, Popup, Image } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { useStore } from '../../features/hooks'
import { toJS } from 'mobx'
import { Selection } from '../../stores/menu.store'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { useNavigate } from 'react-router-dom'
import { Optional } from '../../features/helpers'

import config from '../../features/config'

const WatchCollectionPopup: FC = observer(p => {
  const { reception: { menu } } = useStore()

  const go = useNavigate()
  function close() {
    go('/')
    menu.selectionPopup.close()
  }


  const currentCollection = toJS(menu.selectionPopup.content) as Optional<Selection>
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
      // или смотрим все подборки
      return <section className={styles.categories_wrapper}>
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
    }
  }

  return (
    <Popup
      position='bottom'
      visible={menu.selectionPopup.show}
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


export default WatchCollectionPopup