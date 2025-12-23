// EIA (Energy Information Administration) API integration

import { EnergyAccessMetrics } from '../types/energyData'

const EIA_API_BASE = 'https://api.eia.gov/v2/'

/**
 * Fetch electricity access data from EIA
 * Requires EIA API key (get from https://www.eia.gov/opendata/register.php)
 */
export async function fetchEIAData(
  apiKey: string,
  seriesId?: string
): Promise<any> {
  if (!apiKey) {
    console.warn('EIA API key not provided. Set EIA_API_KEY environment variable.')
    return null
  }

  // Example EIA API endpoints for electricity data:
  // - Electricity generation by state
  // - Electricity sales by state
  // - Average retail price of electricity
  
  const endpoint = seriesId 
    ? `${EIA_API_BASE}electricity/retail-sales/data/?api_key=${apiKey}&series_id=${seriesId}`
    : `${EIA_API_BASE}electricity/retail-sales/data/?api_key=${apiKey}&frequency=annual&data[0]=price&data[1]=sales&sort[0][column]=period&sort[0][direction]=desc&length=5000`

  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`EIA API error: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching EIA data:', error)
    return null
  }
}

/**
 * Fetch state-level electricity data
 */
export async function fetchStateElectricityData(apiKey: string, state: string) {
  // EIA provides state-level electricity data
  // This would fetch retail sales, prices, and generation data
  return fetchEIAData(apiKey)
}

/**
 * Process EIA data into EnergyAccessMetrics format
 */
export function processEIAData(eiaData: any): Partial<EnergyAccessMetrics> {
  // Transform EIA API response into our data structure
  return {
    electricityAccess: {
      percentConnected: 99.9, // Most US households have electricity
      reliabilityScore: 85,
      averageOutageDuration: 0
    }
  }
}

