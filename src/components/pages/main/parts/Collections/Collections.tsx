import { Image, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC, useCallback } from 'react'
import config from '../../../../../features/config'
import { useGoUTM, useStore } from '../../../../../features/hooks'
import styles from './Collections.module.css'
import { ImagePreloder, LoaderTitle } from './preloders'

const Collections: FC = observer(() => {
  const { reception: { menu } } = useStore()

  const go = useGoUTM()

  // const watchAllCollections = useCallback(() => { go('/collections') }, [])

  if(menu.loadMenu.state === 'COMPLETED' && !menu.selections.length) return null
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
        padding: '0.5rem 0',
        scrollbarWidth: 'none'
      }}
    >
      {menu.loadMenu.state === 'COMPLETED'
        ? menu.selections.map((selection, index) => {
          const watchCollection = () => go('collections/' + selection.VCode)
          return <div key={index} className={styles.selection_cover_item}>
            <Image
              src={config.staticApi
                + "/api/v2/image/FileImage?fileId="
                + selection.Image
              }
              onClick={watchCollection}
              fallback={<ImagePreloder />}
              placeholder={<ImagePreloder />}
              onContainerClick={watchCollection}
              fit='cover'
              style={{
                width: 140,
                height: 90,
                objectFit: 'cover'
              }}
            />
          </div>
        }
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