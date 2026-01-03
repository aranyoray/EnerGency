/**
 * Real Map View Component with Actual Data
 * Uses real nighttime light data, county GeoJSON polygons, and FEMA disasters
 */

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Tooltip, CircleMarker, Popup } from 'react-leaflet'
import { MapLayerConfig } from '../types/emergencyMetrics'
import {
  loadAllRealData,
  EnrichedCountyData,
  getTopStressedCounties,
  filterCountiesByState
} from '../services/realDataAggregator'
import { NightlightFeature } from '../services/nightlightData'
import LayerControls from './LayerControls'
import './EnhancedMapView.css'
import 'leaflet/dist/leaflet.css'

interface RealMapViewProps {
  geoLevel: 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'
  selectedState?: string
}

const RealMapView = ({ geoLevel, selectedState }: RealMapViewProps) => {
  const [counties, setCounties] = useState<EnrichedCountyData[]>([])
  const [nightlightData, setNightlightData] = useState<NightlightFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Layer configurations
  const [layers, setLayers] = useState<MapLayerConfig[]>([
    {
      id: 'county-choropleth',
      name: 'County Energy Intensity',
      enabled: true,
      type: 'choropleth',
      dataKey: 'overallStressScore',
      color: '#ff6b6b'
    },
    {
      id: 'disaster-stress',
      name: 'Disaster Stress Level',
      enabled: false,
      type: 'choropleth',
      dataKey: 'disasterStressScore',
      color: '#ff922b'
    },
    {
      id: 'nightlight-points',
      name: 'Nighttime Light Intensity',
      enabled: false,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#ffeb3b'
    },
    {
      id: 'top-stressed',
      name: 'Top Stressed Counties (⚠️)',
      enabled: true,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#e03131',
      icon: '⚠️'
    }
  ])

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Loading real data...')
        const data = await loadAllRealData({
          state: selectedState,
          disasterYears: 5
        })

        console.log('Data loaded:', {
          counties: data.enrichedCounties.length,
          nightlight: data.nightlight.features.length,
          disasters: data.disasters.length
        })

        // Filter by state if selected
        const filteredCounties = selectedState
          ? filterCountiesByState(data.enrichedCounties, selectedState)
          : data.enrichedCounties

        const filteredNightlight = selectedState
          ? data.nightlight.features.filter(f => f.properties.state === selectedState)
          : data.nightlight.features.slice(0, 500) // Limit for performance

        setCounties(filteredCounties)
        setNightlightData(filteredNightlight)
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedState])

  const handleLayerToggle = (layerId: string, enabled: boolean) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, enabled } : layer
      )
    )
  }

  // Get active choropleth layer
  const activeChoroplethLayer = layers.find(l => l.enabled && l.type === 'choropleth')
  const showNightlightPoints = layers.find(l => l.id === 'nightlight-points')?.enabled
  const showTopStressed = layers.find(l => l.id === 'top-stressed')?.enabled

  // Get color for choropleth based on value
  const getColor = (value: number): string => {
    if (value >= 80) return '#c92a2a'
    if (value >= 60) return '#f03e3e'
    if (value >= 40) return '#ff6b6b'
    if (value >= 20) return '#ffa8a8'
    return '#ffe8e8'
  }

  // Style function for county GeoJSON
  const styleCounty = (feature: any) => {
    if (!activeChoroplethLayer) {
      return {
        fillColor: '#cccccc',
        weight: 1,
        opacity: 0.5,
        color: '#ffffff',
        fillOpacity: 0.3
      }
    }

    const county = counties.find(c => c.properties.fips === feature.properties.fips)
    if (!county) {
      return {
        fillColor: '#cccccc',
        weight: 1,
        opacity: 0.5,
        color: '#ffffff',
        fillOpacity: 0.3
      }
    }

    let value = 0
    if (activeChoroplethLayer.id === 'county-choropleth') {
      value = county.emergencyMetrics.overallStressScore
    } else if (activeChoroplethLayer.id === 'disaster-stress') {
      value = county.emergencyMetrics.disasterStressScore
    }

    return {
      fillColor: getColor(value),
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.7
    }
  }

  // On each county feature
  const onEachCounty = (feature: any, layer: any) => {
    const county = counties.find(c => c.properties.fips === feature.properties.fips)
    if (!county) return

    const props = county.properties
    const metrics = county.emergencyMetrics

    const tooltipContent = (
      <div className="metric-tooltip">
        <h3>{props.name} County, {props.state}</h3>
        <div className="metric-section">
          <h4>Emergency Preparedness Metrics</h4>
          <p><strong>Stress Level:</strong> {metrics.stressLevel}</p>
          <p><strong>Overall Score:</strong> {metrics.overallStressScore.toFixed(1)}/100</p>
        </div>
        <div className="metric-section">
          <h4>Natural Disasters</h4>
          <p><strong>FEMA Declarations:</strong> {metrics.disasterCount}</p>
          <p><strong>Disaster Types:</strong> {metrics.disasterTypes.join(', ') || 'None'}</p>
          {metrics.mostRecentDisaster && (
            <p><strong>Most Recent:</strong> {metrics.mostRecentDisaster.incidentType} ({new Date(metrics.mostRecentDisaster.declarationDate).getFullYear()})</p>
          )}
        </div>
        <div className="metric-section">
          <h4>Energy Data (Nighttime Light Proxy)</h4>
          <p><strong>Light Intensity:</strong> {(props.avgIntensity * 100).toFixed(1)}%</p>
          <p><strong>Total Energy:</strong> {props.totalEnergyMW.toFixed(0)} MW</p>
          <p><strong>Population:</strong> {props.totalPopulation.toLocaleString()}</p>
          <p><strong>Cities:</strong> {props.citiesCount}</p>
        </div>
      </div>
    )

    layer.bindTooltip(tooltipContent, {
      sticky: true
    })
  }

  // Top stressed counties
  const topStressedCounties = showTopStressed ? getTopStressedCounties(counties, 100) : []

  if (error) {
    return (
      <div className="enhanced-map-view">
        <div className="loading-overlay">
          <div className="loading-spinner" style={{ color: '#e03131' }}>
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-map-view">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading real data from NOAA, FEMA, and satellite sources...</div>
        </div>
      )}

      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={selectedState ? 6 : 4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render county polygons */}
        {!loading && counties.map((county, idx) => (
          <GeoJSON
            key={`county-${county.properties.fips}-${idx}`}
            data={county as any}
            style={styleCounty}
            onEachFeature={onEachCounty}
          />
        ))}

        {/* Render nightlight points */}
        {showNightlightPoints && nightlightData.map((location, idx) => {
          const lat = location.geometry.coordinates[1]
          const lon = location.geometry.coordinates[0]

          // Validate coordinates
          if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
            console.warn(`Invalid nightlight coordinates for ${location.properties.name}: [${lat}, ${lon}]`)
            return null
          }

          return (
            <CircleMarker
              key={`nightlight-${idx}`}
              center={[lat, lon]}
              radius={Math.max(2, location.properties.intensity * 8)}
              pathOptions={{
                fillColor: '#ffeb3b',
                color: '#fdd835',
                weight: 1,
                fillOpacity: location.properties.intensity * 0.7
              }}
            >
              <Tooltip>
                <div>
                  <strong>{location.properties.name}, {location.properties.state}</strong><br />
                  Light Intensity: {(location.properties.intensity * 100).toFixed(1)}%<br />
                  Energy: {location.properties.energyMW.toFixed(0)} MW<br />
                  Population: {location.properties.population.toLocaleString()}
                </div>
              </Tooltip>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {/* Render top stressed county markers */}
        {showTopStressed && topStressedCounties.map((county, idx) => {
          // Get outer ring of polygon
          const coords = county.geometry.coordinates[0]

          // Safety check for valid coordinates
          if (!coords || coords.length === 0) {
            console.warn(`Invalid coordinates for county ${county.properties.fips}`)
            return null
          }

          // Calculate centroid
          const centerLon = coords.reduce((sum: number, c: number[]) => sum + c[0], 0) / coords.length
          const centerLat = coords.reduce((sum: number, c: number[]) => sum + c[1], 0) / coords.length

          // Validate calculated center
          if (isNaN(centerLat) || isNaN(centerLon)) {
            console.warn(`Invalid center calculated for county ${county.properties.fips}: [${centerLat}, ${centerLon}]`)
            return null
          }

          return (
            <CircleMarker
              key={`stressed-${county.properties.fips}-${idx}`}
              center={[centerLat, centerLon]}
              radius={8}
              pathOptions={{
                fillColor: '#e03131',
                color: '#c92a2a',
                weight: 2,
                fillOpacity: 0.9
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>⚠️ High Stress Area</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Stress Level: {county.emergencyMetrics.stressLevel}</p>
                  <p>Score: {county.emergencyMetrics.overallStressScore.toFixed(1)}/100</p>
                  <p>Disasters: {county.emergencyMetrics.disasterCount}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}
      </MapContainer>

      <LayerControls
        layers={layers}
        onLayerToggle={handleLayerToggle}
      />

      {/* Legend */}
      {activeChoroplethLayer && (
        <div className="map-legend-enhanced">
          <div className="legend-title">{activeChoroplethLayer.name}</div>
          <div className="legend-gradient">
            <div className="legend-gradient-bar" style={{
              background: `linear-gradient(to right, ${getColor(0)}, ${getColor(50)}, ${getColor(100)})`
            }} />
            <div className="legend-gradient-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', marginTop: '8px', color: '#666' }}>
            <strong>Data Sources:</strong> FEMA OpenFEMA API, VIIRS Nighttime Satellite Data
          </div>
        </div>
      )}
    </div>
  )
}

export default RealMapView
