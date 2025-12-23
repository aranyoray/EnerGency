// Type definitions for energy access data

export interface EnergyAccessMetrics {
  tractId: string
  state: string
  county: string
  tract: string
  
  // Overall Energy Access Score (0-100)
  overallScore: number
  
  // Electricity Access
  electricityAccess: {
    percentConnected: number // Percentage of households with electricity
    reliabilityScore: number // Outage frequency score (0-100)
    averageOutageDuration: number // Hours per year
  }
  
  // Energy Affordability
  affordability: {
    energyBurden: number // Percentage of income spent on energy
    medianEnergyCost: number // Annual energy cost in dollars
    lowIncomeBurden: number // Energy burden for low-income households
  }
  
  // Energy Reliability
  reliability: {
    saidi: number // System Average Interruption Duration Index (minutes)
    saifi: number // System Average Interruption Frequency Index (outages/year)
    reliabilityScore: number // Composite score (0-100)
  }
  
  // Renewable Energy
  renewableEnergy: {
    renewablePercentage: number // % of energy from renewable sources
    solarCapacity: number // MW of solar capacity
    windCapacity: number // MW of wind capacity
    renewableScore: number // Composite score (0-100)
  }
  
  // Energy Infrastructure
  infrastructure: {
    gridAge: number // Average age of infrastructure
    capacityScore: number // Grid capacity adequacy (0-100)
    modernizationScore: number // Infrastructure modernization score (0-100)
  }
  
  // Energy Burden
  energyBurden: {
    overallBurden: number // Overall energy burden percentage
    lowIncomeBurden: number // Low-income energy burden
    highBurdenHouseholds: number // Number of households with >6% burden
  }
  
  // Geographic coordinates for mapping
  coordinates?: {
    lat: number
    lng: number
  }
  
  // Bounding box for tract
  bounds?: [[number, number], [number, number]]
}

export interface EnergyDataResponse {
  data: EnergyAccessMetrics[]
  metadata: {
    source: string
    lastUpdated: string
    totalTracts: number
  }
}

