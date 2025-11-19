import { CapsuleTabs, SearchBar, Skeleton, Space } from 'antd-mobile'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useDeviceType, useGoUTM, useNavigateBack, useStore } from '../../features/hooks'
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
import { GiftButton } from '../icons/GiftButton'
import { CloseOutline } from 'antd-mobile-icons'
import ToggleSelector from '../special/ToggleSelector'
import { showDishesTypes } from '../../stores/menu.store'

const CategoryPopup: FC = observer(function () {
  const [searchParams, setSearcParams] = useSearchParams()
  const go = useGoUTM()
  const { reception: { menu }, auth, cart } = useStore()
  const { categoryPopup, coursePopup } = menu

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
    setSelectedAttributes(new Set())
  }

  useEffect(() => {
    let searchTerm = searchParams.get("search")
    if (searchTerm && searchTerm.trim().length) {
      menu.dishSearcher.search(searchTerm)
      menu.searcher.open()
    } else {
      menu.dishSearcher.reset()
      menu.searcher.close()
    }
  }, [menu.loadMenu.state, menu.loadMenuBg.state])


  const navigateBack = useNavigateBack();
  const goBack = () => {
    navigateBack()
    setSelectedAttributes(new Set())
  };

  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(new Set())

  const toggleAttr = (id: string) =>
    setSelectedAttributes(prev => {
      // debugger
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })

  const coursesmenu = useMemo(() => {
    // сначала фильтруем по атрибутам
    return (currentCategory?.CourseList ?? []).filter(item => {
      if (selectedAttributes.size === 0) return true

      if (!item.Attributes) return false
      const itemAttributes = new Set(item.Attributes.split(',').map(attr => attr.trim()))

      // Проверяем, есть ли каждый выбранный атрибут у этого предмета  
      for (const attrId of Array.from(selectedAttributes)) {
        if (!itemAttributes.has(attrId)) {
          return false
        }
      }
      return true
    // затем фильтруем по наличию
    }).filter(item => {
      if(menu.showDishes === 'all') return true
      if(menu.showDishes === 'onlyInStock' && !item.NoResidue && item.EndingOcResidue > 0) return true
      if(menu.showDishes === 'onlyInStock' && item.NoResidue) return true
      return false
    })
  }, [currentCategory, selectedAttributes.size, menu.showDishes])

  const attributes = useMemo(() => {
    const courseItems = currentCategory?.CourseList ?? []
    const attributeIdsInMenu = new Set<string>()

    for (const item of courseItems) {
      if(!item.Attributes) continue
      const ids = item.Attributes.split(',').map(id => id.trim())
      ids.forEach(id => attributeIdsInMenu.add(id))
    }

    return menu.attributes.filter(attr => attributeIdsInMenu.has(attr.VCode))
  }, [currentCategory])

  const attrs = Array.from(selectedAttributes)

  const options = [{
    value: showDishesTypes.all,
    text: 'Все блюда',
  }, {
    value: showDishesTypes.onlyInStock,
    text: 'Только в наличии',
  }]
  const isMobile = useDeviceType() === 'mobile'
  return <AdaptivePopup
    visible={categoryPopup.show}
    onClose={goMain}
    bodyStyle={style.cat_popup}
    bodyClassName='categoryPopup'
    noBottomNavDesktop
  >
    {auth.floatingIconAuthForGift.show
      ? <GiftButton
        onClick={auth.bannerAuthForGift.open}
        style={{ zIndex: 2, position: 'absolute', right: '16px', bottom: '81px' }}
      />
      : null
    }
    <ItemModal popup={coursePopup} close={() => { goBack() }} />
    <AskAuthorize />
    <AskLocation />
    {
      isLoading
        ? <Preloader />
        : !currentCategory
          ? null
          : <Container className='p-0' fluid='md' style={{ overflowY: 'scroll', height: 'calc(100% - 65px)' }}>
            <div style={style.header}>
              <Space className='w-100' justify='between'>
                <BackIcon onClick={goMain} styles={{ marginLeft: 20 }} />  
                {!isMobile || (isMobile && !menu.searcher.show)
                  ? <ToggleSelector
                    isFit
                    options={options}
                    value={menu.showDishes}
                    onChange={menu.setShowDishes}
                    backgroundVar={'--tg-theme-bg-color'}
                    buttonBackgroundVar={'--tg-theme-bg-color'}
                    buttonActiveBackgroundVar={'--gurmag-accent-color'}
                    colorVar={'--громкий-текст'}
                    activeColorVar={'--gur-custom-button-text-color'}
                    styles={{
                      boxShadow: '0px 2px 7px 0px rgba(0, 0, 0, 0.19)'
                    }}
                  />
                  : null
                }
                
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
                  />
                }


              </Space>
              {isMobile && menu.searcher.show
                ? <div style={{ margin: "12px 20px 0 12px" }} className={menu.dishSearcher.isSearching ? 'mb-3' : ''}>
                    <ToggleSelector
                      isFit
                      options={options}
                      value={menu.showDishes}
                      onChange={menu.setShowDishes}
                      backgroundVar={'--tg-theme-bg-color'}
                      buttonBackgroundVar={'--tg-theme-bg-color'}
                      buttonActiveBackgroundVar={'--gurmag-accent-color'}
                      colorVar={'--громкий-текст'}
                      activeColorVar={'--gur-custom-button-text-color'}
                      styles={{
                        boxShadow: '0px 2px 7px 0px rgba(0, 0, 0, 0.19)'
                      }}
                    />
                </div>
                : null
              }
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
              {!attributes.length
                ? null
                : <CapsuleTabs
                  className='attr_capsules'
                  activeKey={attrs[attrs.length - 1]}
                  style={{ color: 'black' }}
                // onChange={toggleAttr}
                >
                  {attributes.map(atr => {
                    const isChecked = attrs.includes(atr.VCode)
                    const AtrName: FC = () => <div onClick={() => toggleAttr(atr.VCode)}>
                      {isChecked
                        ? <Space>
                          {atr.Name}
                          <CloseOutline />
                        </Space>
                        : atr.Name
                      }
                    </div>
                    return (
                      <CapsuleTabs.Tab
                        title={<AtrName />}
                        key={atr.VCode}
                        className={isChecked ? 'attr_capsule attr_capsule_checked' : 'attr_capsule'}
                      />
                    )
                  })}
                </CapsuleTabs>
              }
            </div>
            <div className={styles.courses_list}>
              {menu.dishSearcher.isSearching
                ? menu.dishSearcher.result
                  .filter(item => {
                    if(menu.showDishes === 'all') return true
                    if(menu.showDishes === 'onlyInStock' && !item.NoResidue && item.EndingOcResidue > 0) return true
                    if(menu.showDishes === 'onlyInStock' && item.NoResidue) return true
                    return false
                  })
                  .map((course) => {
                  const cic = cart.countDiscountForCouses(course)
                  return <CourseItemComponent
                    key={course.VCode}
                    course={course}
                    watchCourse={() => go('/menu/' + course.VCode)}
                    priceWithDiscount={cic.priceWithDiscount}
                    haveCampaign={Boolean(cic.campaign)}
                  />

                })
                : coursesmenu.filter((course1, index, arr) =>
                  arr.findIndex(course2 => (course2.VCode === course1.VCode)) === index
                ).map((course) => {
                  const cic = cart.countDiscountForCouses(course)
                  return <CourseItemComponent
                    key={course.VCode}
                    priceWithDiscount={cic.priceWithDiscount}
                    course={course}
                    watchCourse={() => go('/menu/' + course.VCode)}
                    haveCampaign={Boolean(cic.campaign)}
                  />
                })
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