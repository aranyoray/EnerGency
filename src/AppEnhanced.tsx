/**
 * EnerGency - Enhanced Emergency Preparedness Dashboard
 * Interactive map with disaster preparedness metrics and energy management insights
 */

import { useState } from 'react'
import RealMapView from './components/RealMapView'
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
            Rapid Energy Access for Natural Emergencies with AI-Driven Dynamic Pricing
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
              EnerGency maps energy emergencies, migration patterns, and disaster risks into one
              AI-powered view so local leaders can anticipate grid stress and act before outages
              occur. The system is designed to support human decision-making, not replace it.
            </p>
          </div>

          <div className="info-card">
            <h3>📈 Available Metrics</h3>
            <ul className="metrics-list">
              <li><strong>Natural Disasters:</strong> Storm events, FEMA declarations, damage estimates</li>
              <li><strong>Energy Reliability:</strong> Demand load, stress scores, and capacity pressure</li>
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
              <li>Use the <strong>time slider</strong> to view forecast windows</li>
              <li>Enable <strong>AI Forecast</strong> layers for 12-month outlooks</li>
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
            <h3>🤖 AI Forecast & Scenario Planning</h3>
            <ul className="sources-list">
              <li>Use the forecast slider to simulate seasonal demand shifts</li>
              <li>Highlight AI forecast hotspots for proactive response</li>
              <li>Compare disaster exposure against projected stress levels</li>
              <li>Align mitigation plans with predicted risk windows</li>
              <li>Extend projections through 2050 for long-range planning</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>💵 Dynamic Pricing Strategy</h3>
            <p>
              EnerGency recommends targeted, time-based pricing signals to reduce peak demand
              when forecast risk is rising. Small pricing adjustments help shift industrial and
              automated loads without requiring major infrastructure rebuilds.
            </p>
          </div>

          <div className="info-card">
            <h3>⚡ 2050 Project & Storage Recommendations</h3>
            <p>
              Forecast layers flag candidate locations for new energy projects (⚡) and
              energy storage sites (🔋) to improve disaster preparedness. These suggestions
              help planners prioritize resilient generation and battery-backed microgrids.
            </p>
          </div>

          <div className="info-card">
            <h3>🧪 Validation & Learning</h3>
            <p>
              AI outputs are reviewed in a human-in-the-loop workflow and aligned against known
              events. A 2025 survey (n=79) across eight counties highlighted dynamic pricing as
              the most useful feature and informed the new click-to-view details sidebar.
            </p>
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
          />
        </div>
      </div>

      <footer className="app-footer">
        <p>
          EnerGency by Ekaansh Ravuri | Built with transparent public data for local leaders |{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default AppEnhanced
