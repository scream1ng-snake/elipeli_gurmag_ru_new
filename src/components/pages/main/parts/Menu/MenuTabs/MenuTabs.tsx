import { Skeleton } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import { useStore } from "../../../../../../features/hooks"
import './MenuTabs.css'

export const MenuTabs: FC = observer(() => {
  const { reception: { menu }, auth } = useStore()
  const { categories, dishSearcher, visibleCategory, setVisibleCategory } = menu

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    function listener(e: Event) {
      // проверяем позиции всех блоков категорий,
      // чтобы найти ту, которая сейчас видна на 
      // экране
      categories.forEach((category) => {
        const el = document.getElementById(String(category.VCode));
        const cordinates = el?.getBoundingClientRect();

        if (cordinates) {
          // Если категория находится в видимой области
          if (cordinates.top < 200 && Math.abs(cordinates.top) + 200 < Number(el?.offsetHeight)) {
            // делаем ее активной
            if (visibleCategory !== String(category.VCode)) {
              setVisibleCategory(String(category.VCode))
            }
          }
        }
      })
      // затем
      // по достижении какой-то кординаты
      // навбар становится фиксированным 
      // и всегда находится вверху окна
      const target = document.body.getElementsByClassName('filter_list')[0];
      const height = target?.clientHeight;
      const targetRelTop = target?.getBoundingClientRect().top;
      const bodyRelTop = document.body.getBoundingClientRect().top;
      
      window.scrollY > targetRelTop - bodyRelTop + height
        ? setIsScrolled(true)
        : setIsScrolled(false)
    }

    window.addEventListener('scroll', listener)
    return () => window.removeEventListener('scroll', listener)
  }, [visibleCategory, categories.length])


  if(dishSearcher.isSearching) {
    return null
  } else {
    return (
      <>
        <section className='filter page_filter'>
          <ul className="filter_list">
            {menu.loadMenu.state === 'COMPLETED'
              ? categories.map((category, index) => {
                const isActive = visibleCategory === String(category.VCode);
    
                return (
                  <li
                    className={`filter_item ${isActive ? 'active' : ''}`}
                    key={`filter_item_${index}`}
                    onClick={() => NavigateTo(String(category.VCode))}
                  >
                    {category.Name}
                  </li>
                )
              })
              : new Array(8).fill(null).map((_, index)=> 
                <Skeleton 
                  key={index}
                  animated
                  style={{
                    width: `${Math.random() * (150 - 70) + 70}px`,
                    height: "35px", 
                    borderRadius: "24px",
                    marginBottom: "8px",
                    marginRight: "8px",
                  }} 
                />
              )
            }
          </ul>
        </section>
        {!isScrolled
          ? null
          : (
            <section className='filter page_filter overlayed'>
              <ul className="filter_list">
  
                {categories.map((category, index) => {
                  const isActive = visibleCategory === String(category.VCode);
  
                  return (
                    <li
                      className={`filter_item ${isActive ? 'active' : ''}`}
                      key={`fixed_filter_item_${index}`}
                      onClick={() => NavigateTo(String(category.VCode))}
                    >
                      {category.Name}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        }
      </>
    )
  }
})

function NavigateTo(categoryID: string) {
  // находим относительные кординаты  
  // от видимой области экрана 
  // для нужного div 
  const el = document
    .getElementById(categoryID)
    ?.getBoundingClientRect(),
    body = document.body.getBoundingClientRect()

  // высчитываем абсолютные кординаты 
  // и скроллим окно до 
  // нужного места
  // по этим кординатам
  if (el && body) {
    // смещение по высоте, которое надо добавить 
    // из-за фиксированного меню
    let FILTERBAR_OFFSET = 120

    window.scrollTo({
      top: (el.top - body.top) - FILTERBAR_OFFSET,
      behavior: 'auto'
    })
  }
}