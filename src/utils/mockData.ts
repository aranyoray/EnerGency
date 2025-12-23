import { IndicatorCategory, GeographicContext } from '../App'

// Generate mock GeoJSON data for demonstration
export function generateMockGeoJson(
  indicator: IndicatorCategory,
  geoContext: GeographicContext,
  mapBoundaries: 'Tract' | 'County' | 'State'
) {
  // Mock state-level data for demonstration
  const mockStates = [
    { name: 'California', bounds: [[32.5, -124.5], [42.0, -114.0]], value: 85 },
    { name: 'Texas', bounds: [[25.8, -106.6], [36.5, -93.5]], value: 72 },
    { name: 'Florida', bounds: [[24.5, -87.6], [31.0, -80.0]], value: 78 },
    { name: 'New York', bounds: [[40.5, -79.8], [45.0, -71.8]], value: 88 },
    { name: 'Illinois', bounds: [[36.9, -91.5], [42.5, -87.0]], value: 82 },
    { name: 'Pennsylvania', bounds: [[39.7, -80.5], [42.3, -74.7]], value: 75 },
    { name: 'Ohio', bounds: [[38.4, -84.8], [42.0, -80.5]], value: 70 },
    { name: 'Georgia', bounds: [[30.4, -85.6], [35.0, -80.8]], value: 68 },
    { name: 'North Carolina', bounds: [[33.8, -84.3], [36.6, -75.4]], value: 73 },
    { name: 'Michigan', bounds: [[41.7, -90.4], [48.3, -82.4]], value: 80 },
  ]

  const features = mockStates.map((state, index) => {
    const [southWest, northEast] = state.bounds
    const [swLat, swLng] = southWest
    const [neLat, neLng] = northEast
    
    // Add some variation based on indicator
    const baseValue = state.value
    const variation = (index % 3 - 1) * 5 // -5, 0, or +5
    const value = Math.max(0, Math.min(100, baseValue + variation))

    return {
      type: 'Feature',
      properties: {
        name: state.name,
        value: value,
        indicator: indicator,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [swLng, swLat],
          [neLng, swLat],
          [neLng, neLat],
          [swLat, neLat],
          [swLng, swLat]
        ]]
      }
    }
  })

  return {
    type: 'FeatureCollection',
    features: features
  }
}

