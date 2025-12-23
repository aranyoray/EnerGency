import { GeographicContext } from '../App'
import './GeographicSelector.css'

interface GeographicSelectorProps {
  geoContext: GeographicContext
  onGeoContextChange: (context: GeographicContext) => void
  mapBoundaries: 'Tract' | 'County' | 'State'
  onMapBoundariesChange: (boundaries: 'Tract' | 'County' | 'State') => void
  reportBoundaries: 'Tract' | 'County' | 'State'
  onReportBoundariesChange: (boundaries: 'Tract' | 'County' | 'State') => void
}

const GeographicSelector = ({
  geoContext,
  onGeoContextChange,
  mapBoundaries,
  onMapBoundariesChange,
  reportBoundaries,
  onReportBoundariesChange,
}: GeographicSelectorProps) => {
  const geoContextOptions: GeographicContext[] = ['State', 'County', 'Census Tract', 'Region']
  const boundaryOptions: ('Tract' | 'County' | 'State')[] = ['Tract', 'County', 'State']

  return (
    <div className="geographic-selector">
      <div className="selector-group">
        <label className="selector-label">Select an area below to focus the map</label>
        <div className="selector-options">
          {geoContextOptions.map((option) => (
            <button
              key={option}
              className={`selector-option ${
                geoContext === option ? 'active' : ''
              }`}
              onClick={() => onGeoContextChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {geoContext !== 'Census Tract' && (
          <p className="selector-note">
            * {geoContext} values above represent the median of all tracts within that {geoContext.toLowerCase()}
          </p>
        )}
      </div>

      <div className="selector-group">
        <label className="selector-label">Map Boundaries</label>
        <select
          className="selector-select"
          value={mapBoundaries}
          onChange={(e) => onMapBoundariesChange(e.target.value as 'Tract' | 'County' | 'State')}
        >
          {boundaryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="selector-group">
        <label className="selector-label">Report Boundaries</label>
        <select
          className="selector-select"
          value={reportBoundaries}
          onChange={(e) => onReportBoundariesChange(e.target.value as 'Tract' | 'County' | 'State')}
        >
          {boundaryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default GeographicSelector

