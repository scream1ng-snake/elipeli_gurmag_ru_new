import { CapsuleTabs, SearchBar, Skeleton, Space } from 'antd-mobile'
import { toJS, when } from 'mobx'
import { observer } from 'mobx-react-lite'
import { CSSProperties, FC, useCallback, useEffect, useMemo } from 'react'
import { useGoUTM, useStore } from '../../features/hooks'
import Container from 'react-bootstrap/Container'
import BackIcon, { SearchIcon } from '../icons/Back'

import styles from '../pages/main/parts/Menu/Categories/Categories.module.css'
import { CourseItemComponent } from '../pages/main/parts/Menu/Categories/Categories'
import AskAuthorize from './AskAuthorize'
import AskLocation from './AskLocation'
import { ItemModal } from './Course'
import AdaptivePopup from '../common/Popup/Popup'
import _ from 'lodash'
import { useSearchParams } from 'react-router-dom'

const CategoryPopup: FC = observer(function () {
  const [searchParams, setSearcParams] = useSearchParams()
  const go = useGoUTM()
  const { reception: { menu } } = useStore()
  const { categoryPopup } = menu

  const isLoading = menu.loadMenu.state === 'LOADING'
  const currentCategory = useMemo(
    () => {
      const targetCategory = menu.categories.find(c => c.VCode === toJS(categoryPopup.content)?.VCode)
      return targetCategory
    },
    [categoryPopup.content, menu.categories.length]
  )

  const watchCategory = useCallback((vcode: string) => {
    const targetCategory = menu.categories.find(c => String(c.VCode) === vcode)
    if (targetCategory) {
      categoryPopup.watch(targetCategory)
      go('/categories/' + vcode)
    }
  }, [menu.categories.length])

  const goMain = () => {
    go('/')
    categoryPopup.close()
    menu.dishSearcher.reset()
    menu.searcher.close()
  }

  useEffect(() => {
    let searchTerm = searchParams.get("search")
    if (searchTerm && searchTerm.trim().length) {
      menu.dishSearcher.search(searchTerm)
      menu.searcher.open()
    } else {
      setSearcParams({})
    }
  }, [menu.loadMenu.state, menu.loadMenuBg.state])


  return <AdaptivePopup
    visible={categoryPopup.show}
    onClose={goMain}
    bodyStyle={style.cat_popup}
    bodyClassName='categoryPopup'
    noBottomNavDesktop
  >
    <ItemModal close={() => { go('/') }} />
    <AskAuthorize />
    <AskLocation />
    {
      isLoading
        ? <Preloader />
        : !currentCategory
          ? null
          : <Container className='p-0' fluid='md'>
            <div style={style.header}>
              <Space className='w-100' justify='between'>
                <BackIcon onClick={goMain} styles={{ marginLeft: 20 }} />
                {!menu.searcher.show
                  ? <SearchIcon
                    styles={{ marginRight: 18 }}
                    onClick={menu.searcher.open}
                  />
                  : <SearchBar
                    style={{
                      "--background": 'var(--tg-theme-bg-color)',
                      boxShadow: 'rgba(0, 0, 0, 0.3) 0 0 5px 0',
                      borderRadius: 25,
                      background: 'var(--tg-theme-bg-color)',
                      overflow: 'hidden',
                      marginRight: 18,
                      "--height": '35px'
                    }}
                    onChange={menu.dishSearcher.search}
                    value={menu.dishSearcher.searchTerm}
                    cancelText='×'
                    placeholder='Поиск'
                    onCancel={() => {
                      menu.dishSearcher.reset()
                      menu.searcher.close()
                    }}
                    showCancelButton={() => true}
                    className={menu.dishSearcher.isSearching ? 'mb-3' : ''}
                  />
                }


              </Space>
              {menu.dishSearcher.isSearching
                ? null
                : <CapsuleTabs onChange={watchCategory} activeKey={currentCategory?.VCode.toString()}>
                  {menu.categories.map((category) =>
                    <CapsuleTabs.Tab
                      className='header_capsule'
                      title={category.Name.replaceAll('_', ' ')}
                      key={category.VCode}
                    />
                  )}
                </CapsuleTabs>
              }

            </div>
            <div className={styles.courses_list}>
              {menu.dishSearcher.isSearching
                ? menu.dishSearcher.result.map((course) =>
                  <CourseItemComponent
                    key={course.VCode}
                    course={course}
                  />
                )
                : currentCategory?.CourseList.filter((course1, index, arr) =>
                  arr.findIndex(course2 => (course2.VCode === course1.VCode)) === index
                ).map((course) =>
                  <CourseItemComponent
                    key={course.VCode}
                    course={course}
                  />
                )
              }
            </div>
          </Container>
    }
  </AdaptivePopup>
})

const style: Record<string, CSSProperties> = {
  cat_popup: {
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