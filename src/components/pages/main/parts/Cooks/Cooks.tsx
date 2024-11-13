import { Space, Image, Rate } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC, CSSProperties } from 'react'
import config from '../../../../../features/config'
import { useStore } from '../../../../../features/hooks'
import { Cook } from '../../../../../stores/employees.store'
import CookReviewPopup from '../../../../popups/CookReviewPopup'
import { ImgPlaceholder, Loader, LoaderTitle } from './preloders'
import { wrapper_styles, list_styles, wrapperStyle, avatarStyle } from './styles'
const Cooks: FC = observer(() => {
  const { reception: { employees } } = useStore()
  const isLoadDone = employees.loadCooks.state === 'COMPLETED'
  return <div style={wrapper_styles}>
    <CookReviewPopup />
    {isLoadDone
      ? employees.cooks.length
        ? <h2>Magic family</h2>
        : null
      : <LoaderTitle />
    }
    <div style={list_styles}>
      {isLoadDone
        ? employees.cooks.map(cook =>
          <CookItem key={cook.UserId} cook={cook} />
        )
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
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: '-1rem',
            bottom: '-0.25rem',
          }}
        >
          <div style={{ position: 'relative' }}>
            <p
              style={{
                position: 'absolute',
                fontFamily: 'Roboto',
                fontSize: 12,
                fontWeight: 400,
                lineHeight: '14.06px',
                top:"calc(50% - 5px)",
                width:'100%',
                zIndex:100,
                textAlign:'center',
                color:'black'
              }}
            >
              {Math.ceil(cook.Rating * 10) / 10}
            </p>
            <Rate
              allowHalf
              readOnly
              count={1}
              defaultValue={cook.Rating}
              style={{ '--star-size': '42px' }}
            />
          </div>
        </div>

        <Image
          src={config.staticApi + '/api/v2/image/Cook?vcode=' + cook.UserId}
          style={avatarStyle as CSSProperties}
          fit='cover'
          placeholder={<ImgPlaceholder />}
          fallback={<ImgPlaceholder />}
        />
      </div>
      <span 
        style={{
          fontFamily: 'Roboto',
          fontSize: 11,
          fontWeight: 600,
          lineHeight: '12.89px',
          color:'var(--тихий-текст)'
        }}
      >
        {cook.FirstName}
      </span>
    </Space>
  )
})

export default Cooks