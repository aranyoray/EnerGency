/**
 * Enhanced Map View Component
 * Interactive map with emergency metrics, layer controls, time slider, and stress overlays
 */

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { EmergencyMetrics, MapLayerConfig } from '../types/emergencyMetrics'
import { fetchEmergencyMetrics, getTopStressedAreas } from '../services/emergencyMetricsAggregator'
import LayerControls from './LayerControls'
import TimeSlider from './TimeSlider'
import './EnhancedMapView.css'
import 'leaflet/dist/leaflet.css'

interface EnhancedMapViewProps {
  geoLevel: 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'
  selectedState?: string
}

const EnhancedMapView = ({ geoLevel, selectedState }: EnhancedMapViewProps) => {
  const [emergencyMetrics, setEmergencyMetrics] = useState<EmergencyMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))
  const [isPlaying, setIsPlaying] = useState(false)

  // Layer configurations
  const [layers, setLayers] = useState<MapLayerConfig[]>([
    {
      id: 'stress-gradient',
      name: 'Overall Stress Level',
      enabled: true,
      type: 'choropleth',
      dataKey: 'overallStressScore',
      color: '#ff6b6b'
    },
    {
      id: 'disaster-events',
      name: 'Natural Disaster Events',
      enabled: true,
      type: 'symbols',
      dataKey: 'stormEventsCount',
      color: '#ff922b',
      icon: '🌪️'
    },
    {
      id: 'cooling-costs',
      name: 'Cooling Costs',
      enabled: false,
      type: 'choropleth',
      dataKey: 'coolingCosts',
      color: '#ff6b6b'
    },
    {
      id: 'heating-costs',
      name: 'Heating Costs',
      enabled: false,
      type: 'choropleth',
      dataKey: 'heatingCosts',
      color: '#4dabf7'
    },
    {
      id: 'energy-burden',
      name: 'Energy Burden',
      enabled: false,
      type: 'choropleth',
      dataKey: 'totalEnergyBurden',
      color: '#f59f00'
    },
    {
      id: 'migration-stress',
      name: 'Migration Stress',
      enabled: false,
      type: 'choropleth',
      dataKey: 'migrationStressScore',
      color: '#845ef7'
    },
    {
      id: 'top-stressed',
      name: 'Top Stressed Areas',
      enabled: true,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#e03131',
      icon: '⚠️'
    }
  ])

  // Load emergency metrics
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const eiaApiKey = import.meta.env.VITE_EIA_API_KEY
        const metrics = await fetchEmergencyMetrics({
          state: selectedState,
          year: currentDate.getFullYear(),
          eiaApiKey
        })
        setEmergencyMetrics(metrics)
      } catch (error) {
        console.error('Error loading emergency metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedState, currentDate])

  const handleLayerToggle = (layerId: string, enabled: boolean) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, enabled } : layer
      )
    )
  }

  // Get color for choropleth based on value and layer
  const getColor = (value: number, layerId: string): string => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return '#cccccc'

    // Normalize value to 0-100 range
    let normalizedValue = value

    if (layerId === 'cooling-costs' || layerId === 'heating-costs') {
      normalizedValue = Math.min((value / 2000) * 100, 100)
    } else if (layerId === 'energy-burden') {
      normalizedValue = Math.min(value, 100)
    }

    // Color gradient based on intensity
    const colors = {
      'stress-gradient': ['#ffe8e8', '#ffa8a8', '#ff6b6b', '#f03e3e', '#c92a2a'],
      'cooling-costs': ['#fff5f5', '#ffc9c9', '#ff6b6b', '#e03131', '#c92a2a'],
      'heating-costs': ['#e7f5ff', '#a5d8ff', '#4dabf7', '#1c7ed6', '#1864ab'],
      'energy-burden': ['#fff9db', '#ffec99', '#ffd43b', '#fab005', '#f59f00'],
      'migration-stress': ['#f3f0ff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7']
    }

    const colorScale = colors[layerId as keyof typeof colors] || colors['stress-gradient']

    if (normalizedValue >= 80) return colorScale[4]
    if (normalizedValue >= 60) return colorScale[3]
    if (normalizedValue >= 40) return colorScale[2]
    if (normalizedValue >= 20) return colorScale[1]
    return colorScale[0]
  }

  // Get active choropleth layer
  const activeChoroplethLayer = layers.find(l => l.enabled && l.type === 'choropleth')

  // Style function for GeoJSON features
  const styleFeature = (metric: EmergencyMetrics) => {
    if (!activeChoroplethLayer) {
      return {
        fillColor: '#cccccc',
        weight: 1,
        opacity: 1,
        color: '#fff',
        fillOpacity: 0.5
      }
    }

    const value = metric[activeChoroplethLayer.dataKey] as number
    const fillColor = getColor(value, activeChoroplethLayer.id)

    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.7
    }
  }

  // Top stressed areas
  const topStressedAreas = getTopStressedAreas(emergencyMetrics, 50)
  const showTopStressed = layers.find(l => l.id === 'top-stressed')?.enabled || false

  // Render hover tooltip
  const renderTooltip = (metric: EmergencyMetrics) => {
    return (
      <div className="metric-tooltip">
        <h3>{metric.name}, {metric.state}</h3>
        <div className="metric-section">
          <h4>Emergency Preparedness Metrics</h4>
          <p><strong>Overall Stress Level:</strong> {metric.stressLevel}</p>
          <p><strong>Stress Score:</strong> {metric.overallStressScore.toFixed(1)}/100</p>
        </div>
        <div className="metric-section">
          <h4>Natural Disasters</h4>
          <p><strong>Storm Events:</strong> {metric.stormEventsCount}</p>
          <p><strong>FEMA Declarations:</strong> {metric.disasterDeclarationsCount}</p>
          <p><strong>Total Damage:</strong> ${(metric.totalStormDamage / 1000000).toFixed(1)}M</p>
        </div>
        <div className="metric-section">
          <h4>Energy Costs</h4>
          <p><strong>Cooling Costs:</strong> ${metric.coolingCosts.toFixed(0)}/year</p>
          <p><strong>Heating Costs:</strong> ${metric.heatingCosts.toFixed(0)}/year</p>
          <p><strong>Energy Burden:</strong> {metric.totalEnergyBurden.toFixed(1)}% of income</p>
        </div>
        <div className="metric-section">
          <h4>Population Movement</h4>
          <p><strong>Net Migration:</strong> {metric.netMigration > 0 ? '+' : ''}{metric.netMigration.toFixed(0)}</p>
          <p><strong>Migration Stress:</strong> {metric.migrationStressScore.toFixed(1)}/100</p>
        </div>
      </div>
    )
  }

  return (
    <div className="enhanced-map-view">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading emergency metrics...</div>
        </div>
      )}

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

        {/* Render county/area polygons with choropleth */}
        {emergencyMetrics.map((metric, idx) => (
          <CircleMarker
            key={`${metric.geoid}-${idx}`}
            center={[metric.latitude, metric.longitude]}
            radius={geoLevel === 'state' ? 15 : geoLevel === 'county' ? 8 : 5}
            pathOptions={styleFeature(metric)}
          >
            <Tooltip>
              {renderTooltip(metric)}
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Render top stressed area symbols */}
        {showTopStressed && topStressedAreas.map((metric, idx) => (
          <CircleMarker
            key={`stressed-${metric.geoid}-${idx}`}
            center={[metric.latitude, metric.longitude]}
            radius={10}
            pathOptions={{
              fillColor: '#e03131',
              color: '#c92a2a',
              weight: 2,
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div className="stress-popup">
                <h3>⚠️ High Stress Area</h3>
                <p><strong>{metric.name}, {metric.state}</strong></p>
                <p>Stress Level: {metric.stressLevel}</p>
                <p>Score: {metric.overallStressScore.toFixed(1)}/100</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <LayerControls
        layers={layers}
        onLayerToggle={handleLayerToggle}
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
        </div>
      )}
    </div>
  )
}

export default EnhancedMapView
