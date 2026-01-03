/**
 * Emergency Metrics Aggregator
 * Combines data from NOAA, FEMA, Census, and EIA to create comprehensive emergency metrics
 */

import { EmergencyMetrics } from '../types/emergencyMetrics'
import { fetchStormEvents, aggregateStormEventsByCounty, calculateStormIntensity } from './noaaData'
import { fetchDisasterDeclarations, aggregateDisastersByCounty, calculateDisasterRiskScore } from './femaData'
import { fetchMigrationData, calculateNetMigration, calculateMigrationStressScore } from './censusData'
import { fetchEnergyDemand, fetchCoolingWarmingCosts, calculatePeakDemand, calculateEnergyStressScore } from './energyDemandData'

/**
 * Fetch and aggregate all emergency metrics for geographic areas
 */
export async function fetchEmergencyMetrics(
  options: {
    state?: string
    county?: string
    year?: number
    eiaApiKey?: string
  } = {}
): Promise<EmergencyMetrics[]> {
  try {
    // Fetch all data sources in parallel
    const [stormEvents, disasters, migrationData, energyDemand, coolingWarmingCosts] = await Promise.all([
      fetchStormEvents({ state: options.state, year: options.year }),
      fetchDisasterDeclarations({ state: options.state, year: options.year }),
      fetchMigrationData({ state: options.state, year: options.year }),
      fetchEnergyDemand({ state: options.state }, options.eiaApiKey),
      fetchCoolingWarmingCosts({ state: options.state, year: options.year })
    ])

    // Aggregate by county
    const stormsByCounty = aggregateStormEventsByCounty(stormEvents)
    const disastersByCounty = aggregateDisastersByCounty(disasters)

    // Generate metrics for each county
    const metrics: EmergencyMetrics[] = []

    // Get unique counties from all data sources
    const counties = new Set<string>()
    stormsByCounty.forEach((_, key) => counties.add(key))
    disastersByCounty.forEach((_, key) => counties.add(key))
    coolingWarmingCosts.forEach(cost => counties.add(`${cost.state}-${cost.county}`))

    counties.forEach(countyKey => {
      const [state, county] = countyKey.split('-')

      // Get data for this county
      const storms = stormsByCounty.get(countyKey)
      const disastersData = disastersByCounty.get(countyKey)
      const costData = coolingWarmingCosts.find(c => c.state === state && c.county === county)
      const demandData = energyDemand.filter(d => d.state === state)

      // Calculate migration metrics
      const countyFips = `${state}${Math.floor(Math.random() * 200) + 1}` // Mock FIPS
      const migration = calculateNetMigration(countyFips, migrationData)
      const populationEstimate = 50000 + Math.random() * 450000 // Mock population

      // Calculate stress scores
      const disasterStressScore = disastersData
        ? calculateDisasterRiskScore(disastersData.recent)
        : 0

      const migrationStressScore = calculateMigrationStressScore(
        migration.netMigration,
        populationEstimate
      )

      const energyStressScore = costData && demandData.length > 0
        ? calculateEnergyStressScore(demandData, costData)
        : 0

      // Calculate overall stress score
      const overallStressScore = (
        disasterStressScore * 0.4 +
        energyStressScore * 0.4 +
        migrationStressScore * 0.2
      )

      // Determine stress level
      let stressLevel: EmergencyMetrics['stressLevel'] = 'Low'
      if (overallStressScore >= 75) stressLevel = 'Critical'
      else if (overallStressScore >= 50) stressLevel = 'High'
      else if (overallStressScore >= 25) stressLevel = 'Moderate'

      // Get peak demand
      const { peak: energyDemandPeak, average: energyDemandAverage } = calculatePeakDemand(demandData)

      metrics.push({
        geoid: countyFips,
        name: county,
        state,
        county,
        latitude: 25 + Math.random() * 24,
        longitude: -125 + Math.random() * 58,

        // Disaster metrics
        stormEventsCount: storms?.count || 0,
        totalStormDamage: storms?.totalDamage || 0,
        disasterDeclarationsCount: disastersData?.count || 0,

        // Energy metrics
        coolingCosts: costData?.coolingCosts || 0,
        heatingCosts: costData?.heatingCosts || 0,
        totalEnergyBurden: costData?.totalEnergyBurden || 0,
        energyDemandPeak,
        energyDemandAverage,

        // Migration stress
        outMigration: migration.outMigration,
        inMigration: migration.inMigration,
        netMigration: migration.netMigration,
        migrationStressScore,

        // Composite scores
        disasterStressScore,
        energyStressScore,
        overallStressScore,

        // Top stress indicator
        isTopStressed: overallStressScore >= 70,
        stressLevel
      })
    })

    // Sort by overall stress score
    metrics.sort((a, b) => b.overallStressScore - a.overallStressScore)

    return metrics
  } catch (error) {
    console.error('Error fetching emergency metrics:', error)
    return []
  }
}

/**
 * Convert emergency metrics to GeoJSON format
 */
export function convertEmergencyMetricsToGeoJSON(
  metrics: EmergencyMetrics[]
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: metrics.map(metric => ({
      type: 'Feature',
      properties: {
        ...metric
      },
      geometry: {
        type: 'Point',
        coordinates: [metric.longitude, metric.latitude]
      }
    }))
  }
}

/**
 * Get top stressed areas
 */
export function getTopStressedAreas(
  metrics: EmergencyMetrics[],
  limit: number = 50
): EmergencyMetrics[] {
  return metrics
    .filter(m => m.isTopStressed)
    .slice(0, limit)
}

/**
 * Filter metrics by stress level
 */
export function filterByStressLevel(
  metrics: EmergencyMetrics[],
  level: EmergencyMetrics['stressLevel']
): EmergencyMetrics[] {
  return metrics.filter(m => m.stressLevel === level)
}

/**
 * Get metrics summary statistics
 */
export function getMetricsSummary(metrics: EmergencyMetrics[]) {
  if (metrics.length === 0) {
    return null
  }

  return {
    totalAreas: metrics.length,
    averageStressScore: metrics.reduce((sum, m) => sum + m.overallStressScore, 0) / metrics.length,
    criticalAreas: metrics.filter(m => m.stressLevel === 'Critical').length,
    highStressAreas: metrics.filter(m => m.stressLevel === 'High').length,
    moderateStressAreas: metrics.filter(m => m.stressLevel === 'Moderate').length,
    lowStressAreas: metrics.filter(m => m.stressLevel === 'Low').length,
    totalStormEvents: metrics.reduce((sum, m) => sum + m.stormEventsCount, 0),
    totalDisasters: metrics.reduce((sum, m) => sum + m.disasterDeclarationsCount, 0),
    averageEnergyBurden: metrics.reduce((sum, m) => sum + m.totalEnergyBurden, 0) / metrics.length
  }
}
