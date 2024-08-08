import { FC } from 'react';
import './Categories.css';
import { observer } from 'mobx-react-lite';
import { Avatar, Divider, Image, List, Popup, Rate, Result, Skeleton, Space, Tag, Toast } from 'antd-mobile';
import { AddOutline, CheckOutline, SmileOutline } from 'antd-mobile-icons';
import moment from 'moment';
import { useStore, useTheme } from '../../../../../features/hooks';
import CourseReviewPopup from '../../../../popups/CourseReviewPopup.tsx';
import { CourseItem } from '../../../../../stores/menu.store';
import config from '../../../../../features/config';


const Categories: FC = observer(() => {
  const { reception: { menu }} = useStore();
  const { categories, dishSearcher, loadMenu } = menu;

  if(loadMenu.state === 'COMPLETED') {
    return (
      <section className='categories'>
        <CourseReviewPopup />
        {dishSearcher.isSearching 
          ? <div key='результаты-поиска' id='searching_result'>
            {dishSearcher.result.length 
              ? <Divider 
                  contentPosition='left'
                  style={{fontSize: '22px'}} 
                >
                    {`Найдено ${dishSearcher.result.length} блюд`}
                </Divider>
              : <Result
                icon={<SmileOutline />}
                status='success'
                title='Сегодня такого блюда в меню нет((('
                description='В ближающее время блюдо появится в меню'
              />
            }
            {
              dishSearcher.result.length
                ? <div className="courses_list">
                    {dishSearcher.result.map((course, index) =>
                      <CourseItemComponent 
                        key={`popular-${course.Name}-${index}`}
                        course={course}
                      />
                    )}
                </div>
                : null
            }
            
          </div>
          : categories.map((category, index) =>
            <div key={category.VCode + '-' + index} id={String(category.VCode)}>
              <h2 style={{ margin: '0.5rem 1 rem' }}>{category.Name}</h2>
              <div className="courses_list">
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
    return <>
      <Skeleton.Title style={{margin: '1rem'}} animated />
      <section className='categories'>
        <div>
          <div className="courses_list">
            {new Array(2).fill(null).map((_, index) => 
              <div className="course_item" key={index}>
                <Skeleton animated style={{ height: "114px", width: "100%" }}/>
                <div className='item_bady'>
                  <Skeleton.Title style={{ marginTop: '12px', height: "16px", width: "130px" }} />
                  <Space 
                    align='center' 
                    style={{'--gap': '3px', margin: '0.5rem 0' }}
                  >
                    <Skeleton animated style={{ width: "16px", height: "16px" }} />
                    <Skeleton animated style={{ width: "40px", height: "10px" }} />
                  </Space>

                  <div className='price_cart'>
                    <div className="keke">
                      <Skeleton animated style={{ width: "40px", height: "40px" }} />
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


const iconStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center', 
  alignItems: 'center',
  fontSize: 18
}
type Evt = React.MouseEvent<HTMLSpanElement, MouseEvent>
export const CourseItemComponent: React.FC<{ course: CourseItem }> = observer(({ course }) => { 
  const { reception: { menu }} = useStore();
  
  return(
    <div className="course_item">
      <Image 
        lazy
        src={`${config.apiURL}/api/v2/image/Material?vcode=${course.VCode}&compression=true`} 
        // onClick={() => mainPage.watchCourse(course)} 
        // fallback={<img src={NoImageSmall} style={{objectFit: 'cover', width: '100%', height: '114px'}} onClick={() => mainPage.watchCourse(course)} />}
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

const CardBodyComponent: React.FC<{ course: CourseItem }> = observer(({ course }) => {
  const { theme } = useTheme()
  const { reception: { menu }, cart: cartStore } = useStore()
  function addToCart(e: any) {
    e.stopPropagation()
    cartStore.addCourseToCart(course)
    Toast.show({
      position: 'center', 
      content: 'Добавлено'
    })
  }
  return(
    <div className='item_bady' style={{ position: 'relative' }}>
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
        className='title'
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

      <div className='price_cart'>
        <span>{`${course.Price} ₽`}</span>
        <div className="keke">
          {cartStore.isInCart(course)
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
                {cartStore.findItem(course.VCode)?.quantity}
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

export default Categories