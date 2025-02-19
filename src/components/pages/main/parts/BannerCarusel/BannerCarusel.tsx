import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useStore } from "../../../../../features/hooks";
import { getRandomItem } from "../../../../../features/helpers";
import { Image, Swiper } from "antd-mobile";
import config from "../../../../../features/config";


const BannerCarusel: FC = () => {
  const { user, reception: { menu }} = useStore()
  // const filteredCampaigns = user.info.allCampaign.filter(camp => 
  //   camp.image && camp.compresimage
  // )
  // const campaigns = getRandomItem(filteredCampaigns, 3)

  const imgStyle = {
    aspectRatio: '335/194',
    width: '100%',
    height: 'auto',
    borderRadius: 15
  }
  return <Swiper className="pe-3 mb-3" slideSize={80}>
    {user.hasHotCampaign.map(camp =>
      <Swiper.Item key={camp.VCode} className="pe-3">
        <Image
          onClick={() => menu.hotCampaignPopup.watch(camp)}
          src={config.staticApi
            + "/api/v2/image/FileImage?fileId="
            + camp.image
          }
          style={imgStyle}
        />
      </Swiper.Item>
    )}
  </Swiper>
}

export default observer(BannerCarusel)