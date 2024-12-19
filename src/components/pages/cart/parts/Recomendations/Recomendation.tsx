import { Button, Image, Space } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC } from "react"
import { useGoUTM, useStore } from "../../../../../features/hooks"
import config from "../../../../../features/config"
const styles: Record<string, CSSProperties> = {
  headText: {
    margin: '28px 14px 10px 14px',
    fontSize: 18
  }
}
const Recomendations: FC = observer(() => {
  const { reception: { menu } } = useStore()
  const go = useGoUTM()
  return <>
    <h3 style={styles.headText}>Рекомендуем</h3>
    <Space
      style={{
        background: 'var(--tg-theme-bg-color)',
        overflowX: 'scroll',
        '--gap-horizontal': '-7px',
        width: '100%',
        scrollbarWidth: 'none',
      }}
    >
      {menu.recomendations.map((recomendation, index) =>
        <Space key={index} direction='vertical' align='center' justify='center'>
          <Image
            src={config.staticApi
              + "/api/v2/image/FileImage?fileId="
              + recomendation.CompressImages?.[0]
            }
            style={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius:13
            }}
          />
          <span style={{ fontSize:12 }}>{recomendation.Name}</span>
          <Button 
            size='small' 
            color='primary' 
            shape='rounded'
            onClick={() => {}}
          >
            Добавить
          </Button>
          <Button 
            size='small' 
            color='primary' 
            shape='rounded' 
            fill='outline'
            onClick={() => { go(recomendation.Link) }}
          >
            {recomendation.LinkName}
          </Button>
        </Space>
      )
      }
    </Space>
  </>
})
export default Recomendations