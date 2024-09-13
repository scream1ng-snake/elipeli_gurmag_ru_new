import { CSSProperties, FC } from "react"
import { AllCampaignUser } from "../../../../stores/cart.store"
import { observer } from "mobx-react-lite"
import { useStore } from "../../../../features/hooks"
import { Button, Card, Ellipsis, Image, Skeleton } from "antd-mobile"
import { useNavigate } from "react-router-dom"
import config from "../../../../features/config"

interface pops { actia: AllCampaignUser }
const Campaign: FC<pops> = observer(({ actia }) => {
  const go = useNavigate()
  const styles: Record<string, CSSProperties> = {
    border: {
      border: '2px solid var(--adm-color-border)',
      borderRadius: 12,
      overflow: 'hidden',
      boxSizing: 'border-box',
      marginTop: 20
    },
    img: {
      height: "204px",
      width: 'auto'
    }
  }
  return (
    <div style={styles.border}>
      <Image
        className='action_img'
        fallback={<Skeleton style={styles.img} animated />}
        placeholder={<Skeleton style={styles.img} animated />}
        src={config.staticApi
          + '/api/v2/image/Disount?vcode='
          + actia.VCode
          + '&compression=true'
        }
        onContainerClick={() => go('/campaigns/' + actia.VCode)}
      />
      <Card title={Prepare(actia.Name)}>
        {Prepare(actia.Description)}
        <Button
          style={{ width:"100%", marginTop:16 }}
          color='warning'
          shape='rounded'
          onClick={() => go('/campaigns/' + actia.VCode)}
        >
          Посмотреть
        </Button>
      </Card>
    </div>
  )
})

const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''

export default Campaign