import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import styles from './Categories.module.css'
import { useStore, useTheme } from "../../../../../../features/hooks";
import { Divider, Image, Rate, Result, Skeleton, Space, Tag, Toast } from "antd-mobile";
import { AddOutline, CheckOutline, SmileOutline } from "antd-mobile-icons";
import { CourseItem } from "../../../../../../stores/menu.store";
import config from "../../../../../../features/config";

const Categories: FC = observer(function() {
  const { reception: { menu }} = useStore()
  const { categories, dishSearcher, loadMenu } = menu;

  if(loadMenu.state === 'COMPLETED') {
    return (
      <section className={styles.categories_wrapper}>
        {dishSearcher.isSearching 
          ? <div>
            {dishSearcher.result.length 
              ? <h2>{'Найдено ' + dishSearcher.result.length + ' блюд'}</h2>
              : <Result
                icon={<SmileOutline />}
                status='success'
                title='Сегодня такого блюда в меню нет((('
                description='В ближающее время блюдо появится в меню'
              />
            }
            {
              dishSearcher.result.length
                ? <div className={styles.courses_list}>
                    {dishSearcher.result.map((course, index) =>
                      <CourseItemComponent 
                        key={index}
                        course={course}
                      />
                    )}
                </div>
                : null
            }
            
          </div>
          : categories.map((category, index) =>
            <div key={index} id={String(category.VCode)}>
              <h2>{category.Name}</h2>
              <br />
              <div className={styles.courses_list}>
                {category.CourseList.map((course, index) =>
                  <CourseItemComponent 
                    key={`${category.Name}-${course.Name}-${index}`}
                    course={course}
                  />
                )}
              </div>
            </div>
          )
        }

      </section>
    )
  } else {
    const preloder = {
      title: { margin: '1rem' },
      image: { height: "114px", width: "100%" },
      name: { marginTop: '12px', height: "16px", width: "130px" }, 
      label: { width: "16px", height: "16px" },
      text: { width: "40px", height: "10px" },
      price: { width: "40px", height: "40px" },
    }
    return <>
      <Skeleton.Title style={preloder.title} animated />
      <section className={styles.categories_wrapper}>
        <div>
          <div className={styles.courses_list}>
            {new Array(2).fill(null).map((_, index) => 
              <div className={styles.course_item} key={index}>
                <Skeleton animated style={preloder.image}/>
                <div className={styles.item_bady}>
                  <Skeleton.Title style={preloder.name} />
                  <Space 
                    align='center' 
                    style={{'--gap': '3px', margin: '0.5rem 0' }}
                  >
                    <Skeleton animated style={preloder.label} />
                    <Skeleton animated style={preloder.text} />
                  </Space>

                  <div className={styles.price_cart}>
                    <div className={styles.keke}>
                      <Skeleton animated style={preloder.price} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  }
})

export default Categories


const iconStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center', 
  alignItems: 'center'
}
export const CourseItemComponent: FC<{ course: CourseItem }> = observer(({ course }) => { 
  const { reception: { menu }} = useStore();
  
  return(
    <div className={styles.course_item}>
      <Image 
        lazy
        src={`${config.apiURL}/api/v2/image/Material?vcode=${course.VCode}&compression=true`} 
        onClick={() => menu.coursePopup.watch(course)} 
        placeholder={<Skeleton style={{ width: '100%', height: '114px' }} animated/>}
        fit='cover'
        width="auto"
        height="114px"
        style={{
          "--height": "114px",
          "--width": "auto",
        }}
      />
      <CardBodyComponent course={course} />
    </div>
  )
})

const CardBodyComponent: FC<{ course: CourseItem }> = observer(({ course }) => {
  const { theme } = useTheme()
  const { reception: { menu }, cart } = useStore()
  function addToCart(e: any) {
    e.stopPropagation()
    cart.addCourseToCart(course)
    Toast.show({
      position: 'center', 
      content: 'Добавлено'
    })
  }
  return(
    <div className={styles.item_bady} style={{ position: 'relative' }}>
      {!course.NoResidue && course.EndingOcResidue
        ? <div 
          style={{
            position:'absolute',
            top: -9,
            left: 0,
            right: 0,
            borderRadius: 8,
            textAlign: 'center',
            padding: '0.1rem 0.3rem',
            background: 'var(--gurmag-accent-color)',
            fontSize: '14px',
            fontWeight: '700',
            color: 'white',
          }}
        >
          <p>{`сегодня осталось ${course.EndingOcResidue}`}</p>
        </div>
        : null
      }
      
      <h3 
        className={styles.title}
        onClick={() => menu.coursePopup.watch(course)}
      >
        <span>{course.Name + " "}</span>
        <span style={{ color: theme === 'dark' ? "#b3b3b3" : "#808080" }}>{course.Weigth}</span>
      </h3>
      <Space 
        align='center' 
        style={{'--gap': '3px', margin: '0.5rem 0' }}
      >
        <Rate count={1} value={1} style={{ '--star-size': '16px' }}/>
        <div>{Math.ceil(course.Quality * 10) / 10}</div>
        <div 
          style={{
            color:'var(--tg-theme-link-color)',
            fontSize: '10px', 
          }} 
          onClick={() => menu.courseReviewsPopup.watch(course)}
        >
          Смотреть отзывы
        </div>
      </Space>

      <div className={styles.price_cart}>
        <span>{`${course.Price} ₽`}</span>
        <div className={styles.keke}>
          {cart.isInCart(course)
            ? <>
              <Tag
                color='primary' 
                style={{ 
                  position: 'absolute',
                  top: '-5px', 
                  right: '-5px', 
                  lineHeight: '1',
                  fontSize: '12px', 
                  '--border-radius': '6px', 
                }}
              >
                {cart.findItem(course.VCode)?.quantity}
              </Tag>
              <CheckOutline style={iconStyle} onClick={addToCart} />
            </>
            : <AddOutline style={iconStyle} onClick={addToCart} />
          }
          
        </div>
      </div>
    </div>
  )
})