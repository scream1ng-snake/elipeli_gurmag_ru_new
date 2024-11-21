import { CSSProperties, FC } from "react"
import { AllCampaignUser } from "../../../../stores/cart.store"
import { observer } from "mobx-react-lite"
import { useGoUTM } from "../../../../features/hooks"
import { Button, Image, Skeleton } from "antd-mobile"
import config from "../../../../features/config"

interface pops { actia: AllCampaignUser }
const Campaign: FC<pops> = observer(({ actia }) => {
  const go = useGoUTM()
  const styles: Record<string, CSSProperties> = {
    border: {
      border: '2px solid var(--adm-color-border)',
      borderRadius: 20,
      overflow: 'hidden',
      boxSizing: 'content-box',
      marginTop: 20,
      height: 'calc(100% - 24px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: "space-between",
    },
    img: {
      aspectRatio: '1147/409',
      width: '100%',
      height: 'auto',
    }
  }
  return (
    <div style={styles.border}>
      <div>
        <Image
          fallback={<Skeleton style={styles.img} animated />}
          placeholder={<Skeleton style={styles.img} animated />}
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + actia.compresimage
          }
          onContainerClick={() => go('/campaigns/' + actia.VCode)}
          style={styles.img}
          fit='cover'
        />
        <div
          style={{
            padding: '10px 19px 19px 19px',
            fontFamily: 'Nunito',
            fontSize: 19,
            fontWeight: 600,
            lineHeight: '25.92px',
            letterSpacing: '-0.05em',
            textAlign: 'left'
          }}
        >
          <p>{Prepare(actia.Name)}</p>
          <p
            style={{
              marginTop: 10,
              fontFamily: 'Roboto',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '18px',
              letterSpacing: '0.03em',
              textAlign: 'left',
              color: 'rgba(139, 141, 140, 1)',
              textIndent: '1rem'
            }}
          >

            {Prepare(actia.Description).split('\n').map((txt, index) => <p key={index}>{txt}</p>)}
          </p>

        </div>
      </div>
      <div
        style={{
          padding: '10px 19px 19px 19px',
          fontFamily: 'Nunito',
          fontSize: 19,
          fontWeight: 600,
          lineHeight: '25.92px',
          letterSpacing: '-0.05em',
          textAlign: 'left'
        }}
      >
        <Button
          style={{
            width: "100%",
            marginTop: 16,
            fontFamily: 'Roboto',
            fontSize: 14.5,
            fontWeight: 400,
            lineHeight: '16.99px',
            color: 'rgba(215, 133, 52, 1)',
            background: 'rgba(255, 238, 206, 1)',
            border: 'none',
            padding: '7px  15px',
          } as CSSProperties}
          shape='rounded'
          onClick={() => go('/campaigns/' + actia.VCode)}
        >
          Посмотреть
        </Button>
      </div>
    </div >
  )
})

const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''

export default Campaign