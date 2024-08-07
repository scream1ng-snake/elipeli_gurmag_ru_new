import { Avatar, List, Popup, Rate, Skeleton } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import { FC } from 'react'
import { useStore } from '../../features/hooks'

/** отзывы на блюдо */
const CourseReviewPopup: FC = observer(function () {
  const { reception: { menu } } = useStore()
  const { courseReviewsPopup } = menu

  const isLoading = menu.loadCourseReviews.state === 'LOADING'
  const currentCouse = courseReviewsPopup.content
  const reviews = courseReviewsPopup.saved

  return <Popup
    visible={courseReviewsPopup.show}
    onClose={courseReviewsPopup.close}
    closeOnMaskClick
    bodyStyle={styles.review_popup}
  >
    {
      isLoading
        ? <Preloader />
        : !currentCouse
          ? null
          : <div style={styles.review_content}>
            <span>
              <Rate
                allowHalf
                readOnly
                count={1}
                defaultValue={1}
                style={{ '--star-size': '20px' }}
              />
              <span style={{ fontSize: '20px' }}>
                {Math.ceil(currentCouse.Quality * 10) / 10}
              </span>
            </span>
            <br />
            <br />

            <span style={{ margin: '0.5rem' }}>{currentCouse.Name}</span>
            <List header='Последние отзывы'>
              {reviews?.map((review, index) => {
                const splitedNum = review.Phone.split('')
                const last3nums = [...splitedNum].slice(8, 11)
                const first3nums = [...splitedNum].slice(1, 4)
                const countryCode = [...splitedNum].slice(0, 1)
                const maskedTel = [...countryCode, '-', ...first3nums, '-', '**', '-', '**', '-', ...last3nums]
                return (
                  <List.Item
                    key={index}
                    prefix={
                      <Avatar
                        src=''
                        style={styles.review_ava}
                        fit='cover'
                      />
                    }
                    description={
                      <div>
                        <p>{`${maskedTel.join('')} поставил ★${review.Rating}`}</p>
                      </div>
                    }
                  >
                    <span style={styles.review_box}>
                      <span>{review.FIO?.length ? review.FIO : 'Покупатель'}</span>
                      <span style={styles.review_date}>
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
})

const styles = {
  review_box: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  review_date: { 
    fontSize: '12px', 
    color: 'var(--тихий-текст)' 
  },
  review_popup: {
    borderTopLeftRadius: '13px',
    borderTopRightRadius: '13px',
    width: 'calc(100vw - 1rem)',
    padding: '1rem 0.5rem 0.5rem 0.5rem'
  },
  review_content: { 
    maxHeight: '65vh', 
    overflow: 'scroll' 
  },
  review_ava: {
    borderRadius: 20,
    width: '40px',
    height: '40px',
  }
}

const Preloader = () => <div>
  <Skeleton.Paragraph animated />
  <Skeleton.Paragraph animated />
  <Skeleton.Paragraph animated />
</div>

export default CourseReviewPopup;