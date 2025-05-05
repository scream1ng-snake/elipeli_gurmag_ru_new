import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useDeviceType, useStore } from "../../../../../features/hooks";
import { getRandomItem } from "../../../../../features/helpers";
import { Image, Skeleton, Swiper } from "antd-mobile";
import config from "../../../../../features/config";


const BannerCarusel: FC = () => {
  const { user, reception: { menu } } = useStore()
  const device = useDeviceType()
  // const filteredCampaigns = user.info.allCampaign.filter(camp => 
  //   camp.image && camp.compresimage
  // )
  // const campaigns = getRandomItem(filteredCampaigns, 3)

  const isOne = user.hasHotCampaign.length === 1
  const imgStyle = {
    aspectRatio: isOne ? "" : '335/194',
    width: '100%',
    height: 'auto',
    borderRadius: 15
  }
  return <div>
    {user.hasHotCampaign.length
      ? <h2 className="mb-2 mt-1">Выгодные акции</h2>
      : null
    }
    <Swiper 
      className="pe-3 mb-1" 
      slideSize={device === 'mobile'
        ? isOne ? 100 : 80
        : 40
      }
    >
      {user.hasHotCampaign.map(camp =>
      // {filteredCampaigns.map(camp =>
        <Swiper.Item key={camp.VCode} className={isOne ? "" : "pe-3"}>
          <Image
            onContainerClick={() => menu.hotCampaignPopup.watch(camp)}
            src={config.staticApi
              + "/api/v2/image/FileImage?fileId="
              + camp.image
            }
            fallback={<Skeleton style={imgStyle} />}
            placeholder={<Skeleton style={imgStyle} animated />}
            style={imgStyle}
          />
        </Swiper.Item>
      )}
    </Swiper>
  </div>
}

export default observer(BannerCarusel)