/**
 * EnerGency - Enhanced Emergency Preparedness Dashboard
 * Interactive map with disaster preparedness metrics and energy management insights
 */

import { useState } from 'react'
import EnhancedMapView from './components/EnhancedMapView'
import './App.css'
import './AppEnhanced.css'

export type GeographicLevel = 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'

function AppEnhanced() {
  const [geoLevel, setGeoLevel] = useState<GeographicLevel>('county')
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined)

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
            Emergency Preparedness & Energy Management Dashboard
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
            <h3>📊 About This Dashboard</h3>
            <p>
              EnerGency provides comprehensive emergency preparedness metrics and energy
              management insights for communities across America. Track natural disaster
              risk, energy costs, population movements, and infrastructure resilience.
            </p>
          </div>

          <div className="info-card">
            <h3>📈 Available Metrics</h3>
            <ul className="metrics-list">
              <li><strong>Natural Disasters:</strong> Storm events, FEMA declarations, damage estimates</li>
              <li><strong>Cooling & Heating Costs:</strong> Annual energy expenses by region</li>
              <li><strong>Energy Burden:</strong> Percentage of income spent on energy</li>
              <li><strong>Population Movement:</strong> Migration patterns and community stability</li>
              <li><strong>Energy Demand:</strong> Grid load patterns over time</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>🎯 How to Use</h3>
            <ul className="usage-list">
              <li>Toggle layers using the <strong>Map Layers</strong> panel</li>
              <li>Hover over areas to see detailed metrics</li>
              <li>Use the <strong>time slider</strong> to view trends over time</li>
              <li>⚠️ symbols indicate top stressed areas</li>
              <li>Color intensity shows severity levels</li>
            </ul>
          </div>

          <div className="info-card stress-levels">
            <h3>⚡ Stress Levels</h3>
            <div className="stress-level" style={{ borderLeft: '4px solid #51cf66' }}>
              <strong>Low:</strong> Minimal risk, stable conditions
            </div>
            <div className="stress-level" style={{ borderLeft: '4px solid #ffd43b' }}>
              <strong>Moderate:</strong> Some concerns, monitoring recommended
            </div>
            <div className="stress-level" style={{ borderLeft: '4px solid #ff922b' }}>
              <strong>High:</strong> Significant challenges, preparedness advised
            </div>
            <div className="stress-level" style={{ borderLeft: '4px solid #e03131' }}>
              <strong>Critical:</strong> Severe conditions, immediate attention needed
            </div>
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
          <EnhancedMapView
            geoLevel={geoLevel}
            selectedState={selectedState}
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>
          Built with data from NOAA, FEMA, EIA, Census Bureau, and DOE |{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default AppEnhanced
