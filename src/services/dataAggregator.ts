// Aggregate data from multiple sources into unified EnergyAccessMetrics

import { EnergyAccessMetrics } from '../types/energyData'
import { fetchLEADData } from './leadData'
import { fetchEIAData, processEIAData } from './eiaData'

/**
 * Aggregate energy access data from multiple DOE sources
 */
export async function aggregateEnergyData(
  eiaApiKey?: string
): Promise<EnergyAccessMetrics[]> {
  const aggregatedData: EnergyAccessMetrics[] = []
  
  // Fetch data from multiple sources
  const [leadData, eiaData] = await Promise.all([
    fetchLEADData(),
    eiaApiKey ? fetchEIAData(eiaApiKey) : Promise.resolve(null)
  ])
  
  // Combine and aggregate data
  // In production, this would merge data from all sources
  // and calculate composite scores
  
  return aggregatedData
}

/**
 * Calculate overall energy access score from component metrics
 */
export function calculateOverallScore(metrics: Partial<EnergyAccessMetrics>): number {
  const weights = {
    electricityAccess: 0.25,
    affordability: 0.25,
    reliability: 0.20,
    renewableEnergy: 0.15,
    infrastructure: 0.15
  }
  
  let score = 0
  let totalWeight = 0
  
  if (metrics.electricityAccess?.reliabilityScore) {
    score += metrics.electricityAccess.reliabilityScore * weights.electricityAccess
    totalWeight += weights.electricityAccess
  }
  
  if (metrics.affordability?.energyBurden) {
    // Lower burden = higher score (inverse relationship)
    const affordabilityScore = Math.max(0, 100 - (metrics.affordability.energyBurden * 10))
    score += affordabilityScore * weights.affordability
    totalWeight += weights.affordability
  }
  
  if (metrics.reliability?.reliabilityScore) {
    score += metrics.reliability.reliabilityScore * weights.reliability
    totalWeight += weights.reliability
  }
  
  if (metrics.renewableEnergy?.renewableScore) {
    score += metrics.renewableEnergy.renewableScore * weights.renewableEnergy
    totalWeight += weights.renewableEnergy
  }
  
  if (metrics.infrastructure?.modernizationScore) {
    score += metrics.infrastructure.modernizationScore * weights.infrastructure
    totalWeight += weights.infrastructure
  }
  
  return totalWeight > 0 ? score / totalWeight : 50 // Default to 50 if no data
}

/**
 * Get data for a specific census tract
 */
export async function getTractData(
  tractId: string,
  eiaApiKey?: string
): Promise<EnergyAccessMetrics | null> {
  const allData = await aggregateEnergyData(eiaApiKey)
  return allData.find(d => d.tractId === tractId) || null
}

/**
 * Get data aggregated by geographic level
 */
export function aggregateByGeography(
  data: EnergyAccessMetrics[],
  level: 'state' | 'county' | 'tract'
): Map<string, EnergyAccessMetrics[]> {
  const aggregated = new Map<string, EnergyAccessMetrics[]>()
  
  data.forEach(metric => {
    let key: string
    if (level === 'state') {
      key = metric.state
    } else if (level === 'county') {
      key = `${metric.state}-${metric.county}`
    } else {
      key = metric.tractId
    }
    
    if (!aggregated.has(key)) {
      aggregated.set(key, [])
    }
    aggregated.get(key)!.push(metric)
  })
  
  return aggregated
}

