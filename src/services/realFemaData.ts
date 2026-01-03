/**
 * Real FEMA Disaster Declarations Data Service
 * Fetches actual data from FEMA OpenFEMA API v2
 */

export interface FEMADisasterDeclaration {
  femaDeclarationString: string
  disasterNumber: number
  state: string
  declarationType: 'DR' | 'EM' | 'FM' // Disaster, Emergency, Fire Management
  declarationDate: string
  fyDeclared: number
  incidentType: string
  declarationTitle: string
  ihProgramDeclared: boolean
  iaProgramDeclared: boolean
  paProgramDeclared: boolean
  hmProgramDeclared: boolean
  incidentBeginDate: string
  incidentEndDate: string | null
  disasterCloseoutDate: string | null
  tribalRequest: boolean
  fipsStateCode: string
  fipsCountyCode: string
  placeCode: string
  designatedArea: string
  declarationRequestNumber: string
  lastIAFilingDate: string | null
  incidentId: string
  region: number
  designatedIncidentTypes: string | null
  lastRefresh: string
  hash: string
  id: string
}

export interface FEMAResponse {
  metadata: {
    skip: number
    top: number
    filter: string
    format: string
    metadata: boolean
    entityname: string
    version: string
    url: string
    count: number
    rundate: string
  }
  DisasterDeclarationsSummaries: FEMADisasterDeclaration[]
}

const FEMA_API_BASE = 'https://www.fema.gov/api/open/v2'
const DISASTERS_ENDPOINT = '/DisasterDeclarationsSummaries'

/**
 * Fetch disaster declarations from FEMA API
 */
export async function fetchFEMADisasters(options: {
  state?: string
  year?: number
  limit?: number
  declarationType?: 'DR' | 'EM' | 'FM'
  skip?: number
} = {}): Promise<FEMADisasterDeclaration[]> {
  try {
    const { state, year, limit = 1000, declarationType, skip = 0 } = options

    // Build filter conditions
    const filters: string[] = []
    if (state) {
      filters.push(`state eq '${state}'`)
    }
    if (year) {
      filters.push(`fyDeclared eq ${year}`)
    }
    if (declarationType) {
      filters.push(`declarationType eq '${declarationType}'`)
    }

    const params = new URLSearchParams({
      top: limit.toString(),
      skip: skip.toString()
    })

    if (filters.length > 0) {
      params.append('filter', filters.join(' and '))
    }

    const url = `${FEMA_API_BASE}${DISASTERS_ENDPOINT}?${params}`
    console.log('Fetching FEMA data from:', url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`FEMA API error: ${response.statusText}`)
    }

    const data: FEMAResponse = await response.json()
    return data.DisasterDeclarationsSummaries || []
  } catch (error) {
    console.error('Error fetching FEMA disaster declarations:', error)
    return []
  }
}

/**
 * Fetch recent disasters (last N years)
 */
export async function fetchRecentDisasters(years: number = 5): Promise<FEMADisasterDeclaration[]> {
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - years

  const allDisasters: FEMADisasterDeclaration[] = []

  // Fetch year by year to avoid large responses
  for (let year = startYear; year <= currentYear; year++) {
    const disasters = await fetchFEMADisasters({ year, limit: 10000 })
    allDisasters.push(...disasters)
  }

  return allDisasters
}

/**
 * Group disasters by county
 */
export function groupDisastersByCounty(
  disasters: FEMADisasterDeclaration[]
): Map<string, FEMADisasterDeclaration[]> {
  const byCounty = new Map<string, FEMADisasterDeclaration[]>()

  disasters.forEach(disaster => {
    const key = `${disaster.fipsStateCode}${disaster.fipsCountyCode}`
    if (!byCounty.has(key)) {
      byCounty.set(key, [])
    }
    byCounty.get(key)!.push(disaster)
  })

  return byCounty
}

/**
 * Calculate disaster frequency by county
 */
export function calculateDisasterFrequency(
  disasters: FEMADisasterDeclaration[]
): Map<string, { count: number; types: Set<string>; recent: FEMADisasterDeclaration }> {
  const frequency = new Map<string, { count: number; types: Set<string>; recent: FEMADisasterDeclaration }>()

  disasters.forEach(disaster => {
    const key = `${disaster.fipsStateCode}${disaster.fipsCountyCode}`
    if (!frequency.has(key)) {
      frequency.set(key, { count: 0, types: new Set(), recent: disaster })
    }

    const data = frequency.get(key)!
    data.count++
    data.types.add(disaster.incidentType)

    // Update if more recent
    if (new Date(disaster.declarationDate) > new Date(data.recent.declarationDate)) {
      data.recent = disaster
    }
  })

  return frequency
}

/**
 * Get disasters by state
 */
export function filterByState(
  disasters: FEMADisasterDeclaration[],
  state: string
): FEMADisasterDeclaration[] {
  return disasters.filter(d => d.state === state)
}

/**
 * Get disasters by type
 */
export function filterByType(
  disasters: FEMADisasterDeclaration[],
  incidentType: string
): FEMADisasterDeclaration[] {
  return disasters.filter(d => d.incidentType.toLowerCase().includes(incidentType.toLowerCase()))
}

/**
 * Get major disasters only (DR type)
 */
export function getMajorDisasters(disasters: FEMADisasterDeclaration[]): FEMADisasterDeclaration[] {
  return disasters.filter(d => d.declarationType === 'DR')
}

/**
 * Calculate disaster statistics
 */
export function calculateDisasterStats(disasters: FEMADisasterDeclaration[]) {
  const typeCount = new Map<string, number>()
  const stateCount = new Map<string, number>()

  disasters.forEach(d => {
    typeCount.set(d.incidentType, (typeCount.get(d.incidentType) || 0) + 1)
    stateCount.set(d.state, (stateCount.get(d.state) || 0) + 1)
  })

  return {
    total: disasters.length,
    byType: Object.fromEntries(typeCount),
    byState: Object.fromEntries(stateCount),
    byDeclarationType: {
      DR: disasters.filter(d => d.declarationType === 'DR').length,
      EM: disasters.filter(d => d.declarationType === 'EM').length,
      FM: disasters.filter(d => d.declarationType === 'FM').length
    }
  }
}
