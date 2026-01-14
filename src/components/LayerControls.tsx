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
  const featuredLayers = layers.filter(layer => featuredLayerIds.includes(layer.id))
  const standardLayers = layers.filter(layer => !featuredLayerIds.includes(layer.id))

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
          {featuredLayers.length > 0 && (
            <div className="layer-controls-section">
              <div className="layer-controls-title">2050 Overlays</div>
              {featuredLayers.map(layer => (
                <label key={layer.id} className="layer-control-item">
                  <input
                    type="checkbox"
                    checked={layer.enabled}
                    onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                  />
                  <span className="layer-name">{layer.name}</span>
                  {layer.color && (
                    <span
                      className="layer-color-indicator"
                      style={{ backgroundColor: layer.color }}
                    />
                  )}
                </label>
              ))}
            </div>
          )}
          <div className="layer-controls-section">
            {standardLayers.map(layer => (
              <label key={layer.id} className="layer-control-item">
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                />
                <span className="layer-name">{layer.name}</span>
                {layer.color && (
                  <span
                    className="layer-color-indicator"
                    style={{ backgroundColor: layer.color }}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LayerControls
