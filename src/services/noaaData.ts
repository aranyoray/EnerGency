/**
 * NOAA Storm Events Data Service
 * Fetches and processes storm event data from NOAA's Storm Events Database
 */

import { StormEvent } from '../types/emergencyMetrics'

const NOAA_STORM_EVENTS_BASE_URL = 'https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles'

export interface NOAAStormEventsOptions {
  year?: number
  state?: string
  eventType?: string
  startDate?: string
  endDate?: string
}

/**
 * Fetch storm events from NOAA database
 * Note: This is a mock implementation. Real implementation would fetch CSV files
 * from NOAA and parse them. For production, you'd want to:
 * 1. Download CSV files to a backend
 * 2. Process and store in a database
 * 3. Serve via API
 */
export async function fetchStormEvents(
  options: NOAAStormEventsOptions = {}
): Promise<StormEvent[]> {
  try {
    // In production, this would fetch from your backend API
    // that processes NOAA CSV files
    const mockData = generateMockStormEvents(options)
    return mockData
  } catch (error) {
    console.error('Error fetching NOAA storm events:', error)
    return []
  }
}

/**
 * Process storm events by county
 */
export function aggregateStormEventsByCounty(events: StormEvent[]): Map<string, {
  count: number
  totalDamage: number
  events: StormEvent[]
}> {
  const countyMap = new Map()

  events.forEach(event => {
    const key = `${event.state}-${event.county}`
    if (!countyMap.has(key)) {
      countyMap.set(key, {
        count: 0,
        totalDamage: 0,
        events: []
      })
    }

    const data = countyMap.get(key)
    data.count++
    data.totalDamage += event.damageProperty + event.damageCrops
    data.events.push(event)
  })

  return countyMap
}

/**
 * Calculate storm intensity score (0-100)
 */
export function calculateStormIntensity(events: StormEvent[]): number {
  if (events.length === 0) return 0

  const totalDamage = events.reduce((sum, e) => sum + e.damageProperty + e.damageCrops, 0)
  const totalCasualties = events.reduce((sum, e) => sum + e.deaths + e.injuries, 0)
  const eventCount = events.length

  // Normalize to 0-100 scale
  const damageScore = Math.min(totalDamage / 10000000, 1) * 50
  const casualtyScore = Math.min(totalCasualties / 100, 1) * 30
  const frequencyScore = Math.min(eventCount / 50, 1) * 20

  return damageScore + casualtyScore + frequencyScore
}

/**
 * Generate mock storm events for demonstration
 */
function generateMockStormEvents(options: NOAAStormEventsOptions): StormEvent[] {
  const states = ['TX', 'FL', 'CA', 'NY', 'LA', 'OK', 'KS', 'NE', 'AL', 'MS']
  const eventTypes: StormEvent['eventType'][] = [
    'Hurricane', 'Tornado', 'Flood', 'Winter Storm', 'Hail', 'Heat', 'Cold', 'Wildfire'
  ]

  const events: StormEvent[] = []
  const count = 500

  for (let i = 0; i < count; i++) {
    const state = options.state || states[Math.floor(Math.random() * states.length)]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    events.push({
      eventId: `STORM-${Date.now()}-${i}`,
      eventType,
      state,
      county: `County ${Math.floor(Math.random() * 100)}`,
      beginDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      endDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      injuries: Math.floor(Math.random() * 50),
      deaths: Math.floor(Math.random() * 10),
      damageProperty: Math.random() * 10000000,
      damageCrops: Math.random() * 1000000,
      latitude: 25 + Math.random() * 24,
      longitude: -125 + Math.random() * 58
    })
  }

  return events
}

/**
 * Get storm events by geographic bounds
 */
export function filterStormEventsByBounds(
  events: StormEvent[],
  bounds: { north: number; south: number; east: number; west: number }
): StormEvent[] {
  return events.filter(event =>
    event.latitude >= bounds.south &&
    event.latitude <= bounds.north &&
    event.longitude >= bounds.west &&
    event.longitude <= bounds.east
  )
}
