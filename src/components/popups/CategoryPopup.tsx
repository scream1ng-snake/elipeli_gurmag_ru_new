import { CapsuleTabs, Popup, Skeleton } from 'antd-mobile'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { CSSProperties, FC, useCallback, useMemo } from 'react'
import { useStore } from '../../features/hooks'
import Container from 'react-bootstrap/Container'
import BackIcon from '../icons/Back'

import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import { BottomNavigation } from '../common/BottomNav/BottomNav'

const CategoryPopup: FC = observer(function () {
  const { reception: { menu } } = useStore()
  const { categoryPopup } = menu

  const isLoading = menu.loadMenu.state === 'LOADING'
  const currentCategory = useMemo(() => toJS(categoryPopup.content), [categoryPopup.content])

  const watchCategory = useCallback((vcode: string) => {
    const targetCategory = menu.categories.find(c => String(c.VCode) === vcode)
    if (targetCategory) categoryPopup.watch(targetCategory)
  }, [])

  return <Popup
    visible={categoryPopup.show}
    onClose={categoryPopup.close}
    closeOnMaskClick
    closeOnSwipe
    bodyStyle={style.cat_popup}
  >
    {
      isLoading
        ? <Preloader />
        : !currentCategory
          ? null
          : <Container className='p-0' fluid='md'>
            <div style={style.header}>
              <BackIcon onClick={categoryPopup.close} styles={{ marginLeft: 20 }} />
              <CapsuleTabs onChange={watchCategory} activeKey={currentCategory?.VCode.toString()}>
                {menu.categories.map((category) =>
                  <CapsuleTabs.Tab
                    className='header_capsule'
                    title={category.Name.replaceAll('_', ' ')}
                    key={category.VCode}
                  />
                )}
              </CapsuleTabs>
            </div>
            <div className={styles.courses_list}>
              {currentCategory?.CourseList.map((course) =>
                <CourseItemComponent
                  key={course.VCode}
                  course={course}
                />
              )}
            </div>
          </Container>
    }
    <BottomNavigation style={{ position: 'sticky', bottom:0, zIndex:100 }}/>
  </Popup>
})

const style: Record<string, CSSProperties> = {
  cat_popup: {
    width: '100vw',
    height: '100%',
    overflowY: 'scroll',
    fontFamily: 'Arial',
    fontSize: 13,
    fontWeight: 700,
    lineHeight: '14.95px',
    background: 'var(--tg-theme-secondary-bg-color)'

  },
  header: {
    position: 'sticky',
    zIndex: 100,
    top: 0,
    paddingTop: 20,
    background: 'var(--tg-theme-secondary-bg-color)',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: 'hidden'
  }
}

const Preloader = () => <div>
  <Skeleton.Paragraph animated />
  <Skeleton.Paragraph animated />
  <Skeleton.Paragraph animated />
</div>

export default CategoryPopup;