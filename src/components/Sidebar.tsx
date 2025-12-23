import { useState } from 'react'
import { IndicatorCategory, GeographicContext } from '../App'
import IndicatorNav from './IndicatorNav'
import GeographicSelector from './GeographicSelector'
import './Sidebar.css'

interface SidebarProps {
  selectedIndicator: IndicatorCategory
  onIndicatorChange: (indicator: IndicatorCategory) => void
  geoContext: GeographicContext
  onGeoContextChange: (context: GeographicContext) => void
  mapBoundaries: 'Tract' | 'County' | 'State'
  onMapBoundariesChange: (boundaries: 'Tract' | 'County' | 'State') => void
  reportBoundaries: 'Tract' | 'County' | 'State'
  onReportBoundariesChange: (boundaries: 'Tract' | 'County' | 'State') => void
}

const Sidebar = ({
  selectedIndicator,
  onIndicatorChange,
  geoContext,
  onGeoContextChange,
  mapBoundaries,
  onMapBoundariesChange,
  reportBoundaries,
  onReportBoundariesChange,
}: SidebarProps) => {
  const [showInfo, setShowInfo] = useState(true)

  const getIndicatorDescription = () => {
    const descriptions: Record<IndicatorCategory, string> = {
      'Overall Energy Access': 'Comprehensive measure of a community\'s access to reliable, affordable, and sustainable energy.',
      'Electricity Access': 'Percentage of households with reliable electricity service and grid connectivity.',
      'Energy Affordability': 'Measure of energy costs relative to household income and energy burden.',
      'Energy Reliability': 'Frequency and duration of power outages and energy service disruptions.',
      'Renewable Energy': 'Availability and adoption of renewable energy sources and clean energy infrastructure.',
      'Energy Infrastructure': 'Quality and capacity of energy generation, transmission, and distribution systems.',
      'Energy Burden': 'Percentage of household income spent on energy costs.'
    }
    return descriptions[selectedIndicator]
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {showInfo && (
          <div className="info-banner">
            <div className="info-header">
              <h2>{selectedIndicator}</h2>
              <button 
                className="close-button"
                onClick={() => setShowInfo(false)}
                aria-label="Close info"
              >
                ×
              </button>
            </div>
            <p className="info-description">{getIndicatorDescription()}</p>
          </div>
        )}

        <div className="sidebar-section">
          <h3 className="section-title">Indicator Navigation</h3>
          <IndicatorNav
            selectedIndicator={selectedIndicator}
            onSelect={onIndicatorChange}
          />
        </div>

        <div className="sidebar-section">
          <h3 className="section-title">Geographic Context</h3>
          <GeographicSelector
            geoContext={geoContext}
            onGeoContextChange={onGeoContextChange}
            mapBoundaries={mapBoundaries}
            onMapBoundariesChange={onMapBoundariesChange}
            reportBoundaries={reportBoundaries}
            onReportBoundariesChange={onReportBoundariesChange}
          />
        </div>

        <div className="sidebar-footer">
          <p className="footer-text">
            Pulling in energy access data to rank more than 70,000 U.S. Census tracts, 
            the U.S. Energy Access Index helps you see which communities face the greatest 
            challenges accessing reliable, affordable, and sustainable energy.
          </p>
          <div className="footer-links">
            <a href="#" className="footer-link">Explore the Data</a>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

