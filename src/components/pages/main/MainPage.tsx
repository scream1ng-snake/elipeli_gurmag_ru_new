import { Avatar, Divider, Ellipsis, Image, List, Popup, Rate, Result, Skeleton, Space } from "antd-mobile"
import { ClockCircleOutline } from "antd-mobile-icons"
import { observer } from "mobx-react-lite"
import moment from "moment"
import { FC } from "react"
import config from "../../../features/config"
import { useStore, useTheme } from "../../../features/hooks"
import { Cook } from "../../../stores/employees.store"
import { CourseItem } from "../../../stores/menu.store"
import Wrapper from "../../layout/Wrapper"
import Collections from "./parts/Collections/Collections"
import ReceptionSwitcher from "./parts/ReceptionSwitcher/ReceptionSwitcher"
import Stories from "./parts/Stories/Stories"
import styles from './styles.module.css'

const MainPage: FC = observer(() => {
  const { reception, reception: { menu, employees } } = useStore()
  return <Wrapper>
    <ReceptionSwitcher />
    <EmptyUnderFixed height="85px" />
    <Stories />
    <Collections />


    {/* nedd refactoring !! */}

    {employees.loadCooks.state === 'COMPLETED'
      ? <>
        <Divider contentPosition="left" style={{ fontSize: '22px' }} >Рады знакомству</Divider>
        <div
          style={{
            margin: '0 0.5rem',
            width: 'calc(100% - 1rem)',
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'scroll',
            overflowY: 'hidden',
          }}
        >
          <Popup
            visible={employees.watchCockModal.show}
            onClose={() => employees.closeCookWatch()}
            closeOnMaskClick
            bodyStyle={{
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              padding: '1rem 0.5rem 0.5rem 0.5rem'
            }}
          >
            {
              employees.loadCookReviews.state === 'LOADING'
                ? <div>
                  <Skeleton.Paragraph animated />
                  <Skeleton.Paragraph animated />
                  <Skeleton.Paragraph animated />
                </div>
                : !employees.selectedCock
                  ? null
                  : <div style={{ maxHeight: '65vh', overflow: 'scroll' }}>
                    <span>
                      <Rate
                        allowHalf
                        readOnly
                        count={1}
                        defaultValue={1}
                        style={{ '--star-size': '20px' }}
                      />
                      {/* @ts-ignore */}
                      <span style={{ fontSize: '20px' }}>
                        {Math.ceil(employees.selectedCock?.Rating * 10) / 10}
                      </span>
                    </span>
                    <br />

                    <span style={{ margin: '0.5rem' }}>{employees.selectedCock.NameWork}</span>
                    <List header='Последние отзывы'>
                      {/* @ts-ignore */}
                      {mainPage.selectedCockReviews[0]?.map((review: CookReviews, index) => {
                        const splitedNum = review.Phone.split('')
                        const last3nums = [...splitedNum].slice(8, 11)
                        // const next2nums = [...splitedNum].slice(6, 8)
                        // const middle2nums = [...splitedNum].slice(4, 6)
                        const first3nums = [...splitedNum].slice(1, 4)
                        const countryCode = [...splitedNum].slice(0, 1)
                        const maskedTel = [...countryCode, '-', first3nums, '-', '**', '-', '**', '-', last3nums]
                        return (
                          <List.Item
                            key={index}
                            prefix={
                              <Avatar
                                src=''
                                style={{
                                  borderRadius: 20,
                                  width: '40px',
                                  height: '40px',
                                }}
                                fit='cover'
                              />
                            }
                            description={
                              <div>
                                <p>{maskedTel}</p>
                                <p>{`★${review.Rating} - ${review.Course}`}</p>
                              </div>
                            }
                          >
                            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{review.FIO?.length ? review.FIO : 'Покупатель'}</span>
                              <span style={{ fontSize: '12px', color: 'var(--тихий-текст)' }}>
                                {moment(review.Date).format('DD-MM-YYYY')}
                              </span>
                            </span>
                          </List.Item>
                        )
                      })}
                    </List>
                  </div>
            }
          </Popup>
          <Popup
            visible={menu.otziviModal.show}
            onClose={() => menu.closeWatchOtzivi()}
            closeOnMaskClick
            bodyStyle={{
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              padding: '1rem 0.5rem 0.5rem 0.5rem'
            }}
          >
            {
              menu.loadCourseReviews.state === 'LOADING'
                ? <div>
                  <Skeleton.Paragraph animated />
                  <Skeleton.Paragraph animated />
                  <Skeleton.Paragraph animated />
                </div>
                : !menu.selectedCourse
                  ? null
                  : <div style={{ maxHeight: '65vh', overflow: 'scroll' }}>
                    <span>
                      <Rate
                        allowHalf
                        readOnly
                        count={1}
                        defaultValue={1}
                        style={{ '--star-size': '20px' }}
                      />
                      {/* @ts-ignore */}
                      <span style={{ fontSize: '20px' }}>
                        {Math.ceil(menu.selectedCourse.Quality * 10) / 10}
                      </span>
                    </span>
                    <br />
                    <br />

                    <span style={{ margin: '0.5rem' }}>{menu.selectedCourse.Name}</span>
                    <List header='Последние отзывы'>
                      {/* @ts-ignore */}
                      {mainPage.selectedCourseReviews[0]?.map((review: CourseOtzyv, index) => {
                        const splitedNum = review.Phone.split('')
                        const last3nums = [...splitedNum].slice(8, 11)
                        // const next2nums = [...splitedNum].slice(6, 8)
                        // const middle2nums = [...splitedNum].slice(4, 6)
                        const first3nums = [...splitedNum].slice(1, 4)
                        const countryCode = [...splitedNum].slice(0, 1)
                        const maskedTel = [...countryCode, '-', ...first3nums, '-', '**', '-', '**', '-', ...last3nums]
                        return (
                          <List.Item
                            key={index}
                            prefix={
                              <Avatar
                                src=''
                                style={{
                                  borderRadius: 20,
                                  width: '40px',
                                  height: '40px',
                                }}
                                fit='cover'
                              />
                            }
                            description={
                              <div>
                                <p>{`${maskedTel.join('')} поставил ★${review.Rating}`}</p>
                              </div>
                            }
                          >
                            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{review.FIO?.length ? review.FIO : 'Покупатель'}</span>
                              <span style={{ fontSize: '12px', color: 'var(--тихий-текст)' }}>
                                {moment(review.Date).format('DD-MM-YYYY')}
                              </span>
                            </span>
                          </List.Item>
                        )
                      })}
                    </List>
                  </div>
            }
          </Popup>
          {!employees.cooks.length
            ? <Result
              style={{ width: '100%' }}
              icon={<ClockCircleOutline />}
              status='success'
              title='Упс'
              description={`Сегодня на ${reception.currentOrganizaion?.Name ?? "заброшенная точка"} никто не готовит((`}
            />
            : null
          }
          {employees.cooks.map(cook =>
            <CookItem key={cook.UserId} cook={cook} />
          )}
        </div>
      </>
      : <>
        <Skeleton animated style={{ marginTop: '1rem', marginLeft: '1rem', height: '18px', width: '150px' }} />
        <br />
        <div
          style={{
            margin: '0 0.5rem',
            width: 'calc(100% - 1rem)',
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'scroll',
            overflowY: 'hidden',
          }}
        >
          <Space
            style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
            direction="vertical"
            justify="center"
            align="center"
          >
            <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} />
          </Space>
          <Space
            style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
            direction="vertical"
            justify="center"
            align="center"
          >
            <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} />
          </Space>
          <Space
            style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
            direction="vertical"
            justify="center"
            align="center"
          >
            <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} />
          </Space>
          <Space
            style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
            direction="vertical"
            justify="center"
            align="center"
          >
            <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
            <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} />
          </Space>
        </div>
      </>
    }
    {menu.loadMenu.state === 'COMPLETED'
      ? !menu.popular?.length
        ? null
        : <>
          <Divider contentPosition="left" style={{ fontSize: '22px' }} >Популярные блюда</Divider>
          <section className='categories'>
            <div key='популярное' id='популярное'>
              <div className="courses_list">
                {menu.popular?.map(course =>
                  <CourseItemComponent
                    course={course}
                    key={course.VCode}
                  />
                )}
              </div>
            </div>
          </section>
        </>
      : <>
        <section key={3} className='categories'>
          <div>
            <Skeleton animated style={{ margin: '1rem', height: '18px', width: '150px' }} />
            <div className="courses_list">
              {new Array(2).fill(null).map((_, index) =>
                <div className="course_item" key={index}>
                  <Skeleton style={{ width: '100%' }} animated />
                  <div className='item_bady'>
                    <Skeleton.Title animated />
                    <Skeleton.Paragraph animated />
                    <Skeleton animated />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    }


  </Wrapper>
})

const EmptyUnderFixed: FC<{ height: string }> = props =>
  <div style={{ height: props.height }} />


const CookItem: FC<{ cook: Cook }> = observer(({ cook }) => {
  const { reception: { menu, employees } } = useStore();

  const wrapperStyle = {
    width: '33%',
    margin: '0 0.25rem',
    '--gap': '3px',
  }
  const avatarStyle = {
    width: '70px',
    height: '70px',
    borderRadius: '35px',
    objectFit: 'cover',
    border: '2px solid var(--tg-theme-text-color)'
  }
  const cookNameStyle = {
    color: 'var(--громкий-текст)',
    fontSize: '18px'
  }
  return (
    <Space
      style={wrapperStyle}
      direction="vertical"
      justify="center"
      align="center"
      key={cook.UserId}
      onClick={() => employees.watchCook(cook)}
    >
      <Avatar
        src={config.apiURL + '/api/v2/image/Cook?vcode=' + cook.UserId}
        style={avatarStyle as React.CSSProperties}
      />
      <span style={cookNameStyle}>{cook.FirstName}</span>
      <Ellipsis
        content={cook.NameWork}
        style={{
          color: 'var(--тихий-текст)',
          fontSize: '12px',
        }}
      />
      <Space align="center" style={{ '--gap': '3px' }}>
        <div style={{ fontSize: '20px' }} >{Math.ceil(cook.Rating * 10) / 10}</div>
        <Rate
          allowHalf
          readOnly
          count={1}
          defaultValue={cook.Rating}
          style={{ '--star-size': '10px' }}
        />
      </Space>
    </Space>
  )
})


const CourseItemComponent: React.FC<{ course: CourseItem }> = observer(({ course }) => {
  const { reception: { menu, employees }} = useStore();

  return (
    <div className="course_item">
      <Image
        lazy
        src={`${config.apiURL}/api/v2/image/Material?vcode=${course.VCode}&compression=true`}
        onClick={() => menu.watchCourse(course)}
        placeholder={<Skeleton style={{ width: '100%', height: '114px' }} animated />}
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
  const { reception: { menu }} = useStore()
  // function addToCart(e: Evt) {
  //   e.stopPropagation()
  //   cartStore.addCourseToCart(course)
  //   Toast.show({
  //     position: 'center', 
  //     content: 'Добавлено'
  //   })
  // }
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
        onClick={() => menu.watchCourse(course)}
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
          onClick={() => menu.watchOtzivi(course)}
        >
          Смотреть отзывы
        </div>
      </Space>

      <div className='price_cart'>
        <span>{`${course.Price} ₽`}</span>
        <div className="keke">
          
          
        </div>
      </div>
    </div>
  )
})
export default MainPage