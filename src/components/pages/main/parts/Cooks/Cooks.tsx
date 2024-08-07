import { Avatar, Ellipsis, Rate, Result, Skeleton, Space } from 'antd-mobile'
import { ClockCircleOutline } from 'antd-mobile-icons'
import { observer } from 'mobx-react-lite'
import { FC, useMemo, CSSProperties } from 'react'
import config from '../../../../../features/config'
import { useStore } from '../../../../../features/hooks'
import { Cook } from '../../../../../stores/employees.store'
import CookReviewPopup from '../../../../popups/CookReviewPopup'
import { Loader, LoaderTitle } from './preloders'
import { wrapper_styles, list_styles, wrapperStyle, avatarStyle, cookNameStyle } from './styles'

const Cooks: FC = observer(() => {
  const { reception: { employees, OrgForMenu, organizations } } = useStore()

  const organization = useMemo(
    () => organizations.find(o => o.Id === OrgForMenu),
    [OrgForMenu]
  )


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
    {employees.loadCooks.state === 'COMPLETED'
      ? <h2>Рады знакомству</h2>
      : <LoaderTitle />
    }
    <div style={list_styles}>
      {employees.loadCooks.state === 'COMPLETED'
        ? Content()
        : <Loader />
      }
    </div>
  </div>
})



const CookItem: FC<{ cook: Cook }> = observer(({ cook }) => {
  const { reception: { employees } } = useStore();

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