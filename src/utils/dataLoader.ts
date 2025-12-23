// Data loading utilities for fetching and caching energy data

import { EnergyAccessMetrics } from '../types/energyData'
import { aggregateEnergyData } from '../services/dataAggregator'

let cachedData: EnergyAccessMetrics[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Load energy access data with caching
 */
export async function loadEnergyData(
  forceRefresh = false,
  eiaApiKey?: string
): Promise<EnergyAccessMetrics[]> {
  const now = Date.now()
  
  // Return cached data if still valid
  if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedData
  }
  
  // Load data from sources
  const data = await aggregateEnergyData(eiaApiKey)
  
  // Cache the data
  cachedData = data
  cacheTimestamp = now
  
  return data
}

/**
 * Load data from a local JSON file (for development/testing)
 */
export async function loadLocalData(filePath: string): Promise<EnergyAccessMetrics[]> {
  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`)
    }
    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('Error loading local data:', error)
    return []
  }
}

/**
 * Convert data to GeoJSON format for mapping
 */
export function convertToGeoJSON(data: EnergyAccessMetrics[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: data.map(metric => ({
      type: 'Feature',
      properties: {
        tractId: metric.tractId,
        name: `${metric.county}, ${metric.state}`,
        value: metric.overallScore,
        ...metric
      },
      geometry: metric.bounds ? {
        type: 'Polygon',
        coordinates: [[
          [metric.bounds[0][1], metric.bounds[0][0]],
          [metric.bounds[1][1], metric.bounds[0][0]],
          [metric.bounds[1][1], metric.bounds[1][0]],
          [metric.bounds[0][1], metric.bounds[1][0]],
          [metric.bounds[0][1], metric.bounds[0][0]]
        ]]
      } : {
        type: 'Point',
        coordinates: metric.coordinates 
          ? [metric.coordinates.lng, metric.coordinates.lat]
          : [0, 0]
      }
    }))
  }
}

