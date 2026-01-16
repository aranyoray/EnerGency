/**
 * Time Slider Component
 * Interactive slider for navigating through time-series energy demand data
 */

import { useState, useEffect } from 'react'
import './TimeSlider.css'

interface TimeSliderProps {
  minDate: Date
  maxDate: Date
  currentDate: Date
  onDateChange: (date: Date) => void
  isPlaying?: boolean
  onPlayToggle?: (playing: boolean) => void
  stepSize?: 'hour' | 'day' | 'week' | 'month'
  className?: string
}

const TimeSlider = ({
  minDate,
  maxDate,
  currentDate,
  onDateChange,
  isPlaying = false,
  onPlayToggle,
  stepSize = 'day',
  className
}: TimeSliderProps) => {
  const [playing, setPlaying] = useState(isPlaying)

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      const nextDate = new Date(currentDate)

      switch (stepSize) {
        case 'hour':
          nextDate.setHours(nextDate.getHours() + 1)
          break
        case 'day':
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case 'week':
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case 'month':
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
      }

      if (nextDate > maxDate) {
        setPlaying(false)
        onPlayToggle?.(false)
        onDateChange(minDate)
      } else {
        onDateChange(nextDate)
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [playing, currentDate, stepSize, maxDate, minDate, onDateChange, onPlayToggle])

  const handlePlayToggle = () => {
    const newPlaying = !playing
    setPlaying(newPlaying)
    onPlayToggle?.(newPlaying)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const totalMs = maxDate.getTime() - minDate.getTime()
    const newDate = new Date(minDate.getTime() + (totalMs * value) / 100)
    onDateChange(newDate)
  }

  const getCurrentPercentage = () => {
    const totalMs = maxDate.getTime() - minDate.getTime()
    const currentMs = currentDate.getTime() - minDate.getTime()
    return (currentMs / totalMs) * 100
  }

  const formatDate = (date: Date) => {
    switch (stepSize) {
      case 'hour':
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          hour12: true
        })
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      case 'week':
      case 'month':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })
    }
  }

  return (
    <div className={`time-slider${className ? ` ${className}` : ''}`}>
      <div className="time-slider-header">
        <button
          className="play-button"
          onClick={handlePlayToggle}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div className="time-display">
          {formatDate(currentDate)}
        </div>
      </div>

      <div className="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={getCurrentPercentage()}
          onChange={handleSliderChange}
          className="slider"
        />
        <div className="slider-labels">
          <span className="slider-label">{formatDate(minDate)}</span>
          <span className="slider-label">{formatDate(maxDate)}</span>
        </div>
      </div>
    </div>
  )
}

export default TimeSlider
