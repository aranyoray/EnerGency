/**
 * FEMA Disaster Declarations Data Service
 * Fetches and processes disaster declarations from FEMA OpenFEMA API
 */

import { DisasterDeclaration } from '../types/emergencyMetrics'

const FEMA_API_BASE_URL = 'https://www.fema.gov/api/open'
const FEMA_DISASTER_DECLARATIONS_V2 = '/v2/DisasterDeclarationsSummaries'

export interface FEMADisasterOptions {
  state?: string
  year?: number
  declarationType?: string
  limit?: number
}

/**
 * Fetch disaster declarations from FEMA OpenFEMA API
 */
export async function fetchDisasterDeclarations(
  options: FEMADisasterOptions = {}
): Promise<DisasterDeclaration[]> {
  try {
    const { state, year, declarationType, limit = 1000 } = options

    // Build query parameters
    const params = new URLSearchParams({
      $limit: limit.toString()
    })

    if (state) {
      params.append('$filter', `state eq '${state}'`)
    }

    if (year) {
      params.append('$filter', `declarationDate ge '${year}-01-01' and declarationDate le '${year}-12-31'`)
    }

    // In production, uncomment this to fetch real data:
    // const response = await fetch(`${FEMA_API_BASE_URL}${FEMA_DISASTER_DECLARATIONS_V2}?${params}`)
    // const data = await response.json()
    // return parseFEMAResponse(data.DisasterDeclarationsSummaries)

    // For now, return mock data
    return generateMockDisasterDeclarations(options)
  } catch (error) {
    console.error('Error fetching FEMA disaster declarations:', error)
    return []
  }
}

/**
 * Parse FEMA API response to DisasterDeclaration objects
 */
function parseFEMAResponse(data: any[]): DisasterDeclaration[] {
  return data.map(item => ({
    disasterNumber: item.disasterNumber || item.femaDeclarationString,
    declarationType: item.declarationType || 'Major Disaster',
    declarationDate: item.declarationDate,
    state: item.state,
    county: item.designatedArea,
    incidentType: item.incidentType,
    title: item.declarationTitle,
    designatedArea: item.designatedArea,
    latitude: item.placeCode ? parseFloat(item.placeCode.split(',')[0]) : undefined,
    longitude: item.placeCode ? parseFloat(item.placeCode.split(',')[1]) : undefined
  }))
}

/**
 * Aggregate disaster declarations by county
 */
export function aggregateDisastersByCounty(declarations: DisasterDeclaration[]): Map<string, {
  count: number
  types: Set<string>
  recent: DisasterDeclaration[]
}> {
  const countyMap = new Map()

  declarations.forEach(declaration => {
    const key = `${declaration.state}-${declaration.county || 'Statewide'}`
    if (!countyMap.has(key)) {
      countyMap.set(key, {
        count: 0,
        types: new Set(),
        recent: []
      })
    }

    const data = countyMap.get(key)
    data.count++
    data.types.add(declaration.incidentType)
    data.recent.push(declaration)
  })

  return countyMap
}

/**
 * Calculate disaster risk score (0-100)
 */
export function calculateDisasterRiskScore(declarations: DisasterDeclaration[]): number {
  if (declarations.length === 0) return 0

  // Weight recent disasters more heavily
  const now = new Date().getTime()
  const weights = declarations.map(d => {
    const declarationTime = new Date(d.declarationDate).getTime()
    const yearsAgo = (now - declarationTime) / (365 * 24 * 60 * 60 * 1000)
    return Math.max(0, 1 - (yearsAgo / 10)) // Decay over 10 years
  })

  const weightedCount = weights.reduce((sum, w) => sum + w, 0)
  const uniqueTypes = new Set(declarations.map(d => d.incidentType)).size

  // Normalize to 0-100 scale
  const frequencyScore = Math.min(weightedCount / 10, 1) * 60
  const diversityScore = Math.min(uniqueTypes / 5, 1) * 40

  return frequencyScore + diversityScore
}

/**
 * Generate mock disaster declarations for demonstration
 */
function generateMockDisasterDeclarations(options: FEMADisasterOptions): DisasterDeclaration[] {
  const states = ['TX', 'FL', 'CA', 'NY', 'LA', 'OK', 'KS', 'NE', 'AL', 'MS']
  const incidentTypes = [
    'Hurricane', 'Severe Storm', 'Flood', 'Fire', 'Tornado',
    'Winter Storm', 'Drought', 'Earthquake', 'Coastal Storm'
  ]
  const declarationTypes: DisasterDeclaration['declarationType'][] = [
    'Major Disaster', 'Emergency', 'Fire Management'
  ]

  const declarations: DisasterDeclaration[] = []
  const count = 300

  for (let i = 0; i < count; i++) {
    const state = options.state || states[Math.floor(Math.random() * states.length)]
    const year = options.year || (2020 + Math.floor(Math.random() * 5))

    declarations.push({
      disasterNumber: `DR-${4000 + i}`,
      declarationType: declarationTypes[Math.floor(Math.random() * declarationTypes.length)],
      declarationDate: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      state,
      county: Math.random() > 0.3 ? `County ${Math.floor(Math.random() * 100)}` : undefined,
      incidentType: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
      title: `${state} Severe Storm`,
      designatedArea: Math.random() > 0.3 ? `County ${Math.floor(Math.random() * 100)}` : 'Statewide',
      latitude: 25 + Math.random() * 24,
      longitude: -125 + Math.random() * 58
    })
  }

  return declarations
}

/**
 * Get disaster declarations by state
 */
export function filterDisastersByState(
  declarations: DisasterDeclaration[],
  state: string
): DisasterDeclaration[] {
  return declarations.filter(d => d.state === state)
}

/**
 * Get disaster declarations by year range
 */
export function filterDisastersByYearRange(
  declarations: DisasterDeclaration[],
  startYear: number,
  endYear: number
): DisasterDeclaration[] {
  return declarations.filter(d => {
    const year = new Date(d.declarationDate).getFullYear()
    return year >= startYear && year <= endYear
  })
}
