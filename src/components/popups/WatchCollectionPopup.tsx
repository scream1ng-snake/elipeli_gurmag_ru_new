import { Popup } from 'antd-mobile'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'
import { useStore } from '../../features/hooks'
import { toJS } from 'mobx'
import { Selection } from '../../stores/menu.store'
import Course from '../common/Course'

const WatchCollectionPopup: FC = observer(p => {
  const { reception: { menu } } = useStore()
  const currentCollection = toJS(menu.selectionPopup.content) as Selection

  return (
    <Popup
      position='bottom'
      visible={menu.selectionPopup.show}
      onClose={menu.selectionPopup.close}
      onMaskClick={menu.selectionPopup.close}
      bodyStyle={{ width: '100vw', height: '100%' }}
    >
      <h2>{currentCollection?.Name}</h2>
      <Course.List>
        {currentCollection?.CourseList.map(course =>
          <Course.Item
            key={course.VCode}
            course={course}
          />
        )}
      </Course.List>
    </Popup>
  )
})


export default WatchCollectionPopup