import { Button, Image } from "antd-mobile"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback, useEffect, useMemo, useState } from "react"
import { useGoUTM, useStore } from "../../features/hooks"
import { toJS } from "mobx"
import config from "../../features/config"
import { AllCampaignUser } from "../../stores/cart.store"
import { ItemModal } from "./Course"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import AdaptivePopup from "../common/Popup/Popup"

const CampaignPopup: FC = observer(() => {
  const { user: { campaignPopup }, reception: { menu }} = useStore()
  const go = useGoUTM()
  const close = useCallback(function () {
    campaignPopup.close()
    go('/campaigns')
  }, [])
  const campaign = useMemo(
    () => toJS(campaignPopup.content) as AllCampaignUser,
    [campaignPopup.content]
  )


  return <AdaptivePopup
    visible={campaignPopup.show}
    noBottomNav
    noCloseBtn
    bodyStyle={{
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      padding: '40px 20px 20px 20px',
      width: 'calc(100%)',
      maxHeight: 'calc(100%)',
      overflowY: 'scroll',
      fontSize: 18,
      lineHeight: 1.5,
    }}
    onClose={close}
  >
    <ItemModal />
    <Row>
      <Col xs={12} sm={12} md={6}>
        <Image
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + campaign?.image
          }
          style={{ borderRadius: 20 }}
        />
      </Col>
      <Col>
        {campaign &&
          <MyBadge
            endtime={campaign.endtime}
            begintime={campaign.begintime}
            EndDate={campaign.EndDate}
            BeginDate={campaign.BeginDate}
          />
        }
        <p
          style={{
            marginTop: 6,
            fontFamily: 'Roboto',
            fontSize: '21px',
            fontWeight: 700,
            lineHeight: '24px',
            textAlign: 'left',
          }}
        >
          {Prepare(campaign?.Name)}
        </p>
        <div
          style={{
            marginTop: 8,
            fontFamily: 'Nunito',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '19px',
            textAlign: 'left',
            color: 'rgba(157, 159, 158, 1)',
            textIndent: '1rem'
          }}
        >
          {Prepare(campaign?.Description).split('\n').map((txt, index) => <p key={index}>{txt}</p>)}
        </div>
        <Button
          shape="rounded"
          style={{
            width: '100%',
            marginTop: 20,
            background: 'rgba(254, 238, 205, 1)',
            color: 'rgba(0, 0, 0, 1)',
            fontFamily: 'Roboto',
            fontSize: 16.5,
            fontWeight: 600,
            lineHeight: '16.99px',
            border: 'none',
            padding: '12px 15px'
          }}
          onClick={close}
        >
          Закрыть
        </Button>
        <Button
          shape="rounded"
          style={{
            width: '100%',
            marginTop: 11,
            background: 'rgba(247, 187, 15, 1)',
            color: 'rgba(0, 0, 0, 1)',
            fontFamily: 'Roboto',
            fontSize: 16.5,
            fontWeight: 600,
            lineHeight: '16.99px',
            border: 'none',
            padding: '12px 15px'
          }}
          onClick={() => {
            campaignPopup.close()
            go('/categories/' + menu.categories[0].VCode)
          }}
        >
          За покупками
        </Button>
      </Col>
    </Row>
  </AdaptivePopup>
})


type Props = {
  begintime: string,
  endtime: string,
  BeginDate: string,
  EndDate: string,
  style?: CSSProperties
}
export const MyBadge: FC<Props> = props => {
  const { endtime } = props
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date().getTime();
    const end = new Date(endtime).getTime();
    return Math.max(0, end - now);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date()
      const end = new Date(endtime.replace("Z", ""))
      end.setFullYear(today.getFullYear())
      end.setMonth(today.getMonth())
      end.setDate(today.getDate())
      
      const diff = Math.max(0, end.getTime() - Date.now());
      setTimeLeft(diff);
    }, 500);

    return () => clearInterval(interval);
  }, [endtime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };
  return <div style={{ marginTop: 9 }}>
    <span
      style={{
        background: 'rgba(0, 99, 65, 1)',
        color: 'white',
        borderRadius: 100,
        padding: '3px 10px',
        fontFamily: 'Arial',
        fontWeight: '400',
        fontSize: 13,
        ...props.style
      }}
    >
      Осталось {formatTime(timeLeft)}
    </span>
  </div>
}

const Prepare = (str?: string) => str?.replace(/ *\{[^}]*\} */g, "") || ''
export default CampaignPopup