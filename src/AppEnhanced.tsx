/**
 * EnerGency - Enhanced Emergency Preparedness Dashboard
 * Interactive map with disaster preparedness metrics and energy management insights
 */

import { useState } from 'react'
import RealMapView from './components/RealMapView'
import LayerControls from './components/LayerControls'
import { MapLayerConfig } from './types/emergencyMetrics'
import './App.css'
import './AppEnhanced.css'

export type GeographicLevel = 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'

function AppEnhanced() {
  const [geoLevel, setGeoLevel] = useState<GeographicLevel>('county')
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined)
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
      id: 'forecast-pressure',
      name: 'AI Forecast (12-Month Outlook)',
      enabled: false,
      type: 'choropleth',
      dataKey: 'overallStressScore',
      color: '#1d4ed8'
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
      id: 'energy-reliability',
      name: 'Energy Reliability Watchlist',
      enabled: false,
      type: 'symbols',
      dataKey: 'energyStressScore',
      color: '#2563eb',
      icon: '⚡'
    },
    {
      id: 'recovery-needs',
      name: 'Disaster Recovery Needs',
      enabled: false,
      type: 'symbols',
      dataKey: 'disasterStressScore',
      color: '#f97316',
      icon: '🛠️'
    },
    {
      id: 'infrastructure-priority',
      name: 'Critical Infrastructure Safeguards',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#7c3aed',
      icon: '🏥'
    },
    {
      id: 'pricing-consumers',
      name: 'AI-driven Pricing for Consumers',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#16a34a',
      icon: '💵'
    },
    {
      id: 'new-projects',
      name: 'New Energy Projects (⚡)',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#facc15',
      icon: '⚡'
    },
    {
      id: 'storage-sites',
      name: 'Energy Storage Sites (🔋)',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#22c55e',
      icon: '🔋'
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

  const states = [
    'All States', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI',
    'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
    'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA',
    'WA', 'WV', 'WI', 'WY'
  ]

  return (
    <div className="app">
      <header className="app-header-enhanced">
        <div className="header-content">
          <h1>🇺🇸 EnerGency</h1>
          <p className="header-subtitle">
            American Energy Resilience & Community Readiness
          </p>
        </div>
        <div className="header-controls">
          <div className="control-group">
            <label>Geographic Level:</label>
            <select
              value={geoLevel}
              onChange={(e) => setGeoLevel(e.target.value as GeographicLevel)}
              className="select-control"
            >
              <option value="state">State</option>
              <option value="county">County</option>
              <option value="city">City</option>
              <option value="zip-code">ZIP Code</option>
              <option value="census-tract">Census Tract</option>
            </select>
          </div>
          <div className="control-group">
            <label>State:</label>
            <select
              value={selectedState || 'All States'}
              onChange={(e) => setSelectedState(e.target.value === 'All States' ? undefined : e.target.value)}
              className="select-control"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="app-content-enhanced">
        <div className="info-panel">
          <div className="info-card">
            <h3>👤 Project Lead</h3>
            <p>
              Ekaansh Ravuri, 15 | Chicago, IL
            </p>
          </div>

          <div className="info-card">
            <h3>📊 About This Dashboard</h3>
            <p>
              EnerGency delivers clear, accountable readiness insights for communities across
              America. Measure disaster exposure, infrastructure strength, and energy
              independence to support local decision-making and responsible stewardship.
            </p>
          </div>

          <div className="info-card layer-controls-panel">
            <LayerControls
              layers={layers}
              onLayerToggle={handleLayerToggle}
              featuredLayerIds={['new-projects', 'storage-sites']}
            />
          </div>

          <div className="info-card">
            <h3>📈 Available Metrics</h3>
            <ul className="metrics-list">
              <li><strong>Natural Disasters:</strong> Storm events, FEMA declarations, damage estimates</li>
              <li><strong>Energy Independence:</strong> Local capacity, reliability, and demand load</li>
              <li><strong>Household Burden:</strong> Share of income spent on power</li>
              <li><strong>Community Stability:</strong> Migration trends and local retention</li>
              <li><strong>Critical Infrastructure:</strong> Exposure for schools, hospitals, and services</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🧭 Problem Statement</h3>
            <p>
              Extreme weather and rapid population shifts create localized demand spikes that
              overwhelm a grid built for more predictable patterns. Without early forecasting,
              communities face blackouts, delayed response, and costly recoveries.
            </p>
          </div>

          <div className="info-card">
            <h3>🎯 How to Use</h3>
            <ul className="usage-list">
              <li>Toggle layers using the <strong>Map Layers</strong> panel</li>
              <li>Hover over areas to see detailed metrics</li>
              <li>Use the <strong>time slider</strong> to view trends over time</li>
              <li>⚠️ symbols mark priority attention areas</li>
              <li>Color intensity shows readiness severity</li>
            </ul>
          </div>

          <div className="info-card stress-levels">
            <h3>⚡ Readiness Levels</h3>
            <div className="stress-level" style={{ borderLeft: '4px solid #1d4ed8' }}>
              <strong>Low:</strong> Strong readiness and stable conditions
            </div>
            <div className="stress-level" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <strong>Moderate:</strong> Watch list, proactive planning advised
            </div>
            <div className="stress-level" style={{ borderLeft: '4px solid #f97316' }}>
              <strong>High:</strong> Elevated risk, readiness actions needed
            </div>
            <div className="stress-level" style={{ borderLeft: '4px solid #b91c1c' }}>
              <strong>Critical:</strong> Severe conditions, immediate action required
            </div>
          </div>

          <div className="info-card">
            <h3>🏛️ Community Priorities</h3>
            <ul className="sources-list">
              <li>Support first responders and critical services readiness</li>
              <li>Promote energy reliability and affordable household costs</li>
              <li>Strengthen local decision-making and accountability</li>
              <li>Protect families, farms, and small businesses</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>📚 Data Sources</h3>
            <ul className="sources-list">
              <li>NOAA Storm Events Database</li>
              <li>FEMA Disaster Declarations</li>
              <li>U.S. Energy Information Administration (EIA)</li>
              <li>U.S. Census Bureau Migration Data</li>
              <li>Department of Energy (DOE) LEAD Tool</li>
            </ul>
          </div>
        </div>

        <div className="map-container">
          <RealMapView
            geoLevel={geoLevel}
            selectedState={selectedState}
            layers={layers}
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>
          Built with transparent public data for local leaders and community members |{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default AppEnhanced
