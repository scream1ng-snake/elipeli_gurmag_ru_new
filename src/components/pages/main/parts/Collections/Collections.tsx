import { Image, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import config from '../../../../../features/config'
import { useStore } from '../../../../../features/hooks'
import styles from './Collections.module.css'
import { ImagePreloder, LoaderTitle } from './preloders'
import { useNavigate } from 'react-router-dom'

const Collections: FC = observer(() => {
  const { reception: { menu } } = useStore()

  const go = useNavigate()
  
  return <div className={styles.collections_wrapper}>
    {menu.loadMenu.state === 'COMPLETED'
      ? <h2 onClick={() => { go('/collections') }}>Подборки</h2>
      : <LoaderTitle />
    }
    <Space
      style={{
        overflowX: 'scroll',
        '--gap-horizontal': '-5px',
        width: '100%',
        padding: '0.5rem 0',
        scrollbarWidth: 'none'
      }}
    >
      {menu.loadMenu.state === 'COMPLETED'
        ? menu.selections.map((selection, index) =>
          <div key={index} className={styles.selection_cover_item}>
            <Image
              src={config.staticApi
                + "/api/v2/image/FileImage?fileId="
                + selection.Image
              }
              onClick={() => { go('collections/' + selection.VCode) }}
              fallback={<ImagePreloder />}
              placeholder={<ImagePreloder />}
              onContainerClick={() => { go('collections/' + selection.VCode) }}
              fit='cover'
              style={{
                width:140,
                height:90,
                objectFit: 'cover'
              }}
            />
            {/* <p>{selection.Name}</p> */}
          </div>
        )
        : new Array(3).fill(null).map((_, index) =>
          <div key={index} className={styles.selection_cover_item}>
            <ImagePreloder />
          </div>
        )
      }
    </Space>
  </div>
})

export default Collections