import { Image, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import config from '../../../../../features/config'
import { useStore } from '../../../../../features/hooks'
import styles from './Collections.module.css'
import { ImagePreloder, LoaderTitle } from './preloders'

const Collections: FC = observer(() => {
  const { reception: { menu } } = useStore()
  return <div className={styles.collections_wrapper}>
    {menu.loadMenu.state === 'COMPLETED'
      ? <h2>Подборки</h2>
      : <LoaderTitle />
    }
    <Space
      style={{
        overflowX: 'scroll',
        '--gap-horizontal': '-5px',
        width: '100%',
        padding: '0.5rem 0'
      }}
    >
      {menu.loadMenu.state === 'COMPLETED'
        ? menu.selections.map((selection, index) =>
          <div key={index} className={styles.selection_cover_item}>
            <Image
              src={config.apiURL
                + "/api/v2/image/FileImage?fileId="
                + selection.Image
              }
              onClick={() => { menu.selectionPopup.watch(selection) }}
              fallback={<ImagePreloder />}
              placeholder={<ImagePreloder />}
              fit='cover'
              style={{
                width: '36vw',
                height: '100px',
                objectFit: 'cover'
              }}
            />
            <p>{selection.Name}</p>
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