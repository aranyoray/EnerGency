import { IndicatorCategory } from '../App'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './IndicatorNav.css'

interface IndicatorNavProps {
  selectedIndicator: IndicatorCategory
  onSelect: (indicator: IndicatorCategory) => void
}

const indicators: IndicatorCategory[] = [
  'Overall Energy Access',
  'Electricity Access',
  'Energy Affordability',
  'Energy Reliability',
  'Renewable Energy',
  'Energy Infrastructure',
  'Energy Burden'
]

const IndicatorNav = ({ selectedIndicator, onSelect }: IndicatorNavProps) => {
  const currentIndex = indicators.indexOf(selectedIndicator)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < indicators.length - 1

  const handlePrev = () => {
    if (canGoPrev) {
      onSelect(indicators[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onSelect(indicators[currentIndex + 1])
    }
  }

  return (
    <div className="indicator-nav">
      <div className="indicator-nav-header">
        <button
          className="nav-button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous indicator"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="indicator-counter">
          {currentIndex + 1} / {indicators.length}
        </span>
        <button
          className="nav-button"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next indicator"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="indicator-list">
        {indicators.map((indicator) => (
          <button
            key={indicator}
            className={`indicator-item ${
              selectedIndicator === indicator ? 'active' : ''
            }`}
            onClick={() => onSelect(indicator)}
          >
            {indicator}
          </button>
        ))}
      </div>
    </div>
  )
}

export default IndicatorNav

