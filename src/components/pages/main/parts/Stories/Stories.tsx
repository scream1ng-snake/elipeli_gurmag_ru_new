import { Button, Image, Popup, Skeleton, Space } from 'antd-mobile'
import { FC, useCallback, useState } from 'react'
import styles from './Stories.module.css'
import WatchStory from 'react-insta-stories';
import { Optional } from '../../../../../features/helpers';
import { CloseOutline } from 'antd-mobile-icons';
import { observer } from 'mobx-react-lite';
import { useGoUTM, useStore } from '../../../../../features/hooks';
import { WebHistoty } from '../../../../../stores/menu.store';
import config from '../../../../../features/config';


const W100pxH100px = { height: '100%', width: '100%' }
const storyStyles = {
  width: '100vw',
  height: '100vh',
  objectFit: 'cover',
  margin: 0
}


const Stories: FC = observer(() => {
  const go = useGoUTM()
  const { reception: { menu } } = useStore()
  const [selectedStory, setSelectedStory] = useState<Optional<WebHistoty>>(null)
  const closeStory = useCallback(() => { setSelectedStory(null) }, [])

  return <>
    {selectedStory
      ? <Popup
        visible={!!selectedStory}
        bodyStyle={W100pxH100px}
        onClose={closeStory}
      >
        <div className={styles.closeBtn_relative}>
          <CloseOutline onClick={closeStory} className={styles.closeBtn_icon} />
        </div>
        <WatchStory
          storyStyles={storyStyles}
          onAllStoriesEnd={closeStory}
          stories={selectedStory.listSlides.map(slide => ({
            url: config.staticApi
              + "/api/v2/image/FileImage?fileId="
              + slide.image,
            seeMore: slide.link
              ? () => null
              : undefined,
            seeMoreCollapsed: slide.link
              ? ({ toggleMore, action }) =>
                <Button
                  shape='rounded'
                  color='primary'
                  fill='outline'
                  onClick={() => {
                    const isExternal = slide.link?.includes('http')
                    isExternal
                      ? window.location.href = slide.link as string
                      : go(slide.link as string)
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 22,
                    left: 22,
                    right: 22,
                    padding: 10
                  }}
                >
                  Смотреть
                </Button>
              : undefined,
          }))}
          defaultInterval={3000}
          width='100%'
          height='100%'

        />
      </Popup>
      : null
    }
    <Space
      style={{
        background: 'var(--tg-theme-bg-color)',
        overflowX: 'scroll',
        '--gap-horizontal': '-7px',
        width: '100%',
        scrollbarWidth: 'none',
      }}
    >
      {menu.loadMenu.state === 'COMPLETED'
        ? menu.stories.map((story, index) =>
          <div key={index} className={styles.story_cover_item}>
            <Image
              onClick={() => { setSelectedStory(story) }}
              src={config.staticApi
                + "/api/v2/image/FileImage?fileId="
                + story.ImageFront
              }
              placeholder={<StoryImgPreloader />}
              fallback={<StoryImgPreloader />}
              style={{
                width: 89,
                height: 115,
                objectFit: 'cover'
              }}
            />
            <p>{story.NameHistory}</p>
          </div>
        )
        : new Array(4).fill(null).map((_, index) => <StoryImgPreloader key={index} />)
      }
    </Space>
  </>
})

const StoryImgPreloader: FC = () => <Skeleton
  animated
  style={{
    width: 89,
    height: 115,
    objectFit: 'cover'
  }}
  className={styles.story_cover_item}
/>

export default Stories