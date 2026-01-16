/**
 * EnerGency - Enhanced Emergency Preparedness Dashboard
 * Interactive map with disaster preparedness metrics and energy management insights
 */

import { useState } from 'react'
import RealMapView from './components/RealMapView'
import LayerControls from './components/LayerControls'
import { MapLayerConfig } from './types/emergencyMetrics'
import TimeSlider from './components/TimeSlider'
import './App.css'
import './AppEnhanced.css'

export type GeographicLevel = 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'

const PolicyBanner = () => (
  <div className="policy-banner">
    <div>
      <h1>🇺🇸 EnerGency - American Energy Dominance Dashboard</h1>
      <p>
        Supporting energy independence, grid reliability, and national security for every community.
      </p>
    </div>
    <div className="policy-banner-right">
      <div><strong>America First Energy Policy</strong></div>
      <div>Nuclear Renaissance | Fossil Fuel Development | Critical Minerals</div>
    </div>
  </div>
)

function AppEnhanced() {
  const [geoLevel, setGeoLevel] = useState<GeographicLevel>('county')
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined)
  const [currentDate, setCurrentDate] = useState(new Date(2030, 0, 1))
  const [isPlaying, setIsPlaying] = useState(false)
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
      id: 'nuclear-plants',
      name: 'Nuclear Power Plants',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#16a34a',
      icon: '☢️'
    },
    {
      id: 'fossil-infrastructure',
      name: 'Fossil Fuel Infrastructure',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#0f172a',
      icon: '🛢️'
    },
    {
      id: 'critical-minerals',
      name: 'Critical Minerals Deposits',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#f97316',
      icon: '⛏️'
    },
    {
      id: 'oil-gas-regions',
      name: 'Oil & Gas Production Regions',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#92400e',
      icon: '🏗️'
    },
    {
      id: 'grid-infrastructure',
      name: 'Energy Grid Infrastructure',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#2563eb',
      icon: '🔌'
    },
    {
      id: 'spr-sites',
      name: 'Strategic Petroleum Reserve Sites',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#dc2626',
      icon: '🛡️'
    },
    {
      id: 'forecast-pressure',
      name: 'AI Forecast (2020-2050 Outlook)',
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
      id: 'county-pricing',
      name: 'County-Level Pricing Signals',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#0f766e',
      icon: '💵'
    },
    {
      id: 'manufacturing-hubs',
      name: 'Manufacturing & Data Center Hubs',
      enabled: false,
      type: 'symbols',
      dataKey: 'energyStressScore',
      color: '#0f172a',
      icon: '🏭'
    },
    {
      id: 'agriculture-supply',
      name: 'Agriculture & Food Supply Chains',
      enabled: false,
      type: 'symbols',
      dataKey: 'disasterStressScore',
      color: '#16a34a',
      icon: '🌾'
    },
    {
      id: 'water-systems',
      name: 'Water System Reliability Risks',
      enabled: false,
      type: 'symbols',
      dataKey: 'disasterStressScore',
      color: '#0284c7',
      icon: '💧'
    },
    {
      id: 'first-responders',
      name: 'First Responder & Hospital Hubs',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#7c3aed',
      icon: '🚓'
    },
    {
      id: 'new-projects',
      name: '2050 New Energy Projects 💡',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#facc15',
      icon: '💡'
    },
    {
      id: 'storage-sites',
      name: '2050 Storage Sites 🔋',
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

  const activeChoroplethLayer = layers.find(layer => layer.enabled && layer.type === 'choropleth')

  const getLegendColor = (value: number, layerId?: string) => {
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

  return (
    <div className="app">
      <header className="app-header-enhanced">
        <PolicyBanner />
        <div className="header-top">
          <div className="header-content">
            <h1>EnerGency: American Energy Dominance & Emergency Preparedness</h1>
            <p className="header-subtitle">
              Ensuring energy security and community resilience across America.
            </p>
          </div>
          {activeChoroplethLayer && (
            <div className="header-legend">
              <div className="legend-title">{activeChoroplethLayer.name}</div>
              <div className="legend-gradient">
                <div className="legend-gradient-bar" style={{
                  background: `linear-gradient(to right, ${getLegendColor(0, activeChoroplethLayer.id)}, ${getLegendColor(50, activeChoroplethLayer.id)}, ${getLegendColor(100, activeChoroplethLayer.id)})`
                }} />
                <div className="legend-gradient-labels">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              <div className="legend-metadata">
                <strong>Forecast Date:</strong> {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className="legend-metadata">
                <strong>Data Sources:</strong> FEMA, NOAA, EIA, NRC, USGS, Census
              </div>
            </div>
          )}
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
            <h3>
              ▶️ Quick Demo Tour
              <span className="info-icon" title="Follow these steps for a guided walkthrough.">i</span>
            </h3>
            <ol className="usage-list demo-list">
              <li>Choose a state and geographic level above.</li>
              <li>Turn on the 2050 overlays for projects 💡 and storage 🔋.</li>
              <li>Slide the AI timeline to see 2050 projections.</li>
              <li>Click a county to see forecast + readiness details.</li>
            </ol>
          </div>

          <div className="info-card">
            <h3>
              🎯 Administration Energy Goals
            </h3>
            <ul className="metrics-list">
              <li>✅ Expand nuclear capacity from 100 GW to 400 GW by 2050</li>
              <li>✅ Achieve total energy independence from foreign sources</li>
              <li>✅ Secure domestic critical minerals supply chains</li>
              <li>✅ Restore American manufacturing through affordable energy</li>
              <li>✅ Ensure grid reliability with reliable, dispatchable power</li>
            </ul>
            <h3 className="section-spacing">📊 Current Achievements (2025)</h3>
            <ul className="metrics-list">
              <li>🛢️ Record oil production: 24.2M barrels/day</li>
              <li>⛽ Gas prices at 4-year low: ~$2.90/gallon</li>
              <li>⚡ 11 advanced nuclear reactors in development</li>
              <li>🏭 $800M in SMR funding deployed</li>
            </ul>
          </div>

          <div className="info-card">
            <LayerControls
              layers={layers}
              onLayerToggle={handleLayerToggle}
              featuredLayerIds={['new-projects', 'storage-sites']}
            />
          </div>

          <div className="info-card">
            <h3>
              🗓️ AI Timeline to 2050
              <span className="info-icon" title="Move the slider to simulate future readiness conditions.">i</span>
            </h3>
            <p>
              This timeline projects readiness pressure, pricing signals, and investment needs through 2050.
              Move the slider or hit play to watch the AI forecast evolve.
            </p>
            <TimeSlider
              minDate={new Date(2020, 0, 1)}
              maxDate={new Date(2050, 11, 31)}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              isPlaying={isPlaying}
              onPlayToggle={setIsPlaying}
              stepSize="month"
            />
          </div>

          <div className="info-card">
            <h3>
              🧠 2050 Forecast & Recommendations
              <span className="info-icon" title="AI-assisted guidance for long-term investments.">i</span>
            </h3>
            <p>
              The forecast highlights counties that should prepare for new energy projects 💡
              and disaster-ready storage 🔋. Recommendations prioritize energy independence,
              reliable baseload power, resilient supply chains, and protection for critical services.
            </p>
          </div>

          <div className="info-card">
            <h3>
              📊 About This Dashboard
              <span className="info-icon" title="Designed for clear, common-sense planning.">i</span>
            </h3>
            <p>
              EnerGency provides actionable intelligence on energy infrastructure resilience,
              emergency preparedness, and America&apos;s path to energy dominance. Built with real
              data from FEMA, NOAA, and federal energy agencies to support reliable, affordable
              energy for every American community.
            </p>
          </div>

          <div className="info-card">
            <h3>
              👤 Project Lead
              <span className="info-icon" title="Student-led civic technology initiative.">i</span>
            </h3>
            <p>
              Ekaansh Ravuri, 16 | Chicago, IL
            </p>
          </div>

          <div className="info-card">
            <h3>
              📈 Available Metrics
              <span className="info-icon" title="Hover over counties for detailed metrics.">i</span>
            </h3>
            <ul className="metrics-list">
              <li><strong>Natural Disasters:</strong> Storm events, FEMA declarations, damage estimates</li>
              <li><strong>Energy Independence:</strong> Domestic capacity, reliability, and demand load</li>
              <li><strong>Household Burden:</strong> Share of income spent on power</li>
              <li><strong>Community Stability:</strong> Migration trends and local retention</li>
              <li><strong>Critical Infrastructure:</strong> Exposure for schools, hospitals, and services</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>
              🧭 Problem Statement
              <span className="info-icon" title="Why the tool matters for emergency readiness.">i</span>
            </h3>
            <p>
              Severe weather and rapid population shifts create localized demand spikes that
              stress critical infrastructure. Without early forecasting and reliable baseload power,
              communities face outages, delayed response, and costly recoveries.
            </p>
          </div>

          <div className="info-card">
            <h3>
              🎯 How to Use
              <span className="info-icon" title="Clear steps for first-time users.">i</span>
            </h3>
            <ul className="usage-list">
              <li>Toggle layers using the <strong>Map Layers</strong> panel</li>
              <li>Hover over areas to see detailed metrics</li>
              <li>Use the <strong>AI timeline</strong> to view 2050 projections</li>
              <li>⚠️ symbols mark priority action areas</li>
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
            <h3>
              🏛️ Community Priorities
              <span className="info-icon" title="Focus on families, farms, and local jobs.">i</span>
            </h3>
            <ul className="sources-list">
              <li>Support first responders, veterans, and critical services</li>
              <li>Protect families, farms, and small businesses</li>
              <li>Promote energy reliability with fair household costs</li>
              <li>Strengthen local control and public accountability</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>
              📚 Data Sources
              <span className="info-icon" title="All sources are public and transparent.">i</span>
            </h3>
            <ul className="sources-list">
              <li>NOAA Storm Events Database</li>
              <li>FEMA Disaster Declarations</li>
              <li>U.S. Energy Information Administration (EIA)</li>
              <li>Nuclear Regulatory Commission (NRC) Reactor Data</li>
              <li>U.S. Geological Survey (USGS) Critical Minerals</li>
              <li>U.S. Census Bureau Migration Data</li>
              <li>Department of Energy (DOE) Energy Infrastructure Data</li>
            </ul>
          </div>
        </div>

        <div className="map-container">
          <RealMapView
            geoLevel={geoLevel}
            selectedState={selectedState}
            layers={layers}
            currentDate={currentDate}
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
