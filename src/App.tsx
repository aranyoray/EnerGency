import { useState } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import './App.css'

export type IndicatorCategory = 
  | 'Overall Energy Access'
  | 'Electricity Access'
  | 'Energy Affordability'
  | 'Energy Reliability'
  | 'Renewable Energy'
  | 'Energy Infrastructure'
  | 'Energy Burden'

export type GeographicContext = 'State' | 'County' | 'Census Tract' | 'Region'

function App() {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorCategory>('Overall Energy Access')
  const [geoContext, setGeoContext] = useState<GeographicContext>('State')
  const [mapBoundaries, setMapBoundaries] = useState<'Tract' | 'County' | 'State'>('Tract')
  const [reportBoundaries, setReportBoundaries] = useState<'Tract' | 'County' | 'State'>('Tract')

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Sidebar 
          selectedIndicator={selectedIndicator}
          onIndicatorChange={setSelectedIndicator}
          geoContext={geoContext}
          onGeoContextChange={setGeoContext}
          mapBoundaries={mapBoundaries}
          onMapBoundariesChange={setMapBoundaries}
          reportBoundaries={reportBoundaries}
          onReportBoundariesChange={setReportBoundaries}
        />
        <MapView 
          selectedIndicator={selectedIndicator}
          geoContext={geoContext}
          mapBoundaries={mapBoundaries}
        />
      </div>
    </div>
  )
}

export default App

