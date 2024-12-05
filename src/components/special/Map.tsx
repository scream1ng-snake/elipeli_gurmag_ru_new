import { FC, useEffect, useRef, useState } from 'react'
import Marker from '../../assets/marker.png'
import GreyMarker from '../../assets/grey_marker.png'
import { Optional, Undef } from '../../features/helpers'
import { observer } from 'mobx-react-lite'
import { Location } from '../../stores/reception.store'
import { useYMaps } from '@pbe/react-yandex-maps';

/** [долгота, широта] */
const center1 = [54.72572230097609, 55.947417612394574]
const center2 = [54.77072405355034, 56.038447129765]
const zoom1 = 12
const zoom2 = 11


var prevousMarker: Undef<ymaps.IGeoObject | ymaps.ObjectManager>
interface props {
  onSelect: (cordinates: Location) => void
  value: Optional<Location>
}
const ReactMap: FC<props> = p => {
  const mapRef = useRef(null)
  const ymaps = useYMaps(['Map', 'Placemark'])
  const [map, setMap] = useState<Optional<ymaps.Map>>(null)

  useEffect(() => {
    if (!ymaps || !mapRef?.current) return

    const map = new ymaps.Map(
      mapRef.current, 
      { center: center1, zoom: zoom1, controls: [] }, 
      {
        copyrightUaVisible: false,
        copyrightLogoVisible: false,
        copyrightProvidersVisible: false,
        suppressMapOpenBlock: true
      }
    )
    map.events.add('click', e => {
      const coords = e.get("coords")
      const lat = coords[0]
      const lon = coords[1]
      p.onSelect({ lat, lon })
    })
    setMap(map)
    return () => map?.destroy()  
  }, [ymaps])

  useEffect(() => {
    if(p.value?.lat && p.value?.lon) {
      const { lat, lon } = p.value
      if(ymaps && map) {
        map.setCenter([lat, lon])
        const marker = new ymaps.Placemark([lat, lon], {}, { 
          iconImageHref: Marker, 
          iconLayout: 'default#image',
          iconImageSize: [40, 40],
          iconOffset: [-20,0]
        })
        map.geoObjects.add(marker)
        if(prevousMarker) map.geoObjects.remove(prevousMarker)
        prevousMarker = marker
      }
    }
  }, [p.value?.lat, p.value?.lon, map])

  return <div ref={mapRef} style={fullscreen} />
}



type radioItem = { lat: number, lon: number, key: number }
interface radioProps {
  items: radioItem[]
  defaultSelected?: radioItem
  onSwitch: (r: radioItem | null) => void
}
const ReactMapRadio: FC<radioProps> = observer(p => {
  const [map, setMap] = useState<Optional<ymaps.Map>>(null)
  const mapRef = useRef(null)
  const ymaps = useYMaps(['Map', 'Placemark'])

  useEffect(() => {
    if (!ymaps || !mapRef?.current) return
    const map: ymaps.Map = new ymaps.Map(
      mapRef.current, 
      { center: center2, zoom: zoom2, controls: [] },
      {
        copyrightUaVisible: false,
        copyrightLogoVisible: false,
        copyrightProvidersVisible: false,
        suppressMapOpenBlock: true
      }
    )
    setMap(map)
    return () => map?.destroy()  
  }, [ymaps])

  useEffect(() => {
    if(!ymaps || !map) return
    map.geoObjects.removeAll()
    for (const poimt of p.items) {
      const { lat, lon } = poimt
      const marker = new ymaps.Placemark([lon,lat], {}, { 
        iconImageHref: p.defaultSelected?.key === poimt.key
          ? Marker
          : GreyMarker,
        iconLayout: 'default#image',
        iconImageSize: [40, 40],
        iconOffset: [-20,0]
      })
      marker.events.add('click', e => {
        p.onSwitch(poimt)
      })
      map.geoObjects.add(marker)
    }
  }, [p.defaultSelected?.key, map])
  return <div ref={mapRef} style={fullscreen} />
})

const fullscreen = { width: '100vw', height: '100%' }

const Maps = {
  Picker: ReactMap,
  RadioPicker: ReactMapRadio
}
export default Maps