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
import './EnhancedMapView.css'
import 'leaflet/dist/leaflet.css'

interface RealMapViewProps {
  geoLevel: 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'
  selectedState?: string
  layers: MapLayerConfig[]
  currentDate: Date
}

const nuclearPlants = [
  {
    name: 'Palo Verde Nuclear Generating Station',
    location: [33.389, -112.865] as [number, number],
    capacityMW: 3990,
    reactorType: 'PWR',
    status: 'Operating',
    operator: 'Arizona Public Service'
  },
  {
    name: 'Vogtle Units 3 & 4',
    location: [33.142, -81.762] as [number, number],
    capacityMW: 2234,
    reactorType: 'AP1000',
    status: 'Operating',
    operator: 'Southern Company'
  },
  {
    name: 'South Texas Project',
    location: [28.795, -96.045] as [number, number],
    capacityMW: 2560,
    reactorType: 'PWR',
    status: 'Operating',
    operator: 'STP Nuclear Operating Company'
  },
  {
    name: 'NuScale Carbon Free Power (Planned)',
    location: [43.61, -116.202] as [number, number],
    capacityMW: 924,
    reactorType: 'SMR',
    status: 'Planned',
    operator: 'UAMPS'
  }
]

const fossilFuelInfrastructure = [
  {
    type: 'coal_plant',
    name: 'James H. Miller Jr. Power Plant',
    location: [33.33, -87.2] as [number, number],
    capacity: '2,880 MW',
    operator: 'Alabama Power'
  },
  {
    type: 'natural_gas_plant',
    name: 'Guadalupe Generating Station',
    location: [29.63, -97.73] as [number, number],
    capacity: '1,024 MW',
    operator: 'Guadalupe Energy Center'
  },
  {
    type: 'oil_refinery',
    name: 'Port Arthur Refinery',
    location: [29.88, -93.93] as [number, number],
    capacity: '635,000 bpd',
    operator: 'Motiva'
  },
  {
    type: 'lng_terminal',
    name: 'Sabine Pass LNG',
    location: [29.73, -93.87] as [number, number],
    capacity: '30 MTPA',
    operator: 'Cheniere Energy'
  }
]

const criticalMineralDeposits = [
  {
    mineral: 'Uranium',
    location: [38.85, -109.5] as [number, number],
    status: 'Active',
    strategicImportance: 'Critical'
  },
  {
    mineral: 'Rare Earths',
    location: [35.47, -117.67] as [number, number],
    status: 'Active',
    strategicImportance: 'Critical'
  },
  {
    mineral: 'Lithium',
    location: [40.82, -118.16] as [number, number],
    status: 'Proposed',
    strategicImportance: 'Important'
  },
  {
    mineral: 'Copper',
    location: [33.4, -111.1] as [number, number],
    status: 'Potential',
    strategicImportance: 'Valuable'
  }
]

const oilGasRegions = [
  {
    name: 'Permian Basin',
    location: [31.8, -102.0] as [number, number],
    production: '6.0M bpd',
    note: "America's energy powerhouse"
  },
  {
    name: 'Bakken Formation',
    location: [47.7, -103.3] as [number, number],
    production: '1.2M bpd',
    note: 'Shale revolution leader'
  },
  {
    name: 'Marcellus Shale',
    location: [40.8, -77.8] as [number, number],
    production: '34 BCF/day',
    note: 'Natural gas leader'
  },
  {
    name: 'Gulf of Mexico OCS',
    location: [28.7, -90.5] as [number, number],
    production: '1.8M bpd',
    note: 'Offshore energy dominance'
  }
]

const gridInfrastructure = [
  {
    type: 'transmission_line',
    name: 'PJM 500 kV Corridor',
    location: [39.5, -77.2] as [number, number],
    voltage: 500,
    operator: 'PJM',
    saidi: 94,
    saifi: 1.2
  },
  {
    type: 'substation',
    name: 'Comanche Substation',
    location: [39.1, -104.9] as [number, number],
    voltage: 345,
    operator: 'Xcel Energy',
    saidi: 102,
    saifi: 1.4
  },
  {
    type: 'interconnection',
    name: 'ERCOT Intertie Hub',
    location: [30.3, -97.7] as [number, number],
    voltage: 345,
    operator: 'ERCOT',
    saidi: 78,
    saifi: 0.9
  }
]

const sprSites = [
  {
    name: 'Bryan Mound',
    location: [29.05, -95.6] as [number, number],
    fillLevel: '81%',
    capacity: '254 million barrels'
  },
  {
    name: 'Big Hill',
    location: [29.6, -94.3] as [number, number],
    fillLevel: '79%',
    capacity: '160 million barrels'
  },
  {
    name: 'West Hackberry',
    location: [29.95, -93.35] as [number, number],
    fillLevel: '74%',
    capacity: '219 million barrels'
  },
  {
    name: 'Bayou Choctaw',
    location: [30.05, -91.2] as [number, number],
    fillLevel: '76%',
    capacity: '76 million barrels'
  }
]

const RealMapView = ({ geoLevel, selectedState, layers, currentDate }: RealMapViewProps) => {
  const [counties, setCounties] = useState<EnrichedCountyData[]>([])
  const [nightlightData, setNightlightData] = useState<NightlightFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<EnrichedCountyData | null>(null)

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

  // Get active choropleth layer
  const activeChoroplethLayer = layers.find(l => l.enabled && l.type === 'choropleth')
  const showNightlightPoints = layers.find(l => l.id === 'nightlight-points')?.enabled
  const showTopStressed = layers.find(l => l.id === 'top-stressed')?.enabled
  const showEnergyReliability = layers.find(l => l.id === 'energy-reliability')?.enabled
  const showRecoveryNeeds = layers.find(l => l.id === 'recovery-needs')?.enabled
  const showInfrastructurePriority = layers.find(l => l.id === 'infrastructure-priority')?.enabled
  const showForecastHotspots = layers.find(l => l.id === 'forecast-pressure')?.enabled
  const showCountyPricing = layers.find(l => l.id === 'county-pricing')?.enabled
  const showManufacturingHubs = layers.find(l => l.id === 'manufacturing-hubs')?.enabled
  const showAgricultureSupply = layers.find(l => l.id === 'agriculture-supply')?.enabled
  const showWaterSystems = layers.find(l => l.id === 'water-systems')?.enabled
  const showFirstResponders = layers.find(l => l.id === 'first-responders')?.enabled
  const showNewProjects = layers.find(l => l.id === 'new-projects')?.enabled
  const showStorageSites = layers.find(l => l.id === 'storage-sites')?.enabled
  const showNuclearPlants = layers.find(l => l.id === 'nuclear-plants')?.enabled
  const showFossilInfrastructure = layers.find(l => l.id === 'fossil-infrastructure')?.enabled
  const showCriticalMinerals = layers.find(l => l.id === 'critical-minerals')?.enabled
  const showOilGasRegions = layers.find(l => l.id === 'oil-gas-regions')?.enabled
  const showGridInfrastructure = layers.find(l => l.id === 'grid-infrastructure')?.enabled
  const showSprSites = layers.find(l => l.id === 'spr-sites')?.enabled

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
  const getColor = (value: number, layerId?: string): string => {
    if (layerId === 'forecast-pressure') {
      if (value >= 80) return '#1e3a8a'
      if (value >= 60) return '#1d4ed8'
      if (value >= 40) return '#38bdf8'
      if (value >= 20) return '#bae6fd'
      return '#e0f2fe'
    }
    if (value >= 80) return '#991b1b'
    if (value >= 60) return '#dc2626'
    if (value >= 40) return '#f97316'
    if (value >= 20) return '#93c5fd'
    return '#1d4ed8'
  }

  const getOverlayOpacity = (county: EnrichedCountyData, baseOpacity: number) => {
    const score = county.emergencyMetrics.overallStressScore / 100
    return Math.min(baseOpacity, 0.4 + score * 0.6)
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
  const pricingCounties = showCountyPricing
    ? counties.filter(county => getForecastScore(county) >= 55)
    : []
  const manufacturingCounties = showManufacturingHubs
    ? counties.filter(county => county.properties.totalEnergyMW >= 800 || county.emergencyMetrics.energyStressScore >= 65)
    : []
  const agricultureCounties = showAgricultureSupply
    ? counties.filter(county =>
        county.properties.totalPopulation <= 150000 && county.emergencyMetrics.disasterStressScore >= 45
      )
    : []
  const waterSystemCounties = showWaterSystems
    ? counties.filter(county => county.emergencyMetrics.disasterStressScore >= 55)
    : []
  const firstResponderCounties = showFirstResponders
    ? counties.filter(county => county.properties.totalPopulation >= 250000)
    : []
  const newProjectCounties = showNewProjects
    ? counties.filter(county =>
        getForecastScore(county) >= 70 || county.emergencyMetrics.energyStressScore >= 65
      )
    : []
  const storageSiteCounties = showStorageSites
    ? counties.filter(county =>
        getForecastScore(county) >= 60 || county.emergencyMetrics.disasterStressScore >= 65
      )
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

          const opacity = getOverlayOpacity(county, 0.9)
          return (
            <CircleMarker
              key={`stressed-${county.properties.fips}-${idx}`}
              center={center}
              radius={8}
              pathOptions={{
                fillColor: '#b91c1c',
                color: '#7f1d1d',
                weight: 2,
                fillOpacity: opacity
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

        {showCountyPricing && pricingCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          const forecastScore = getForecastScore(county)
          return (
            <CircleMarker
              key={`pricing-${county.properties.fips}-${idx}`}
              center={center}
              radius={7}
              pathOptions={{
                fillColor: '#0f766e',
                color: '#115e59',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>💵 County-Level Pricing Signal</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Forecast Score: {forecastScore.toFixed(1)}/100</p>
                  <p>Recommendation: Target large flexible loads first.</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showManufacturingHubs && manufacturingCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`manufacturing-${county.properties.fips}-${idx}`}
              center={center}
              radius={7}
              pathOptions={{
                fillColor: '#0f172a',
                color: '#1e293b',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🏭 Manufacturing & Data Center Hub</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Industrial Load: {county.properties.totalEnergyMW.toFixed(0)} MW</p>
                  <p>Energy Stress: {county.emergencyMetrics.energyStressScore.toFixed(1)}/100</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showAgricultureSupply && agricultureCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`agriculture-${county.properties.fips}-${idx}`}
              center={center}
              radius={7}
              pathOptions={{
                fillColor: '#16a34a',
                color: '#15803d',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🌾 Agriculture & Food Supply</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Disaster Stress: {county.emergencyMetrics.disasterStressScore.toFixed(1)}/100</p>
                  <p>Priority: Keep cold storage and irrigation online.</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showWaterSystems && waterSystemCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`water-${county.properties.fips}-${idx}`}
              center={center}
              radius={7}
              pathOptions={{
                fillColor: '#0284c7',
                color: '#0369a1',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>💧 Water System Reliability Risk</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Disaster Stress: {county.emergencyMetrics.disasterStressScore.toFixed(1)}/100</p>
                  <p>Priority: Protect pumps, treatment, and backup power.</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showFirstResponders && firstResponderCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`responders-${county.properties.fips}-${idx}`}
              center={center}
              radius={7}
              pathOptions={{
                fillColor: '#7c3aed',
                color: '#5b21b6',
                weight: 2,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🚓 First Responder & Hospital Hub</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Population: {county.properties.totalPopulation.toLocaleString()}</p>
                  <p>Readiness Score: {county.emergencyMetrics.overallStressScore.toFixed(1)}/100</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showNewProjects && newProjectCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`projects-${county.properties.fips}-${idx}`}
              center={center}
              radius={8}
              pathOptions={{
                fillColor: '#facc15',
                color: '#ca8a04',
                weight: 2,
                fillOpacity: 0.85
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>💡 2050 New Energy Project</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Forecast Score: {getForecastScore(county).toFixed(1)}/100</p>
                  <p>Action: Plan permits, grid tie-ins, and workforce readiness.</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showStorageSites && storageSiteCounties.map((county, idx) => {
          const center = getCountyCentroid(county)
          if (!center) return null

          return (
            <CircleMarker
              key={`storage-${county.properties.fips}-${idx}`}
              center={center}
              radius={8}
              pathOptions={{
                fillColor: '#22c55e',
                color: '#15803d',
                weight: 2,
                fillOpacity: 0.85
              }}
            >
              <Popup>
                <div className="stress-popup">
                  <h3>🔋 2050 Storage Site Candidate</h3>
                  <p><strong>{county.properties.name} County, {county.properties.state}</strong></p>
                  <p>Disaster Stress: {county.emergencyMetrics.disasterStressScore.toFixed(1)}/100</p>
                  <p>Action: Pair batteries with hospitals and shelters.</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        }).filter(Boolean)}

        {showNuclearPlants && nuclearPlants.map((plant, idx) => (
          <CircleMarker
            key={`nuclear-${plant.name}-${idx}`}
            center={plant.location}
            radius={9}
            pathOptions={{
              fillColor: '#16a34a',
              color: '#166534',
              weight: 2,
              fillOpacity: 0.85
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>☢️ Nuclear Power Plant</h3>
                <p><strong>{plant.name}</strong></p>
                <p>Capacity: {plant.capacityMW.toLocaleString()} MW</p>
                <p>Reactor: {plant.reactorType}</p>
                <p>Status: {plant.status}</p>
                <p>Operator: {plant.operator}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showFossilInfrastructure && fossilFuelInfrastructure.map((site, idx) => (
          <CircleMarker
            key={`fossil-${site.name}-${idx}`}
            center={site.location}
            radius={8}
            pathOptions={{
              fillColor: '#0f172a',
              color: '#1f2937',
              weight: 2,
              fillOpacity: 0.85
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>🛢️ Fossil Fuel Infrastructure</h3>
                <p><strong>{site.name}</strong></p>
                <p>Type: {site.type.replace('_', ' ')}</p>
                <p>Capacity: {site.capacity}</p>
                <p>Operator: {site.operator}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showCriticalMinerals && criticalMineralDeposits.map((deposit, idx) => (
          <CircleMarker
            key={`mineral-${deposit.mineral}-${idx}`}
            center={deposit.location}
            radius={7}
            pathOptions={{
              fillColor: '#f97316',
              color: '#c2410c',
              weight: 2,
              fillOpacity: 0.85
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>⛏️ Critical Mineral Deposit</h3>
                <p><strong>{deposit.mineral}</strong></p>
                <p>Status: {deposit.status}</p>
                <p>Strategic Importance: {deposit.strategicImportance}</p>
                <p>Focus: Domestic supply chain security</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showOilGasRegions && oilGasRegions.map((region, idx) => (
          <CircleMarker
            key={`region-${region.name}-${idx}`}
            center={region.location}
            radius={14}
            pathOptions={{
              fillColor: '#92400e',
              color: '#78350f',
              weight: 2,
              fillOpacity: 0.55
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>🏗️ Oil & Gas Production Region</h3>
                <p><strong>{region.name}</strong></p>
                <p>Production: {region.production}</p>
                <p>{region.note}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showGridInfrastructure && gridInfrastructure.map((asset, idx) => (
          <CircleMarker
            key={`grid-${asset.name}-${idx}`}
            center={asset.location}
            radius={7}
            pathOptions={{
              fillColor: '#2563eb',
              color: '#1d4ed8',
              weight: 2,
              fillOpacity: 0.85
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>🔌 Grid Infrastructure</h3>
                <p><strong>{asset.name}</strong></p>
                <p>Type: {asset.type.replace('_', ' ')}</p>
                <p>Voltage: {asset.voltage} kV</p>
                <p>Operator: {asset.operator}</p>
                <p>Reliability: SAIDI {asset.saidi}, SAIFI {asset.saifi}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showSprSites && sprSites.map((site, idx) => (
          <CircleMarker
            key={`spr-${site.name}-${idx}`}
            center={site.location}
            radius={8}
            pathOptions={{
              fillColor: '#dc2626',
              color: '#991b1b',
              weight: 2,
              fillOpacity: 0.9
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>🛡️ Strategic Petroleum Reserve</h3>
                <p><strong>{site.name}</strong></p>
                <p>Fill Level: {site.fillLevel}</p>
                <p>Capacity: {site.capacity}</p>
                <p>Total SPR Capacity: 714 million barrels</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {activeChoroplethLayer && (
        <div className="map-legend-enhanced">
          <div className="legend-title">County Readiness Pressure</div>
          <div className="legend-list">
            <div className="legend-item-row">
              <div
                className="legend-color-box"
                style={{ backgroundColor: getColor(10, activeChoroplethLayer.id) }}
              />
              <span>Low Pressure (0-25)</span>
            </div>
            <div className="legend-item-row">
              <div
                className="legend-color-box"
                style={{ backgroundColor: getColor(35, activeChoroplethLayer.id) }}
              />
              <span>Moderate Pressure (25-50)</span>
            </div>
            <div className="legend-item-row">
              <div
                className="legend-color-box"
                style={{ backgroundColor: getColor(65, activeChoroplethLayer.id) }}
              />
              <span>High Pressure (50-75)</span>
            </div>
            <div className="legend-item-row">
              <div
                className="legend-color-box"
                style={{ backgroundColor: getColor(90, activeChoroplethLayer.id) }}
              />
              <span>Critical Pressure (75-100)</span>
            </div>
          </div>
        </div>
      )}

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
            <h4>AI Forecast to 2050</h4>
            <p><strong>Forecast Score:</strong> {getForecastScore(selectedCounty).toFixed(1)}/100</p>
            <p><strong>Forecast Level:</strong> {getForecastLevel(getForecastScore(selectedCounty))}</p>
            <p><strong>Forecast Window:</strong> {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="map-sidebar-section">
            <h4>County-Level Pricing Guidance</h4>
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
                ? '💡 New energy project recommended to strengthen local capacity.'
                : '💡 Monitor for future project pipeline opportunities.'}
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
    </div>
  )
}

export default RealMapView
