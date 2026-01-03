/**
 * Nighttime Light Data Service (Real Data)
 * Loads and processes nighttime satellite light intensity data from enerwatch
 */

export interface NightlightFeature {
  type: 'Feature'
  properties: {
    name: string
    state: string
    intensity: number // 0-1 scale
    population: number
    category: string
    energyMW: number
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [lon, lat]
  }
}

export interface NightlightCollection {
  type: 'FeatureCollection'
  metadata: {
    title: string
    description: string
    source: string
    year: number
    totalLocations: number
    categoryBreakdown: Record<string, number>
    intensityPercentiles: Record<string, number>
    generatedDate: string
  }
  features: NightlightFeature[]
}

export interface CountyEnergyFeature {
  type: 'Feature'
  properties: {
    name: string
    state: string
    fips: string
    avgIntensity: number
    citiesCount: number
    totalPopulation: number
    totalEnergyMW: number
    percentile: number
    percentileCategory: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface CountyEnergyCollection {
  type: 'FeatureCollection'
  metadata: {
    title: string
    description: string
    source: string
    totalCounties: number
    percentileBreaks: Record<string, number>
    percentileDistribution: Record<string, number>
    generatedDate: string
  }
  features: CountyEnergyFeature[]
}

/**
 * Load nighttime light data for cities
 */
export async function loadNightlightData(): Promise<NightlightCollection> {
  try {
    const response = await fetch('/data/us-nightlight-data.json')
    if (!response.ok) {
      throw new Error(`Failed to load nighttime data: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading nighttime light data:', error)
    throw error
  }
}

/**
 * Load county-level energy data with boundaries
 */
export async function loadCountyEnergyData(): Promise<CountyEnergyCollection> {
  try {
    const response = await fetch('/data/us-counties-energy.json')
    if (!response.ok) {
      throw new Error(`Failed to load county data: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading county energy data:', error)
    throw error
  }
}

/**
 * Load census tract boundaries
 */
export async function loadTractBoundaries(): Promise<any> {
  try {
    const response = await fetch('/data/us-tracts-boundaries.json')
    if (!response.ok) {
      throw new Error(`Failed to load tract boundaries: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading tract boundaries:', error)
    throw error
  }
}

/**
 * Filter nightlight data by state
 */
export function filterByState(
  data: NightlightCollection,
  state: string
): NightlightFeature[] {
  return data.features.filter(f => f.properties.state === state)
}

/**
 * Filter by intensity percentile range
 */
export function filterByIntensityPercentile(
  data: NightlightCollection,
  minPercentile: number,
  maxPercentile: number
): NightlightFeature[] {
  const sorted = [...data.features].sort(
    (a, b) => a.properties.intensity - b.properties.intensity
  )

  const minIndex = Math.floor((minPercentile / 100) * sorted.length)
  const maxIndex = Math.ceil((maxPercentile / 100) * sorted.length)

  return sorted.slice(minIndex, maxIndex)
}

/**
 * Get top energy consuming locations
 */
export function getTopEnergyLocations(
  data: NightlightCollection,
  limit: number = 50
): NightlightFeature[] {
  return [...data.features]
    .sort((a, b) => b.properties.energyMW - a.properties.energyMW)
    .slice(0, limit)
}

/**
 * Get county by FIPS code
 */
export function getCountyByFIPS(
  data: CountyEnergyCollection,
  fips: string
): CountyEnergyFeature | undefined {
  return data.features.find(f => f.properties.fips === fips)
}

/**
 * Filter counties by percentile category
 */
export function filterCountiesByPercentile(
  data: CountyEnergyCollection,
  category: string
): CountyEnergyFeature[] {
  return data.features.filter(f => f.properties.percentileCategory === category)
}

/**
 * Get counties in a specific state
 */
export function getCountiesByState(
  data: CountyEnergyCollection,
  state: string
): CountyEnergyFeature[] {
  return data.features.filter(f => f.properties.state === state)
}

/**
 * Calculate statistics for nightlight data
 */
export function calculateNightlightStats(data: NightlightCollection) {
  const intensities = data.features.map(f => f.properties.intensity)
  const energies = data.features.map(f => f.properties.energyMW)

  return {
    totalLocations: data.features.length,
    avgIntensity: intensities.reduce((a, b) => a + b, 0) / intensities.length,
    maxIntensity: Math.max(...intensities),
    minIntensity: Math.min(...intensities),
    totalEnergyMW: energies.reduce((a, b) => a + b, 0),
    avgEnergyMW: energies.reduce((a, b) => a + b, 0) / energies.length
  }
}
