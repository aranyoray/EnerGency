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
}

const LayerControls = ({ layers, onLayerToggle }: LayerControlsProps) => {
  const [collapsed, setCollapsed] = useState(false)

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
          {layers.map(layer => (
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
    </div>
  )
}

export default LayerControls
