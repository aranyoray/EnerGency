/**
 * Real Data Aggregator
 * Combines nighttime light data, county energy data, and FEMA disaster data
 */

import {
  loadNightlightData,
  loadCountyEnergyData,
  NightlightCollection,
  CountyEnergyCollection,
  CountyEnergyFeature
} from './nightlightData'
import {
  fetchFEMADisasters,
  fetchRecentDisasters,
  groupDisastersByCounty,
  FEMADisasterDeclaration
} from './realFemaData'
import { EmergencyMetrics } from '../types/emergencyMetrics'

export interface EnrichedCountyData extends CountyEnergyFeature {
  emergencyMetrics: {
    disasterCount: number
    disasterTypes: string[]
    mostRecentDisaster: FEMADisasterDeclaration | null
    disasterStressScore: number
    energyStressScore: number
    overallStressScore: number
    stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  }
}

/**
 * Load all real data sources and combine them
 */
export async function loadAllRealData(options: {
  state?: string
  disasterYears?: number
} = {}): Promise<{
  nightlight: NightlightCollection
  counties: CountyEnergyCollection
  disasters: FEMADisasterDeclaration[]
  enrichedCounties: EnrichedCountyData[]
}> {
  console.log('Loading real data sources...')

  try {
    // Load all data in parallel
    const [nightlight, counties, disasters] = await Promise.all([
      loadNightlightData(),
      loadCountyEnergyData(),
      fetchRecentDisasters(options.disasterYears || 5)
    ])

    console.log(`Loaded:
      - ${nightlight.features.length} nightlight locations
      - ${counties.features.length} counties
      - ${disasters.length} FEMA disaster declarations`)

    // Enrich county data with disaster information
    const enrichedCounties = enrichCountiesWithDisasters(counties, disasters)

    return {
      nightlight,
      counties,
      disasters,
      enrichedCounties
    }
  } catch (error) {
    console.error('Error loading real data:', error)
    throw error
  }
}

/**
 * Enrich county data with disaster information
 */
function enrichCountiesWithDisasters(
  counties: CountyEnergyCollection,
  disasters: FEMADisasterDeclaration[]
): EnrichedCountyData[] {
  const disastersByCounty = groupDisastersByCounty(disasters)

  return counties.features.map(county => {
    const countyFips = county.properties.fips
    const countyDisasters = disastersByCounty.get(countyFips) || []

    // Calculate disaster stress score (0-100)
    const disasterCount = countyDisasters.length
    const disasterTypes = new Set(countyDisasters.map(d => d.incidentType))
    const disasterStressScore = Math.min(disasterCount * 5 + disasterTypes.size * 10, 100)

    // Calculate energy stress score based on intensity and percentile
    const energyStressScore = Math.min(
      county.properties.avgIntensity * 100 +
      county.properties.percentile * 0.5,
      100
    )

    // Overall stress score (weighted)
    const overallStressScore = disasterStressScore * 0.6 + energyStressScore * 0.4

    // Determine stress level
    let stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low'
    if (overallStressScore >= 75) stressLevel = 'Critical'
    else if (overallStressScore >= 50) stressLevel = 'High'
    else if (overallStressScore >= 25) stressLevel = 'Moderate'

    // Most recent disaster
    const mostRecentDisaster = countyDisasters.length > 0
      ? countyDisasters.reduce((latest, current) =>
          new Date(current.declarationDate) > new Date(latest.declarationDate)
            ? current
            : latest
        )
      : null

    return {
      ...county,
      emergencyMetrics: {
        disasterCount,
        disasterTypes: Array.from(disasterTypes),
        mostRecentDisaster,
        disasterStressScore,
        energyStressScore,
        overallStressScore,
        stressLevel
      }
    }
  })
}

/**
 * Convert enriched county data to EmergencyMetrics format
 */
export function convertToEmergencyMetrics(
  enrichedCounties: EnrichedCountyData[]
): EmergencyMetrics[] {
  return enrichedCounties.map(county => {
    const props = county.properties
    const metrics = county.emergencyMetrics

    // Get center of county polygon for lat/lon
    const coords = county.geometry.coordinates[0]
    const centerLon = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
    const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length

    return {
      geoid: props.fips,
      name: props.name,
      state: props.state,
      county: props.name,
      latitude: centerLat,
      longitude: centerLon,

      // Disaster metrics
      stormEventsCount: metrics.disasterCount,
      totalStormDamage: 0, // Not available from FEMA API
      disasterDeclarationsCount: metrics.disasterCount,

      // Energy metrics (from nightlight data)
      coolingCosts: props.totalEnergyMW * 50, // Estimate
      heatingCosts: props.totalEnergyMW * 40, // Estimate
      totalEnergyBurden: props.avgIntensity * 15, // Proxy calculation
      energyDemandPeak: props.totalEnergyMW * 1.5,
      energyDemandAverage: props.totalEnergyMW,

      // Migration stress (not available, use placeholder)
      outMigration: 0,
      inMigration: 0,
      netMigration: 0,
      migrationStressScore: 0,

      // Composite scores
      disasterStressScore: metrics.disasterStressScore,
      energyStressScore: metrics.energyStressScore,
      overallStressScore: metrics.overallStressScore,

      // Top stress indicator
      isTopStressed: metrics.stressLevel === 'Critical',
      stressLevel: metrics.stressLevel
    }
  })
}

/**
 * Filter enriched counties by state
 */
export function filterCountiesByState(
  counties: EnrichedCountyData[],
  state: string
): EnrichedCountyData[] {
  return counties.filter(c => c.properties.state === state)
}

/**
 * Get top stressed counties
 */
export function getTopStressedCounties(
  counties: EnrichedCountyData[],
  limit: number = 50
): EnrichedCountyData[] {
  return [...counties]
    .sort((a, b) => b.emergencyMetrics.overallStressScore - a.emergencyMetrics.overallStressScore)
    .slice(0, limit)
}

/**
 * Get counties by stress level
 */
export function getCountiesByStressLevel(
  counties: EnrichedCountyData[],
  level: 'Low' | 'Moderate' | 'High' | 'Critical'
): EnrichedCountyData[] {
  return counties.filter(c => c.emergencyMetrics.stressLevel === level)
}

/**
 * Calculate summary statistics
 */
export function calculateSummaryStats(counties: EnrichedCountyData[]) {
  const totalPopulation = counties.reduce((sum, c) => sum + c.properties.totalPopulation, 0)
  const totalEnergy = counties.reduce((sum, c) => sum + c.properties.totalEnergyMW, 0)
  const totalDisasters = counties.reduce((sum, c) => sum + c.emergencyMetrics.disasterCount, 0)

  const stressLevels = {
    Low: counties.filter(c => c.emergencyMetrics.stressLevel === 'Low').length,
    Moderate: counties.filter(c => c.emergencyMetrics.stressLevel === 'Moderate').length,
    High: counties.filter(c => c.emergencyMetrics.stressLevel === 'High').length,
    Critical: counties.filter(c => c.emergencyMetrics.stressLevel === 'Critical').length
  }

  return {
    totalCounties: counties.length,
    totalPopulation,
    totalEnergyMW: totalEnergy,
    avgEnergyPerCounty: totalEnergy / counties.length,
    totalDisasters,
    avgDisastersPerCounty: totalDisasters / counties.length,
    stressLevels,
    avgOverallStress: counties.reduce((sum, c) => sum + c.emergencyMetrics.overallStressScore, 0) / counties.length
  }
}
