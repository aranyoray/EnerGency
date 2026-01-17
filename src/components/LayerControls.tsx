/**
 * Layer Controls Component
 * Interactive checkboxes for toggling different map layers
 */

import { useState } from 'react'
import { MapLayerConfig } from '../types/emergencyMetrics'
import './LayerControls.css'

interface LayerControlsProps {
  layers: MapLayerConfig[]
  onLayerToggle: (layerId: string, enabled: boolean) => void
  featuredLayerIds?: string[]
}

const LayerControls = ({ layers, onLayerToggle, featuredLayerIds = [] }: LayerControlsProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [emergencyOpen, setEmergencyOpen] = useState(true)
  const [energyOpen, setEnergyOpen] = useState(true)
  const emergencyLayers = layers.filter(layer => layer.category !== 'energy')
  const energyLayers = layers.filter(layer => layer.category === 'energy')
  const layerDescriptions: Record<string, string> = {
    'county-choropleth': 'Baseline readiness pressure by county.',
    'forecast-pressure': 'AI-assisted outlook using seasonal + trend signals through 2050.',
    'disaster-stress': 'Historical disaster exposure and emergency declarations.',
    'energy-reliability': 'Counties with elevated grid stress and reliability risks.',
    'recovery-needs': 'Areas needing disaster recovery attention.',
    'infrastructure-priority': 'Hospitals, schools, and critical infrastructure hotspots.',
    'county-pricing': 'County-level pricing signals to reduce peak demand.',
    'manufacturing-hubs': 'High industrial and data center load centers.',
    'agriculture-supply': 'Food and agriculture supply chain protection zones.',
    'water-systems': 'Water treatment and pump reliability risks.',
    'first-responders': 'First responder and hospital support hubs.',
    'new-projects': 'Suggested new generation projects by 2050.',
    'storage-sites': 'Suggested storage sites for disaster readiness.',
    'nightlight-points': 'Nighttime satellite energy activity points.',
    'top-stressed': 'Highest priority counties for immediate action.'
  }

  const renderLayer = (layer: MapLayerConfig) => (
    <label key={layer.id} className="layer-control-item">
      <input
        type="checkbox"
        checked={layer.enabled}
        onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
      />
      <span className="layer-name">{layer.name}</span>
      <span className="layer-info-icon" title={layerDescriptions[layer.id] || 'Layer details'}>
        i
      </span>
      {layer.color && (
        <span
          className="layer-color-indicator"
          style={{ backgroundColor: layer.color }}
        />
      )}
    </label>
  )

  return (
    <div className="layer-controls">
      <div className="layer-controls-header" onClick={() => setCollapsed(!collapsed)}>
        <h3>Map Layers</h3>
        <button className="collapse-button">
          {collapsed ? '▼' : '▲'}
        </button>
      </div>

      {!collapsed && (
        <div className="layer-controls-content">
          <div className="layer-controls-section">
            <button
              type="button"
              className="layer-controls-accordion"
              onClick={() => setEmergencyOpen(prev => !prev)}
            >
              <span>Emergency metrics</span>
              <span className="accordion-icon">{emergencyOpen ? '▲' : '▼'}</span>
            </button>
            {emergencyOpen && (
              <div className="layer-controls-group">
                {emergencyLayers.map(renderLayer)}
                <div className="layer-controls-note">Emergency predictions</div>
              </div>
            )}
          </div>

          <div className="layer-controls-section">
            <button
              type="button"
              className="layer-controls-accordion"
              onClick={() => setEnergyOpen(prev => !prev)}
            >
              <span>Energy metrics</span>
              <span className="accordion-icon">{energyOpen ? '▲' : '▼'}</span>
            </button>
            {energyOpen && (
              <div className="layer-controls-group">
                {energyLayers.map(renderLayer)}
                <div className="layer-controls-note">Energy predictions</div>
              </div>
            )}
          </div>
          {featuredLayerIds.length > 0 && (
            <div className="layer-controls-section">
              <div className="layer-controls-title">Pinned overlays</div>
              {layers.filter(layer => featuredLayerIds.includes(layer.id)).map(renderLayer)}
            </div>
          )}
          {featuredLayerIds.length === 0 && energyLayers.length === 0 && (
            <div className="layer-controls-section">
              <button
                type="button"
                className="layer-controls-empty"
                disabled
              >
                No energy overlays available
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LayerControls
