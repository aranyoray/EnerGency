import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { IndicatorCategory, GeographicContext } from '../App'
import { generateMockGeoJson } from '../utils/mockData'
import { loadEnergyData, convertToGeoJSON } from '../utils/dataLoader'
import { EnergyAccessMetrics } from '../types/energyData'
import './MapView.css'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  selectedIndicator: IndicatorCategory
  geoContext: GeographicContext
  mapBoundaries: 'Tract' | 'County' | 'State'
}

// Component to update map view when props change
function MapUpdater({ 
  geoContext, 
  mapBoundaries 
}: { 
  geoContext: GeographicContext
  mapBoundaries: 'Tract' | 'County' | 'State'
}) {
  const map = useMap()
  
  useEffect(() => {
    // Reset view to USA bounds when context changes
    map.fitBounds([
      [24.396308, -125.0],
      [49.384358, -66.93457]
    ] as [number, number][])
  }, [geoContext, mapBoundaries, map])

  return null
}

const MapView = ({ selectedIndicator, geoContext, mapBoundaries }: MapViewProps) => {
  const geoJsonRef = useRef<any>(null)
  const [energyData, setEnergyData] = useState<EnergyAccessMetrics[]>([])
  const [loading, setLoading] = useState(true)
  
  // Try to load real data, fallback to mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        const eiaApiKey = import.meta.env.VITE_EIA_API_KEY
        const data = await loadEnergyData(false, eiaApiKey)
        if (data && data.length > 0) {
          setEnergyData(data)
        } else {
          // Fallback to mock data if no real data available
          console.log('Using mock data - no real data sources configured')
        }
      } catch (error) {
        console.error('Error loading energy data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  
  // Generate GeoJSON from real data or fallback to mock
  const geoJsonData: any = energyData.length > 0
    ? convertToGeoJSON(energyData)
    : generateMockGeoJson(selectedIndicator, geoContext, mapBoundaries)

  // Color function based on indicator value
  const getColor = (value: number) => {
    if (value >= 80) return '#0066cc'
    if (value >= 60) return '#4d94ff'
    if (value >= 40) return '#80b3ff'
    if (value >= 20) return '#b3d1ff'
    return '#e6f0ff'
  }

  const getIndicatorValue = (feature: any): number => {
    const props = feature.properties
    switch (selectedIndicator) {
      case 'Overall Energy Access':
        return props.overallScore || props.value || 50
      case 'Electricity Access':
        return props.electricityAccess?.percentConnected || props.value || 50
      case 'Energy Affordability':
        return props.affordability ? (100 - (props.affordability.energyBurden * 10)) : props.value || 50
      case 'Energy Reliability':
        return props.reliability?.reliabilityScore || props.value || 50
      case 'Renewable Energy':
        return props.renewableEnergy?.renewableScore || props.value || 50
      case 'Energy Infrastructure':
        return props.infrastructure?.modernizationScore || props.value || 50
      case 'Energy Burden':
        return props.energyBurden ? (100 - (props.energyBurden.overallBurden * 10)) : props.value || 50
      default:
        return props.value || 50
    }
  }

  const style = (feature: any) => {
    const value = getIndicatorValue(feature)
    return {
      fillColor: getColor(value),
      weight: 1,
      opacity: 1,
      color: '#fff',
      dashArray: '',
      fillOpacity: 0.7
    }
  }

  const onEachFeature = (feature: any, layer: any) => {
    const value = getIndicatorValue(feature)
    const name = feature.properties.name || feature.properties.tractId || 'Unknown'
    const props = feature.properties
    
    let details = ''
    if (props.overallScore !== undefined) {
      details = `
        <div style="font-size: 0.75rem; margin-top: 0.5rem; color: #666;">
          ${props.electricityAccess ? `Electricity: ${props.electricityAccess.percentConnected?.toFixed(1)}%<br>` : ''}
          ${props.affordability ? `Energy Burden: ${props.affordability.energyBurden?.toFixed(1)}%<br>` : ''}
          ${props.reliability ? `Reliability Score: ${props.reliability.reliabilityScore?.toFixed(1)}<br>` : ''}
        </div>
      `
    }
    
    layer.bindPopup(`
      <div style="padding: 0.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${name}</h3>
        <p style="margin: 0; font-size: 0.875rem;">
          <strong>${selectedIndicator}:</strong> ${value.toFixed(1)}%
        </p>
        ${details}
      </div>
    `)
  }

  return (
    <div className="map-view">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          ref={geoJsonRef}
          data={geoJsonData}
          style={style}
          onEachFeature={onEachFeature}
        />
        <MapUpdater geoContext={geoContext} mapBoundaries={mapBoundaries} />
      </MapContainer>
      
      <div className="map-legend">
        <div className="legend-title">{selectedIndicator}</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#0066cc' }}></div>
            <span>80-100%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4d94ff' }}></div>
            <span>60-80%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#80b3ff' }}></div>
            <span>40-60%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#b3d1ff' }}></div>
            <span>20-40%</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e6f0ff' }}></div>
            <span>0-20%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView

