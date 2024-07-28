import { FC, useEffect } from 'react'
import Map from 'ol/Map.js'
import TileLayer from 'ol/layer/Tile'
import { OSM } from 'ol/source'
import { View } from 'ol'
import { Point } from 'ol/geom'
import { useGeographic } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Marker from '../../assets/marker.png'
import GreyMarker from '../../assets/grey_marker.png'
import Select from 'ol/interaction/Select'
import Style from 'ol/style/Style'
import IconStyle from 'ol/style/Icon'
import { useTheme } from '../../features/hooks'

const center = [55.947417612394574, 54.72572230097609]
var previousMarker: any


interface props {
  onSelect: (cordinates: number[]) => void
}
const ReactMap: FC<props> = p => {
  const { theme } = useTheme()
  useGeographic();
  useEffect(() => {
    const tile = new TileLayer({ source: new OSM() })
    const map = new Map({
      target: 'map',
      controls: [],
      view: new View({ center, zoom: 13 }),
      layers: [tile]
    })
    if (theme === 'dark') {
      tile.on('prerender', (evt) => {
        if (evt.context) {
          const context = evt.context as CanvasRenderingContext2D;
          context.filter = 'grayscale(80%) invert(100%) ';
          context.globalCompositeOperation = 'source-over';
        }
      });

      tile.on('postrender', (evt) => {
        if (evt.context) {
          const context = evt.context as CanvasRenderingContext2D;
          context.filter = 'none';
        }
      });
    }
    map.on('singleclick', e => {
      const newLayer = new VectorLayer({
        className: e.coordinate.join(', '),
        source: new VectorSource(),
        style: { 'icon-src': Marker, 'icon-height': 40 },
      })
      map.getView().setCenter(e.coordinate)
      if (previousMarker) map.removeLayer(previousMarker)

      map.addLayer(newLayer)

      let marker = new Feature(new Point(e.coordinate));
      newLayer.getSource()?.addFeature(marker)

      previousMarker = newLayer
      p.onSelect(e.coordinate)
    })
    return () => {
      if (previousMarker) map.removeLayer(previousMarker)
    }
  }, [])
  return <div id="map" style={fullscreen} />
}


type radioItem = { lat: number, lon: number, key: number }
interface radioProps {
  items: radioItem[]
  defaultSelected?: radioItem
  onSwitch: (r: radioItem) => void
}
const ReactMapRadio: FC<radioProps> = p => {
  const { theme } = useTheme()
  useGeographic();
  useEffect(() => {
    const tile = new TileLayer({ source: new OSM() })
    const map = new Map({
      target: 'map',
      controls: [],
      view: new View({
        center: p.defaultSelected
          ? [p.defaultSelected.lat, p.defaultSelected.lon]
          : [56.02900051529786, 54.727878021619915],
        zoom: 11,
      }),
      layers: [tile]
    })
    if (theme === 'dark') {
      tile.on('prerender', (evt) => {
        if (evt.context) {
          const context = evt.context as CanvasRenderingContext2D;
          context.filter = 'grayscale(80%) invert(100%) ';
          context.globalCompositeOperation = 'source-over';
        }
      });

      tile.on('postrender', (evt) => {
        if (evt.context) {
          const context = evt.context as CanvasRenderingContext2D;
          context.filter = 'none';
        }
      });
    }

    let selectClick = new Select({
      style: new Style({
        'image': new IconStyle({ 'src': Marker, 'height': 44 })
      })
    })
    map.addInteraction(selectClick)
    selectClick.on('select', e => {
      if (e.selected.length) {
        let layer = selectClick.getLayer(e.selected[0]);
        const clicked = p.items.find(item =>
          String(item.key) === layer.getClassName()
        )
        if (clicked) {
          p.onSwitch(clicked)
          map.getView().setCenter([clicked.lat, clicked.lon])
        }
      }
    })

    for (const poimt of p.items) {
      const newLayer = new VectorLayer({
        source: new VectorSource(),
        style: { 'icon-src': GreyMarker, 'icon-height': 38 },
        className: String(poimt.key)
      })
      map.addLayer(newLayer)
      let marker = new Feature(new Point([poimt.lat, poimt.lon]));
      newLayer.getSource()?.addFeature(marker)
    }
  }, [])
  return <div id="map" style={fullscreen} />
}

const fullscreen = { width: '100vw', height: '100vh' }

const Maps = {
  Picker: ReactMap,
  RadioPicker: ReactMapRadio
}
export default Maps