import { Avatar, Ellipsis, Rate, Result, Skeleton, Space } from 'antd-mobile'
import { ClockCircleOutline } from 'antd-mobile-icons'
import { observer } from 'mobx-react-lite'
import { FC, useMemo, CSSProperties } from 'react'
import config from '../../../../../features/config'
import { useStore } from '../../../../../features/hooks'
import { Cook } from '../../../../../stores/employees.store'
import CookReviewPopup from '../../../../popups/CookReviewPopup'

const Cooks: FC = observer(() => {
  const { reception: { employees, OrgForMenu, organizations } } = useStore()

  const organization = useMemo(
    () => organizations.find(o => o.Id === OrgForMenu),
    [OrgForMenu]
  )

  const list_styles: CSSProperties = {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'scroll',
    overflowY: 'hidden',
  }
  const wrapper_styles: CSSProperties = {
    padding: '0.5rem 0 0.5rem 0.5rem'
  }

  function Content() {
    return <>
      {!employees.cooks.length
        ? <Result
          style={{ width: '100%' }}
          icon={<ClockCircleOutline />}
          status='success'
          title='Упс'
          description={`Сегодня на ${organization?.Name ?? "заброшенная точка"} никто не готовит((`}
        />
        : null
      }
      {employees.cooks.map(cook =>
        <CookItem key={cook.UserId} cook={cook} />
      )}
    </>
  }
  return <div style={wrapper_styles}>
    <CookReviewPopup />
    <h2>Рады знакомству</h2>
    <div style={list_styles}>
      {employees.loadCooks.state === 'COMPLETED'
        ? Content()
        : <Loader />
      }
    </div>
  </div>
})


const Loader = () => <>
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


const CookItem: FC<{ cook: Cook }> = observer(({ cook }) => {
  const { reception: { employees } } = useStore();

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
      onClick={() => employees.watchCockPopup.watch(cook)}
    >
      <Avatar
        src={config.apiURL + '/api/v2/image/Cook?vcode=' + cook.UserId}
        style={avatarStyle as CSSProperties}
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

export default Cooks