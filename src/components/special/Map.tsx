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

const center = [55.947417612394574, 54.72572230097609]
var previousMarker: any


interface props {
  onSelect: (cordinates: number[]) => void
}
const ReactMap: FC<props> = p => {
  useGeographic();
  useEffect(() => {
    const map = new Map({
      target: 'map',
      controls: [],
      view: new View({
        center,
        zoom: 13,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ]
    })
    map.on('singleclick', e => {
      const newLayer = new VectorLayer({
        source: new VectorSource(),
        style: { 'icon-src': Marker },
      })
      map.getView().setCenter(e.coordinate)
      if(previousMarker) map.removeLayer(previousMarker)

      map.addLayer(newLayer)
      let marker = new Feature(new Point(e.coordinate));
      newLayer.getSource()?.addFeature(marker)

      previousMarker = newLayer
      p.onSelect(e.coordinate)
    })
  }, [])
  return <div id="map" style={fullscreen} />
}

const fullscreen = { width: '100vw', height: '100vh' }
export default ReactMap