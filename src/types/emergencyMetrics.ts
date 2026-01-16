/**
 * Emergency Metrics Types
 * Trump-friendly terminology for disaster preparedness and energy management
 */

export interface StormEvent {
  eventId: string
  eventType: 'Hurricane' | 'Tornado' | 'Flood' | 'Winter Storm' | 'Hail' | 'Heat' | 'Cold' | 'Wildfire' | 'Other'
  state: string
  county: string
  beginDate: string
  endDate: string
  injuries: number
  deaths: number
  damageProperty: number
  damageCrops: number
  latitude: number
  longitude: number
}

export interface DisasterDeclaration {
  disasterNumber: string
  declarationType: 'Major Disaster' | 'Emergency' | 'Fire Management'
  declarationDate: string
  state: string
  county?: string
  incidentType: string
  title: string
  designatedArea: string
  latitude?: number
  longitude?: number
}

export interface MigrationData {
  originCounty: string
  destinationCounty: string
  year: number
  numberOfReturns: number
  numberOfExemptions: number
  aggregatedIncome: number
  originState: string
  destinationState: string
}

export interface EnergyDemand {
  date: string
  hour: number
  demand: number // in megawatts
  region: string
  state: string
  temperature?: number
  coolingLoad?: number
  heatingLoad?: number
}

export interface CoolingWarmingCosts {
  county: string
  state: string
  year: number
  coolingCosts: number // annual cooling costs ($)
  heatingCosts: number // annual heating costs ($)
  coolingDegradeDays: number
  heatingDegreeDays: number
  totalEnergyBurden: number // % of income
}

export interface EmergencyMetrics {
  geoid: string // Census tract/county/zip code ID
  name: string
  state: string
  county: string
  latitude: number
  longitude: number

  // Disaster metrics
  stormEventsCount: number
  totalStormDamage: number
  disasterDeclarationsCount: number

  // Energy metrics
  coolingCosts: number
  heatingCosts: number
  totalEnergyBurden: number
  energyDemandPeak: number
  energyDemandAverage: number

  // Migration stress
  outMigration: number
  inMigration: number
  netMigration: number
  migrationStressScore: number // 0-100

  // Composite stress scores
  disasterStressScore: number // 0-100
  energyStressScore: number // 0-100
  overallStressScore: number // 0-100

  // Top stress indicator
  isTopStressed: boolean
  stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
}

export interface MapLayerConfig {
  id: string
  name: string
  enabled: boolean
  type: 'choropleth' | 'symbols' | 'heatmap'
  dataKey: keyof EmergencyMetrics
  color?: string
  icon?: string
  category?: 'emergency' | 'energy'
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

export interface GeographicLevel {
  type: 'census-tract' | 'zip-code' | 'county' | 'city' | 'state'
  id: string
  name: string
  boundary?: GeoJSON.Feature
}
