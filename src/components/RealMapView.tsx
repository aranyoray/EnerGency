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
import TimeSlider from './TimeSlider'
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
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))
  const [isPlaying, setIsPlaying] = useState(false)

  // Layer configurations
  const [layers, setLayers] = useState<MapLayerConfig[]>([
    {
      id: 'county-choropleth',
      name: 'County Readiness Pressure',
      enabled: true,
      type: 'choropleth',
      dataKey: 'overallStressScore',
      color: '#b91c1c'
    },
    {
      id: 'disaster-stress',
      name: 'Disaster Exposure Level',
      enabled: false,
      type: 'choropleth',
      dataKey: 'disasterStressScore',
      color: '#f97316'
    },
    {
      id: 'nightlight-points',
      name: 'Local Energy Activity',
      enabled: false,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#38bdf8'
    },
    {
      id: 'top-stressed',
      name: 'Priority Action Counties (⚠️)',
      enabled: true,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#b91c1c',
      icon: '⚠️'
    }
  ])

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await loadAllRealData({
          state: selectedState,
          disasterYears: 5
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
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, enabled }
        }
        if (enabled && layer.type === 'choropleth' && layer.id !== layerId) {
          return { ...layer, enabled: false }
        }
        return layer
      })
    )
  }

  // Get active choropleth layer
  const activeChoroplethLayer = layers.find(l => l.enabled && l.type === 'choropleth')
  const showNightlightPoints = layers.find(l => l.id === 'nightlight-points')?.enabled
  const showTopStressed = layers.find(l => l.id === 'top-stressed')?.enabled
  const showEnergyReliability = layers.find(l => l.id === 'energy-reliability')?.enabled
  const showRecoveryNeeds = layers.find(l => l.id === 'recovery-needs')?.enabled
  const showInfrastructurePriority = layers.find(l => l.id === 'infrastructure-priority')?.enabled
  const showForecastHotspots = layers.find(l => l.id === 'forecast-pressure')?.enabled

  const clampScore = (value: number) => Math.max(0, Math.min(100, value))

  const getSeasonalAdjustment = (date: Date) => {
    const month = date.getMonth()
    if (month >= 5 && month <= 9) return 12
    if (month === 11 || month <= 1) return 9
    return 5
  }

  const getForecastScore = (county: EnrichedCountyData) => {
    const base = county.emergencyMetrics.overallStressScore
    const seasonal = getSeasonalAdjustment(currentDate)
    const trend = (currentDate.getFullYear() - 2020) * 1.5
    const disasterMomentum = Math.min(county.emergencyMetrics.disasterCount * 0.8, 10)
    return clampScore(base + seasonal + trend + disasterMomentum)
  }

  const getForecastLevel = (score: number) => {
    if (score >= 75) return 'Critical'
    if (score >= 50) return 'High'
    if (score >= 25) return 'Moderate'
    return 'Low'
  }

  // Get color for choropleth based on value
  const getColor = (value: number): string => {
    if (value >= 80) return '#991b1b'
    if (value >= 60) return '#dc2626'
    if (value >= 40) return '#f97316'
    if (value >= 20) return '#93c5fd'
    return '#1d4ed8'
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
    } else if (activeChoroplethLayer.id === 'forecast-pressure') {
      value = getForecastScore(county)
    }

    return {
      fillColor: getColor(value, activeChoroplethLayer.id),
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
    const forecastScore = getForecastScore(county)
    const forecastLevel = getForecastLevel(forecastScore)

    const tooltipContent = (
      <div className="metric-tooltip">
        <h3>{props.name} County, {props.state}</h3>
        <div className="metric-section">
          <h4>Emergency Preparedness Metrics</h4>
          <p><strong>Stress Level:</strong> {metrics.stressLevel}</p>
          <p><strong>Overall Score:</strong> {metrics.overallStressScore.toFixed(1)}/100</p>
        </div>
        <div className="metric-section">
          <h4>AI Outlook ({currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</h4>
          <p><strong>Forecast Score:</strong> {forecastScore.toFixed(1)}/100</p>
          <p><strong>Forecast Level:</strong> {forecastLevel}</p>
          <p><strong>Drivers:</strong> seasonal demand, recent disaster momentum, baseline readiness</p>
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

    layer.on({
      click: () => {
        setSelectedCounty(county)
      }
    })
    layer.bindTooltip(tooltipContent, {
      sticky: true,
      opacity: 0.9
    })
  }

  // Top stressed counties
  const topStressedCounties = showTopStressed ? getTopStressedCounties(counties, 100) : []
  const energyReliabilityCounties = showEnergyReliability
    ? counties.filter(county => county.emergencyMetrics.energyStressScore >= 60)
    : []
  const recoveryNeedCounties = showRecoveryNeeds
    ? counties.filter(county => county.emergencyMetrics.disasterStressScore >= 60)
    : []
  const infrastructurePriorityCounties = showInfrastructurePriority
    ? counties.filter(county =>
        county.emergencyMetrics.overallStressScore >= 70 || county.properties.totalPopulation >= 500000
      )
    : []
  const forecastHotspotCounties = showForecastHotspots
    ? counties.filter(county => getForecastScore(county) >= 75)
    : []

  const getCountyCentroid = (county: EnrichedCountyData) => {
    const coords = county.geometry.coordinates[0]
    if (!coords || coords.length === 0) return null
    const centerLon = coords.reduce((sum: number, c: number[]) => sum + c[0], 0) / coords.length
    const centerLat = coords.reduce((sum: number, c: number[]) => sum + c[1], 0) / coords.length
    if (isNaN(centerLat) || isNaN(centerLon)) return null
    return [centerLat, centerLon] as [number, number]
  }

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
          <div className="loading-spinner">Loading verified public data from NOAA, FEMA, and satellite sources...</div>
        </div>
      )}

      {!loading && counties.length === 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner">No counties match the current filters. Try another state.</div>
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
                fillColor: '#38bdf8',
                color: '#0ea5e9',
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
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`stressed-${county.properties.fips}-${idx}`}
              center={center}
              radius={8}
              pathOptions={{
                fillColor: '#b91c1c',
                color: '#7f1d1d',
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

        {/* Energy reliability watchlist */}
        {showEnergyReliability && energyReliabilityCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`reliability-${county.properties.fips}-${idx}`}
              center={center}
              radius={6}
              pathOptions={{
                fillColor: '#2563eb',
                color: '#1d4ed8',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>⚡ Energy Reliability Watchlist</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Energy Stress: {county.emergencyMetrics.energyStressScore.toFixed(1)}/100</p>
                  <p>Demand Load: {county.properties.totalEnergyMW.toFixed(0)} MW</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {/* Disaster recovery needs */}
        {showRecoveryNeeds && recoveryNeedCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`recovery-${county.properties.fips}-${idx}`}
              center={center}
              radius={6}
              pathOptions={{
                fillColor: '#f97316',
                color: '#c2410c',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🛠️ Disaster Recovery Needs</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Disaster Stress: {county.emergencyMetrics.disasterStressScore.toFixed(1)}/100</p>
                  <p>Recent Declarations: {county.emergencyMetrics.disasterCount}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {/* Critical infrastructure safeguard */}
        {showInfrastructurePriority && infrastructurePriorityCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`infrastructure-${county.properties.fips}-${idx}`}
              center={center}
              radius={6}
              pathOptions={{
                fillColor: '#7c3aed',
                color: '#5b21b6',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🏥 Critical Infrastructure Safeguard</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Population: {county.properties.totalPopulation.toLocaleString()}</p>
                  <p>Readiness Score: {county.emergencyMetrics.overallStressScore.toFixed(1)}/100</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {/* AI forecast hotspots */}
        {showForecastHotspots && forecastHotspotCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          const forecastScore = getForecastScore(county)
          return (
            <CircleMarker
              key={`forecast-${county.properties.fips}-${idx}`}
              center={center}
              radius={9}
              pathOptions={{
                fillColor: '#1d4ed8',
                color: '#0f172a',
                weight: 2,
                fillOpacity: 0.85
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🔮 AI Forecast Hotspot</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Forecast Score: {forecastScore.toFixed(1)}/100</p>
                  <p>Forecast Level: {getForecastLevel(forecastScore)}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}
      </MapContainer>

      <LayerControls
        layers={layers}
        onLayerToggle={handleLayerToggle}
        featuredLayerIds={['new-projects', 'storage-sites']}
      />

      {selectedCounty && (
        <div className="map-sidebar">
          <div className="map-sidebar-header">
            <div>
              <h3>{selectedCounty.properties.name} County, {selectedCounty.properties.state}</h3>
              <p>Population: {selectedCounty.properties.totalPopulation.toLocaleString()}</p>
            </div>
            <button
              className="map-sidebar-close"
              onClick={() => setSelectedCounty(null)}
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
          <div className="map-sidebar-section">
            <h4>AI Forecast</h4>
            <p><strong>Forecast Score:</strong> {getForecastScore(selectedCounty).toFixed(1)}/100</p>
            <p><strong>Forecast Level:</strong> {getForecastLevel(getForecastScore(selectedCounty))}</p>
            <p><strong>Forecast Window:</strong> {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="map-sidebar-section">
            <h4>AI-driven Pricing Guidance</h4>
            <p>
              {getForecastScore(selectedCounty) >= 75
                ? 'Surge +20%: target large industrial loads and automated demand response.'
                : getForecastScore(selectedCounty) >= 60
                  ? 'Peak +12%: shift flexible usage during high-risk hours.'
                  : getForecastScore(selectedCounty) >= 50
                    ? 'Flex +6%: encourage off-peak scheduling and conservation.'
                    : 'Standard: maintain baseline pricing with monitoring.'}
            </p>
          </div>
          <div className="map-sidebar-section">
            <h4>2050 Readiness Investments</h4>
            <p>
              {getForecastScore(selectedCounty) >= 70
                ? '⚡ New energy project recommended to strengthen local capacity.'
                : '⚡ Monitor for future project pipeline opportunities.'}
            </p>
            <p>
              {getForecastScore(selectedCounty) >= 60 || selectedCounty.emergencyMetrics.disasterStressScore >= 65
                ? '🔋 Storage site recommended for disaster resilience.'
                : '🔋 Storage optional; monitor for rising risk.'}
            </p>
          </div>
          <div className="map-sidebar-section">
            <h4>Emergency Readiness</h4>
            <p><strong>Stress Level:</strong> {selectedCounty.emergencyMetrics.stressLevel}</p>
            <p><strong>Overall Score:</strong> {selectedCounty.emergencyMetrics.overallStressScore.toFixed(1)}/100</p>
            <p><strong>Disaster Declarations:</strong> {selectedCounty.emergencyMetrics.disasterCount}</p>
          </div>
        </div>
      )}

      <TimeSlider
        minDate={new Date(2020, 0, 1)}
        maxDate={new Date(2050, 11, 31)}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isPlaying={isPlaying}
        onPlayToggle={setIsPlaying}
        stepSize="month"
      />

      <TimeSlider
        minDate={new Date(2020, 0, 1)}
        maxDate={new Date(2024, 11, 31)}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isPlaying={isPlaying}
        onPlayToggle={setIsPlaying}
        stepSize="month"
      />

      {/* Legend */}
      {activeChoroplethLayer && (
        <div className="map-legend-enhanced">
          <div className="legend-title">{activeChoroplethLayer.name}</div>
          <div className="legend-gradient">
            <div className="legend-gradient-bar" style={{
              background: `linear-gradient(to right, ${getColor(0, activeChoroplethLayer.id)}, ${getColor(50, activeChoroplethLayer.id)}, ${getColor(100, activeChoroplethLayer.id)})`
            }} />
            <div className="legend-gradient-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', marginTop: '8px', color: '#666' }}>
            <strong>Forecast Date:</strong> {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '11px', marginTop: '6px', color: '#666' }}>
            <strong>Data Sources:</strong> FEMA OpenFEMA API, VIIRS Nighttime Satellite Data
          </div>
        </div>
      )}
    </div>
  )
}

export default RealMapView
