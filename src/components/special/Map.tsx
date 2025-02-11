import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Marker from '../../assets/marker.png'
import GreyMarker from '../../assets/grey_marker.png'
import { Optional, toCamelCaseKeys, Undef } from '../../features/helpers'
import { observer } from 'mobx-react-lite'
import { useYMaps } from '@pbe/react-yandex-maps';
import { GeoJsonFeature, Location } from '../../stores/location.store'
import { toJS } from 'mobx'

/** [долгота, широта] */
const center1 = [54.72572230097609, 55.947417612394574]
const center2 = [54.77072405355034, 56.038447129765]
const zoom1 = 12
const zoom2 = 11

var prevousMarker: Undef<ymaps.IGeoObject | ymaps.ObjectManager>
interface props {
  onSelect: (cordinates: Location) => void
  value: Optional<Location>
  features: GeoJsonFeature[] | null | undefined
  resizeSignal?: boolean
}
const ReactMap: FC<props> = p => {
  const mapRef = useRef(null)
  const ymaps = useYMaps(['Map', 'Placemark', 'Polygon'])
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
    if (!ymaps || !mapRef?.current) return
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
        for (let i = map.geoObjects.getLength() - 1; i >= 0; i--) {  
          const geoObject = map.geoObjects.get(i);  
          
          if (geoObject instanceof ymaps.Placemark) {  
            map.geoObjects.remove(geoObject)
          }  
        }  
        map.geoObjects.add(marker)
        prevousMarker = marker
      }
    } else {
      if(ymaps && map) {
        if(prevousMarker) {
          for (let i = map.geoObjects.getLength() - 1; i >= 0; i--) {  
            const geoObject = map.geoObjects.get(i);  
            
            if (geoObject instanceof ymaps.Placemark) {  
              map.geoObjects.remove(geoObject)
            }  
          }  
        }
      }
    }
    map?.container.fitToViewport()
  }, [p.value?.lat, p.value?.lon, map])

  useLayoutEffect(() => {
    drawPolygons(p.features, ymaps, map, mapRef, p.onSelect)
  }, [p.features, p.features?.length, map, ymaps])

  useLayoutEffect(() => {
    map?.container.fitToViewport()
  }, [p.resizeSignal])

  return <div ref={mapRef} style={fullscreen} />
}



type radioItem = { lat: number, lon: number, Id: number }
interface radioProps {
  items: radioItem[]
  defaultSelected?: radioItem
  onSwitch: (r: radioItem | null) => void
  features: GeoJsonFeature[] | undefined | null
}
const ReactMapRadio: FC<radioProps> = observer(p => {
  const [map, setMap] = useState<Optional<ymaps.Map>>(null)
  const mapRef = useRef(null)
  const ymaps = useYMaps(['Map', 'Placemark', 'Polygon'])

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
    for (let i = map.geoObjects.getLength() - 1; i >= 0; i--) {  
      const geoObject = map.geoObjects.get(i);  
      
      if (geoObject instanceof ymaps.Placemark) {  
        map.geoObjects.remove(geoObject)
      }  
    }  
    
    for (const poimt of p.items) {
      const { lat, lon } = poimt
      const marker = new ymaps.Placemark([lat,lon], {}, { 
        iconImageHref: p.defaultSelected?.Id === poimt.Id
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
      map?.container.fitToViewport()
    }
  }, [p.defaultSelected?.Id, map])

  useLayoutEffect(() => {
    drawPolygons(p.features, ymaps, map, mapRef)
  }, [p.features, p.features?.length, map, ymaps])

  return <div ref={mapRef} style={fullscreen} />
})

const fullscreen = { width: '100%', height: '100%' }

const Maps = {
  Picker: ReactMap,
  RadioPicker: ReactMapRadio
}


function drawPolygons(
  features: GeoJsonFeature[] | undefined | null, 
  ymaps: ReturnType<typeof useYMaps>,
  map: ymaps.Map | null,
  mapRef: React.MutableRefObject<null>,
  onPolygonClick?: (coords: { lat: number, lon: number }) => void
) {
  if(!ymaps) return
  if(!map) return

  for (let i = map.geoObjects.getLength() - 1; i >= 0; i--) {  
    const geoObject = map.geoObjects.get(i);  
    
    if (geoObject instanceof ymaps.Polygon) {  
      map.geoObjects.remove(geoObject)
    }  
  }  
  if(features && features.length) {
    const polygonFeatures = features.filter(feature => 
      feature.geometry.type === 'Polygon'
    )
    for (const polygonFeature of polygonFeatures) {
      const coordinates = toJS(toJS(polygonFeature).geometry.coordinates as number[][][]).map(points => 
        toJS(points).map(coords => 
          toJS(coords).reverse()
        )
      )
      const polygon = new ymaps.Polygon(
        coordinates,
        {},
        {
          ...toCamelCaseKeys(polygonFeature.properties),
          fillColor: polygonFeature.properties.fill,
          strokeColor: polygonFeature.properties.stroke,
        }
      )
      if(onPolygonClick) {
        polygon.events.add('click', e => {
          const coords = e.get("coords")
          const lat = coords[0]
          const lon = coords[1]
          onPolygonClick({ lat, lon })
        })
      }
      map.geoObjects.add(polygon)
    }
  }
}

export default Maps