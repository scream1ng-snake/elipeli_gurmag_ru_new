import { Image, Space } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import config from '../../../../../features/config'
import { useStore } from '../../../../../features/hooks'
import styles from './Collections.module.css'

const Collections: FC = observer(() => {
  const { reception: { menu } } = useStore()
  return <div className={styles.collections_wrapper}>
    <h2>Подборки</h2>
    <Space
      style={{
        overflowX: 'scroll',
        '--gap-horizontal': '-5px',
        width: '100%',
        padding: '0.5rem 0'
      }}
    >
      {menu.selections.map((selection, index) =>
        <div key={index} className={styles.selection_cover_item}>
          <Image
            src={config.apiURL
              + "/api/v2/image/FileImage?fileId="
              + selection.Image
            }
            onClick={() => { menu.selectionPopup.watch(selection) }}

            fit='cover'
            style={{
              width: '36vw',
              height: '100px',
              objectFit: 'cover'
            }}
          />
          <p>{selection.Name}</p>
        </div>
      )}
    </Space>
  </div>
})

export default Collections