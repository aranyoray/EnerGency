/**
 * U.S. Census Bureau Migration Data Service
 * Fetches and processes county-to-county migration flows
 */

import { MigrationData } from '../types/emergencyMetrics'

const CENSUS_API_BASE_URL = 'https://api.census.gov/data'

export interface CensusMigrationOptions {
  year?: number
  state?: string
  county?: string
}

/**
 * Fetch migration data from Census API
 */
export async function fetchMigrationData(
  options: CensusMigrationOptions = {}
): Promise<MigrationData[]> {
  try {
    // In production, this would fetch from Census API or IRS migration data
    // For now, return mock data
    return generateMockMigrationData(options)
  } catch (error) {
    console.error('Error fetching Census migration data:', error)
    return []
  }
}

/**
 * Calculate net migration for a county
 */
export function calculateNetMigration(
  countyFips: string,
  migrationData: MigrationData[]
): {
  inMigration: number
  outMigration: number
  netMigration: number
} {
  const inflows = migrationData.filter(d => d.destinationCounty === countyFips)
  const outflows = migrationData.filter(d => d.originCounty === countyFips)

  const inMigration = inflows.reduce((sum, d) => sum + d.numberOfReturns, 0)
  const outMigration = outflows.reduce((sum, d) => sum + d.numberOfReturns, 0)

  return {
    inMigration,
    outMigration,
    netMigration: inMigration - outMigration
  }
}

/**
 * Calculate migration stress score (0-100)
 * High outmigration indicates stress
 */
export function calculateMigrationStressScore(
  netMigration: number,
  totalPopulation: number
): number {
  if (totalPopulation === 0) return 0

  const migrationRate = (netMigration / totalPopulation) * 100

  // Negative migration (outflow) indicates stress
  if (migrationRate >= 0) {
    return 0 // No stress from positive migration
  }

  // Convert negative migration rate to stress score (0-100)
  // -5% migration rate = 50 stress score
  // -10% or more = 100 stress score
  const stressScore = Math.min(Math.abs(migrationRate) * 10, 100)

  return stressScore
}

/**
 * Get top migration destinations from a county
 */
export function getTopMigrationDestinations(
  originCounty: string,
  migrationData: MigrationData[],
  limit: number = 10
): MigrationData[] {
  return migrationData
    .filter(d => d.originCounty === originCounty)
    .sort((a, b) => b.numberOfReturns - a.numberOfReturns)
    .slice(0, limit)
}

/**
 * Get top migration origins to a county
 */
export function getTopMigrationOrigins(
  destinationCounty: string,
  migrationData: MigrationData[],
  limit: number = 10
): MigrationData[] {
  return migrationData
    .filter(d => d.destinationCounty === destinationCounty)
    .sort((a, b) => b.numberOfReturns - a.numberOfReturns)
    .slice(0, limit)
}

/**
 * Generate mock migration data for demonstration
 */
function generateMockMigrationData(options: CensusMigrationOptions): MigrationData[] {
  const states = ['TX', 'FL', 'CA', 'NY', 'LA', 'OK', 'KS', 'NE', 'AL', 'MS', 'AZ', 'NV', 'CO', 'WA', 'OR']
  const migrations: MigrationData[] = []
  const count = 1000

  for (let i = 0; i < count; i++) {
    const originState = options.state || states[Math.floor(Math.random() * states.length)]
    const destState = states[Math.floor(Math.random() * states.length)]

    const numberOfReturns = Math.floor(Math.random() * 5000) + 10
    const numberOfExemptions = Math.floor(numberOfReturns * (1.5 + Math.random()))

    migrations.push({
      originCounty: `${originState}${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`,
      destinationCounty: `${destState}${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`,
      year: options.year || 2023,
      numberOfReturns,
      numberOfExemptions,
      aggregatedIncome: numberOfReturns * (30000 + Math.random() * 70000),
      originState,
      destinationState: destState
    })
  }

  return migrations
}

/**
 * Aggregate migration flows by state
 */
export function aggregateMigrationByState(migrationData: MigrationData[]): Map<string, {
  inMigration: number
  outMigration: number
  netMigration: number
  totalIncome: number
}> {
  const stateMap = new Map()

  migrationData.forEach(flow => {
    // Update origin state (outmigration)
    if (!stateMap.has(flow.originState)) {
      stateMap.set(flow.originState, {
        inMigration: 0,
        outMigration: 0,
        netMigration: 0,
        totalIncome: 0
      })
    }
    const originData = stateMap.get(flow.originState)
    originData.outMigration += flow.numberOfReturns

    // Update destination state (inmigration)
    if (!stateMap.has(flow.destinationState)) {
      stateMap.set(flow.destinationState, {
        inMigration: 0,
        outMigration: 0,
        netMigration: 0,
        totalIncome: 0
      })
    }
    const destData = stateMap.get(flow.destinationState)
    destData.inMigration += flow.numberOfReturns
    destData.totalIncome += flow.aggregatedIncome
  })

  // Calculate net migration for each state
  stateMap.forEach((data, state) => {
    data.netMigration = data.inMigration - data.outMigration
  })

  return stateMap
}
