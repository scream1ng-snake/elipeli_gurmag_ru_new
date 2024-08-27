import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import styles from './Categories.module.css'
import { useStore, useTheme } from "../../../../../../features/hooks";
import { Divider, Image, Rate, Result, Skeleton, Space, Tag, Toast } from "antd-mobile";
import { AddOutline, CheckOutline, SmileOutline } from "antd-mobile-icons";
import { CourseItem } from "../../../../../../stores/menu.store";
import config from "../../../../../../features/config";
import IconStar from '../../../../../../assets/icon_star.svg'
import ImageReviews from '../../../../../../assets/image_reviews.svg'
import CustomButton from '../../../../../special/CustomButton'

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
      label: { width: "16px", height: "16px" },
      text: { width: "40px", height: "10px" },
      
      title: { margin: '1rem' },
      image: { height: "134px", width: "100%" },
      count: { marginTop: '4.86px', marginBottom: '0.86px', width: "84px", height: "10px" },
      price: { marginTop: '2px', marginBottom: '1.5px', width: "42px", height: "14.5px" },
      name: { marginTop: '1.03px', marginBottom: '1.03px', height: "12px", width: "130px" },
      weight: { marginTop: '7.86px', marginBottom: '0.86px', height: "10px", width: "24px" },
      button: { height: "24px", width: "100%", borderRadius: '20px' },
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
                  <div
                    className={styles.item_bottom_wrapper}
                  >
                    <div
                      className={styles.item_bottom_content}
                    >
                      <div className={styles.count_text}>
                      <Skeleton animated style={preloder.count} />
                      </div>
                      <div className={styles.price_text}>
                        <Skeleton animated style={preloder.price} />
                      </div>
                      <h3
                        className={styles.title_text}
                      >
                        <Skeleton.Title style={preloder.name} />
                      </h3>
                      <div className={styles.weight_text}>
                        <Skeleton animated style={preloder.weight} />
                      </div>
                    </div>
                    <div style={{margin: '0px -4px'}}>
                      <Skeleton animated style={preloder.button} />
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
        placeholder={<Skeleton style={{ width: '100%', height: '134px' }} animated/>}
        fit='cover'
        width="auto"
        height="134px"
        style={{
          "--height": "134px",
          "--width": "auto",
        }}
      />
      <div className={styles.image_text}>
        {'Блюдо'}
      </div>
      <CardBodyComponent course={course} />
    </div>
  )
})

const CardBodyComponent: FC<{ course: CourseItem }> = observer(({ course }) => {
  const { theme } = useTheme()
  const { reception: { menu }, cart } = useStore()
  function addToCart(e: any) {
    e?.stopPropagation()
    cart.addCourseToCart(course)
    Toast.show({
      position: 'center', 
      content: 'Добавлено'
    })
  }
  return(
    <div className={styles.item_bady} style={{ position: 'relative' }}>
      <div 
        className={styles.item_top_wrapper}
      >
        <div className={styles.rating_wrapper}>
          <div 
            className={styles.rating}
            onClick={() => menu.courseReviewsPopup.watch(course)}
          >
            <Image
              src={IconStar}
              width={10}
              height={10}
              fit='contain'
            />
            <div className={styles.rating_text} >
              {Math.ceil(course.Quality * 10) / 10}
            </div>
          </div>
        </div>
        <div>
        <Image
          src={ImageReviews}
          width={44}
          height={35}
          fit='contain'
          onClick={() => menu.courseReviewsPopup.watch(course)}
        />
        </div>
      </div>
      <div 
        className={styles.item_bottom_wrapper}
      >
        <div 
          className={styles.item_bottom_content}
        >
          {!course.NoResidue && course.EndingOcResidue && course.EndingOcResidue > 0
            ? <div className={styles.count_text}>
              <p>{`В наличии ${course.EndingOcResidue} шт`}</p>
            </div>
            : null
          }
          <div className={styles.price_text}>
            <span>{`${course.Price} ₽`}</span>
          </div>
          <h3 
            className={styles.title_text}
            onClick={() => menu.coursePopup.watch(course)}
          >
            <span>{course.Name}</span>
          </h3>
          <div className={styles.weight_text}>
            <span>{course.Weigth}</span>
          </div>
        </div>
        <div style={{margin: '0px -4px'}}>
          <CustomButton
            text={cart.isInCart(course) ? ('' + cart.findItem(course.VCode)?.quantity) : '+'}
            onClick={addToCart}
            height={'24px'}
            maxWidth={'auto'}
            marginTop={'0px'}
            marginBottom={'0px'}
            marginHorizontal={'0px'}
            paddingHorizontal={'0px'}
            fontWeight={'400'}
            fontSize={cart.isInCart(course) ? '14.5px' : '18.5px'}
            backgroundVar={'--gur-card-button-bg-color'}
            appendImage={null}
          />
        </div>
      </div>

      {/* {!course.NoResidue && course.EndingOcResidue
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
      } */}

      {/* <h3 
        className={styles.title}
        onClick={() => menu.coursePopup.watch(course)}
      >
        <span>{course.Name + " "}</span>
        <span style={{ color: theme === 'dark' ? "#b3b3b3" : "#808080" }}>{course.Weigth}</span>
      </h3> */}

      {/* <Space 
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
      </Space> */}

      {/* <div className={styles.price_cart}>
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
      </div> */}


    </div>
  )
})