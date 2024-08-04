import { Image, Popup, Space } from 'antd-mobile'
import { FC, useState } from 'react'
import styles from './Stories.module.css'
import WatchStory from 'react-insta-stories';
import { Story } from 'react-insta-stories/dist/interfaces';
import { Optional } from '../../../../../features/helpers';
import { CloseOutline } from 'antd-mobile-icons';


const W100pxH100px = { height: '100%', width: '100%' }
const storyStyles = {
  width: '100vw',
  height: '100vh',
  objectFit: 'cover',
  margin: 0
}

const AllStories: StoryItem[] = [
  {
    coverTitle: 'История первая',
    coverUrl: 'https://avatars.mds.yandex.net/i?id=513d67839d2a92750fc5730686eb8752bda96ccd-12588502-images-thumbs&n=13',
    slides: [
      { url: 'https://avatars.mds.yandex.net/i?id=acda64723eebd567ca22ff7899a4ec8d-5220516-images-thumbs&n=13',},
      { url: 'https://avatars.mds.yandex.net/i?id=23894d011e325a85dc0593c675b64043aefe5824-5371098-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=cf603d081ed4d51832c469e88e2edb80a3f732fb-5226207-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=2d213b7f0b14aef651136451ae8a45d56089a8ca-12615441-images-thumbs&n=13' },
    ],
  },
  {
    coverTitle: 'История вторая',
    coverUrl: 'https://avatars.mds.yandex.net/i?id=d352b28086f99935ec46f06dfd880db362348a84-4550834-images-thumbs&n=13',
    slides: [
      { url: 'https://avatars.mds.yandex.net/i?id=acda64723eebd567ca22ff7899a4ec8d-5220516-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=23894d011e325a85dc0593c675b64043aefe5824-5371098-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=cf603d081ed4d51832c469e88e2edb80a3f732fb-5226207-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=2d213b7f0b14aef651136451ae8a45d56089a8ca-12615441-images-thumbs&n=13' },
    ]
  },
  {
    coverTitle: 'Третья сториз',
    coverUrl: 'https://avatars.mds.yandex.net/i?id=8668a82d600c2662d1adaad52719413925251793-12644240-images-thumbs&n=13',
    slides: [
      { url: 'https://avatars.mds.yandex.net/i?id=acda64723eebd567ca22ff7899a4ec8d-5220516-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=23894d011e325a85dc0593c675b64043aefe5824-5371098-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=cf603d081ed4d51832c469e88e2edb80a3f732fb-5226207-images-thumbs&n=13' },
      { url: 'https://avatars.mds.yandex.net/i?id=2d213b7f0b14aef651136451ae8a45d56089a8ca-12615441-images-thumbs&n=13' },
    ]
  },
]


const Stories: FC = () => {
  const [selectedStory, setSelectedStory] = useState<Optional<StoryItem>>(null)
  const closeStory = () => { setSelectedStory(null) }


  return <>
    {selectedStory
      ? <Popup 
        visible={!!selectedStory} 
        style={W100pxH100px}
        onClose={closeStory}
      >
        <div className={styles.closeBtn_relative}>
          <CloseOutline onClick={closeStory} className={styles.closeBtn_icon} />
        </div>
        <WatchStory
          storyStyles={storyStyles}
          onAllStoriesEnd={closeStory}
          stories={selectedStory.slides}
          defaultInterval={1500}
          width='100vw'
          height='100vh'
          
        />
      </Popup>
      : null
    }
    <Space
      style={{
        overflowX: 'scroll',
        '--gap-horizontal': '-5px',
        width: '100%',
        padding: '0.5rem 0'
      }}
    >
      {AllStories.map((story, index) =>
        <div key={index} className={styles.story_cover_item}>
          <Image
            onClick={() => { setSelectedStory(story) }}
            src={story.coverUrl}
            style={{
              width: '36vw',
              height: '150px',
              objectFit: 'cover'
            }}
          />
          <p>{story.coverTitle}</p>
        </div>
      )}
    </Space>
  </>
}

export default Stories


type StoryItem = {
  /** обложка для истории */
  coverUrl: string
  slides: Story[]
  /** заголовок обложки */
  coverTitle: string
}

// type Slide = {
//   type: 'video' | 'photo'
//   duration: number
//   src: string
//   markup: unknown
// }