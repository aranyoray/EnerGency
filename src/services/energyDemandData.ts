/**
 * Energy Demand Data Service
 * Fetches and processes energy demand data from EIA and ISOs
 */

import { EnergyDemand, CoolingWarmingCosts } from '../types/emergencyMetrics'

const EIA_API_BASE_URL = 'https://api.eia.gov/v2'

export interface EnergyDemandOptions {
  region?: string
  state?: string
  startDate?: string
  endDate?: string
  hourly?: boolean
}

/**
 * Fetch energy demand data from EIA API
 */
export async function fetchEnergyDemand(
  options: EnergyDemandOptions = {},
  apiKey?: string
): Promise<EnergyDemand[]> {
  try {
    if (!apiKey) {
      console.warn('EIA API key not provided, using mock data')
      return generateMockEnergyDemand(options)
    }

    // In production, this would fetch from EIA API
    // Endpoint: /electricity/rto/region-data/data/
    // const response = await fetch(`${EIA_API_BASE_URL}/electricity/rto/region-data/data/...`)

    return generateMockEnergyDemand(options)
  } catch (error) {
    console.error('Error fetching energy demand data:', error)
    return []
  }
}

/**
 * Fetch cooling/heating degree days and costs
 */
export async function fetchCoolingWarmingCosts(
  options: { state?: string; year?: number } = {}
): Promise<CoolingWarmingCosts[]> {
  try {
    // In production, this would combine:
    // - EIA heating/cooling degree days
    // - LEAD tool energy burden data
    // - State energy consumption data
    return generateMockCoolingWarmingCosts(options)
  } catch (error) {
    console.error('Error fetching cooling/warming costs:', error)
    return []
  }
}

/**
 * Calculate peak demand hours
 */
export function calculatePeakDemand(demands: EnergyDemand[]): {
  peak: number
  peakHour: number
  average: number
} {
  if (demands.length === 0) {
    return { peak: 0, peakHour: 0, average: 0 }
  }

  const peak = Math.max(...demands.map(d => d.demand))
  const peakDemand = demands.find(d => d.demand === peak)
  const average = demands.reduce((sum, d) => sum + d.demand, 0) / demands.length

  return {
    peak,
    peakHour: peakDemand?.hour || 0,
    average
  }
}

/**
 * Calculate energy stress score based on demand patterns
 */
export function calculateEnergyStressScore(
  demands: EnergyDemand[],
  costs: CoolingWarmingCosts
): number {
  const { peak, average } = calculatePeakDemand(demands)

  // High peak-to-average ratio indicates grid stress
  const peakRatio = average > 0 ? peak / average : 1
  const ratioScore = Math.min((peakRatio - 1) * 50, 40)

  // High energy burden indicates cost stress
  const burdenScore = Math.min(costs.totalEnergyBurden * 5, 60)

  return ratioScore + burdenScore
}

/**
 * Generate mock energy demand data
 */
function generateMockEnergyDemand(options: EnergyDemandOptions): EnergyDemand[] {
  const states = ['TX', 'FL', 'CA', 'NY', 'LA', 'OK', 'KS', 'NE', 'AL', 'MS']
  const demands: EnergyDemand[] = []

  const daysToGenerate = 365
  const state = options.state || states[Math.floor(Math.random() * states.length)]

  for (let day = 0; day < daysToGenerate; day++) {
    const date = new Date(2024, 0, 1)
    date.setDate(date.getDate() + day)
    const month = date.getMonth()

    // Generate hourly data if requested
    const hours = options.hourly ? 24 : 1

    for (let hour = 0; hour < hours; hour++) {
      // Summer months have higher cooling load
      const isSummer = month >= 5 && month <= 8
      const isWinter = month <= 2 || month >= 10

      const baseDemand = 5000 + Math.random() * 2000

      // Peak hours (2-6 PM)
      const isPeakHour = hour >= 14 && hour <= 18
      const hourMultiplier = isPeakHour ? 1.4 : 1.0

      // Seasonal variation
      const seasonalMultiplier = isSummer ? 1.3 : isWinter ? 1.2 : 1.0

      const demand = baseDemand * hourMultiplier * seasonalMultiplier

      // Temperature simulation
      const baseTemp = isSummer ? 85 : isWinter ? 35 : 65
      const tempVariation = (Math.random() - 0.5) * 20
      const temperature = baseTemp + tempVariation

      demands.push({
        date: date.toISOString().split('T')[0],
        hour,
        demand,
        region: 'Central',
        state,
        temperature,
        coolingLoad: isSummer ? demand * 0.6 : 0,
        heatingLoad: isWinter ? demand * 0.5 : 0
      })
    }
  }

  return demands
}

/**
 * Generate mock cooling/warming costs data
 */
function generateMockCoolingWarmingCosts(options: { state?: string; year?: number }): CoolingWarmingCosts[] {
  const states = ['TX', 'FL', 'CA', 'NY', 'LA', 'OK', 'KS', 'NE', 'AL', 'MS']
  const costs: CoolingWarmingCosts[] = []

  const statesToGenerate = options.state ? [options.state] : states

  statesToGenerate.forEach(state => {
    // Generate for 20-50 counties per state
    const numCounties = 20 + Math.floor(Math.random() * 30)

    for (let i = 0; i < numCounties; i++) {
      const coolingCosts = 500 + Math.random() * 1500
      const heatingCosts = 400 + Math.random() * 1200

      costs.push({
        county: `County ${i + 1}`,
        state,
        year: options.year || 2024,
        coolingCosts,
        heatingCosts,
        coolingDegradeDays: 1000 + Math.random() * 2000,
        heatingDegreeDays: 800 + Math.random() * 2200,
        totalEnergyBurden: (coolingCosts + heatingCosts) / (45000 + Math.random() * 55000) * 100
      })
    }
  })

  return costs
}

/**
 * Aggregate energy demand by time period
 */
export function aggregateEnergyDemandByPeriod(
  demands: EnergyDemand[],
  period: 'hourly' | 'daily' | 'weekly' | 'monthly'
): Map<string, number> {
  const aggregated = new Map<string, number[]>()

  demands.forEach(demand => {
    let key: string

    const date = new Date(demand.date)

    switch (period) {
      case 'hourly':
        key = `${demand.date} ${demand.hour}:00`
        break
      case 'daily':
        key = demand.date
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
    }

    if (!aggregated.has(key)) {
      aggregated.set(key, [])
    }
    aggregated.get(key)!.push(demand.demand)
  })

  // Calculate average for each period
  const result = new Map<string, number>()
  aggregated.forEach((values, key) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    result.set(key, avg)
  })

  return result
}
