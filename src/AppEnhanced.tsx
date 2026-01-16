/**
 * EnerGency - Enhanced Emergency Preparedness Dashboard
 * Interactive map with disaster preparedness metrics and energy management insights
 */

import { useEffect, useState } from 'react'
import RealMapView from './components/RealMapView'
import LayerControls from './components/LayerControls'
import { MapLayerConfig } from './types/emergencyMetrics'
import TimeSlider from './components/TimeSlider'
import './App.css'
import './AppEnhanced.css'

export type GeographicLevel = 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'

function AppEnhanced() {
  const [geoLevel, setGeoLevel] = useState<GeographicLevel>('county')
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined)
  const [currentDate, setCurrentDate] = useState(new Date(2030, 0, 1))
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDemoSteps, setShowDemoSteps] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [layers, setLayers] = useState<MapLayerConfig[]>([
    {
      id: 'county-choropleth',
      name: 'County Readiness Pressure',
      enabled: true,
      type: 'choropleth',
      dataKey: 'overallStressScore',
      color: '#b91c1c',
      category: 'emergency'
    },
    {
      id: 'forecast-pressure',
      name: 'AI Forecast (2020-2050 Outlook)',
      enabled: false,
      type: 'choropleth',
      dataKey: 'overallStressScore',
      color: '#1d4ed8',
      category: 'emergency'
    },
    {
      id: 'disaster-stress',
      name: 'Disaster Exposure Level',
      enabled: false,
      type: 'choropleth',
      dataKey: 'disasterStressScore',
      color: '#f97316',
      category: 'emergency'
    },
    {
      id: 'energy-reliability',
      name: 'Energy Reliability Watchlist',
      enabled: false,
      type: 'symbols',
      dataKey: 'energyStressScore',
      color: '#2563eb',
      icon: '⚡',
      category: 'energy'
    },
    {
      id: 'recovery-needs',
      name: 'Disaster Recovery Needs',
      enabled: false,
      type: 'symbols',
      dataKey: 'disasterStressScore',
      color: '#f97316',
      icon: '🛠️',
      category: 'emergency'
    },
    {
      id: 'infrastructure-priority',
      name: 'Critical Infrastructure Safeguards',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#7c3aed',
      icon: '🏥',
      category: 'emergency'
    },
    {
      id: 'county-pricing',
      name: 'County-Level Pricing Signals',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#0f766e',
      icon: '💵',
      category: 'energy'
    },
    {
      id: 'manufacturing-hubs',
      name: 'Manufacturing & Data Center Hubs',
      enabled: false,
      type: 'symbols',
      dataKey: 'energyStressScore',
      color: '#0f172a',
      icon: '🏭',
      category: 'energy'
    },
    {
      id: 'agriculture-supply',
      name: 'Agriculture & Food Supply Chains',
      enabled: false,
      type: 'symbols',
      dataKey: 'disasterStressScore',
      color: '#16a34a',
      icon: '🌾',
      category: 'emergency'
    },
    {
      id: 'water-systems',
      name: 'Water System Reliability Risks',
      enabled: false,
      type: 'symbols',
      dataKey: 'disasterStressScore',
      color: '#0284c7',
      icon: '💧',
      category: 'emergency'
    },
    {
      id: 'first-responders',
      name: 'First Responder & Hospital Hubs',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#7c3aed',
      icon: '🚓',
      category: 'emergency'
    },
    {
      id: 'new-projects',
      name: '2050 New Energy Projects 💡',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#facc15',
      icon: '💡',
      category: 'energy'
    },
    {
      id: 'storage-sites',
      name: '2050 Storage Sites 🔋',
      enabled: false,
      type: 'symbols',
      dataKey: 'overallStressScore',
      color: '#22c55e',
      icon: '🔋',
      category: 'energy'
    },
    {
      id: 'nightlight-points',
      name: 'Local Energy Activity',
      enabled: false,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#38bdf8',
      category: 'energy'
    },
    {
      id: 'top-stressed',
      name: 'Priority Action Counties (⚠️)',
      enabled: true,
      type: 'symbols',
      dataKey: 'isTopStressed',
      color: '#b91c1c',
      icon: '⚠️',
      category: 'emergency'
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const handleChange = () => setIsMobile(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="app">
      <header className="app-header-enhanced">
        <div className="header-top">
          <div className="header-content">
            <h1>🇺🇸 EnerGency</h1>
            <p className="header-subtitle">
              Energy Independence, Local Control, and Community Readiness
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
                <strong>Data Sources:</strong> FEMA, NOAA, EIA, Census, VIIRS
              </div>
            </div>
          )}
        </div>
        {!isMobile && (
          <div className="header-timeline">
            <div className="header-timeline-label">AI Timeline to 2035</div>
            <TimeSlider
              minDate={new Date(2020, 0, 1)}
              maxDate={new Date(2035, 11, 31)}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              isPlaying={isPlaying}
              onPlayToggle={setIsPlaying}
              stepSize="month"
              className="time-slider--inline"
            />
          </div>
        )}
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
              🚀 First-Time Demo
              <span className="info-icon" title="Start here for a quick guided tour.">i</span>
            </h3>
            <p className="demo-intro">
              Welcome! Tap the button to follow the student-made walkthrough.
            </p>
            <button
              type="button"
              className="demo-button"
              onClick={() => setShowDemoSteps(prev => !prev)}
            >
              {showDemoSteps ? 'Hide demo steps' : 'Show demo steps'}
            </button>
            {showDemoSteps && (
              <ol className="usage-list demo-list">
                <li>Pick a state and a level at the top.</li>
                <li>Turn on the 2050 overlays 💡 and 🔋.</li>
                <li>Slide the AI timeline to 2035.</li>
                <li>Click a county to see forecasts + readiness notes.</li>
              </ol>
            )}
          </div>

          <div className="info-card">
            <h3>
              🔐 Login + Map Guide
              <span className="info-icon" title="No account needed — start as a guest.">i</span>
            </h3>
            <p className="guide-line">
              <span className="shake-emoji" role="img" aria-label="waving hello">👋</span>
              Click <strong>Map Layers</strong> to turn features on, and use the <strong>AI timeline</strong> for the future view.
            </p>
            <div className="login-chip-row">
              <span className="login-chip">Guest Pass ✅</span>
              <span className="login-chip">Student View 🎒</span>
              <span className="login-chip">City Planner 🗺️</span>
            </div>
          </div>

          <div className="info-card">
            <LayerControls
              layers={layers}
              onLayerToggle={handleLayerToggle}
            />
          </div>

          <div className="info-card">
            <h3>
              🤖 AI Model Studio (Student-Built)
              <span className="info-icon" title="AI focus area and model lineup.">i</span>
            </h3>
            <p>
              Our AI forecast engine is the centerpiece. It blends weather risk, grid stress, and
              community data to make strong 2050-ready recommendations.
            </p>
            <ul className="metrics-list">
              <li><strong>Models used:</strong> Gradient boosting, trend + seasonal forecasting, spatial clustering</li>
              <li><strong>Signals:</strong> Disaster exposure, demand load, migration stability, infrastructure gaps</li>
              <li><strong>Outputs:</strong> Readiness pressure, project placement, storage need score</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>
              🧠 2050 Forecast & Recommendations
              <span className="info-icon" title="AI-assisted guidance for long-term investments.">i</span>
            </h3>
            <p>
              The forecast highlights counties that should prepare for new energy projects 💡
              and disaster-ready storage 🔋. Recommendations prioritize energy independence,
              resilient supply chains, and protection for seniors, veterans, and critical services.
            </p>
          </div>

          <div className="info-card">
            <h3>
              📚 Datasets & Sources
              <span className="info-icon" title="Public, transparent datasets used for AI training.">i</span>
            </h3>
            <ul className="sources-list">
              <li>NOAA Storm Events Database</li>
              <li>FEMA Disaster Declarations</li>
              <li>U.S. Energy Information Administration (EIA)</li>
              <li>U.S. Census Bureau Migration Data</li>
              <li>DOE LEAD Tool + VIIRS Nighttime Lights</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>
              📊 About This Dashboard
              <span className="info-icon" title="Designed for clear, common-sense planning.">i</span>
            </h3>
            <p>
              EnerGency delivers clear, accountable readiness insights for communities across
              America. Measure disaster exposure, infrastructure strength, and energy
              independence to support local decision-making, fiscal discipline, and
              responsible stewardship.
            </p>
          </div>

          <div className="info-card">
            <h3>
              📈 Available Metrics
              <span className="info-icon" title="Hover over counties for detailed metrics.">i</span>
            </h3>
            <ul className="metrics-list">
              <li><strong>Natural Disasters:</strong> Storm events, FEMA declarations, damage estimates</li>
              <li><strong>Energy Independence:</strong> Local capacity, reliability, and demand load</li>
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
              Extreme weather and rapid population shifts create localized demand spikes that
              overwhelm a grid built for more predictable patterns. Without early forecasting,
              communities face blackouts, delayed response, and costly recoveries.
            </p>
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
              🎯 How to Use
              <span className="info-icon" title="Clear steps for first-time users.">i</span>
            </h3>
            <ul className="usage-list">
              <li>Toggle layers using the <strong>Map Layers</strong> panel</li>
              <li>Hover over areas to see detailed metrics</li>
              <li>Use the <strong>AI timeline</strong> to view 2035 projections</li>
              <li>⚠️ symbols mark priority action areas</li>
              <li>Color intensity shows readiness severity</li>
            </ul>
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

          <div className="info-card faq-card">
            <h3>
              ❓ FAQ
              <span className="info-icon" title="Quick answers for first-time visitors.">i</span>
            </h3>
            <dl className="faq-list">
              <div>
                <dt>How is the AI forecast built?</dt>
                <dd>We combine disaster history, grid stress, and migration trends to model readiness pressure.</dd>
              </div>
              <div>
                <dt>Is this a real-time tool?</dt>
                <dd>It is a planning dashboard for preparedness, updated with public datasets.</dd>
              </div>
              <div>
                <dt>Can I use it without an account?</dt>
                <dd>Yes. Everyone can explore as a guest.</dd>
              </div>
              <div>
                <dt>What should I click first?</dt>
                <dd>Start with the AI timeline and 2050 overlays for a quick future-view demo.</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="map-container">
          <RealMapView
            geoLevel={geoLevel}
            selectedState={selectedState}
            layers={layers}
            currentDate={currentDate}
          />
          {isMobile && (
            <div className="timeline-mobile">
              <div className="timeline-mobile-label">AI Timeline to 2035</div>
              <TimeSlider
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2035, 11, 31)}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                isPlaying={isPlaying}
                onPlayToggle={setIsPlaying}
                stepSize="month"
                className="time-slider--inline"
              />
            </div>
          )}
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
