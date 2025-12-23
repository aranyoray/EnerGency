// Data source configurations and endpoints for DOE datasets

export const DATA_SOURCES = {
  LEAD: {
    name: 'Low-Income Energy Affordability Data (LEAD)',
    url: 'https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool',
    api: null, // LEAD Tool doesn't have public API, requires manual download
    description: 'Census tract level data on energy burden, expenditures, and household characteristics',
    indicators: ['energyBurden', 'affordability', 'lowIncomeBurden']
  },
  
  EIA: {
    name: 'Energy Information Administration',
    url: 'https://www.eia.gov/opendata/',
    api: 'https://api.eia.gov/v2/',
    apiKeyRequired: true,
    description: 'Comprehensive energy data including electricity access, consumption, and prices',
    indicators: ['electricityAccess', 'consumption', 'prices']
  },
  
  OEDI: {
    name: 'Open Energy Data Initiative',
    url: 'https://data.openei.org/',
    api: 'https://api.openei.org/',
    description: 'Open access energy datasets including grid data and renewable energy resources',
    indicators: ['renewableEnergy', 'gridData', 'infrastructure']
  },
  
  RESSTOCK: {
    name: 'ResStock Dataset',
    url: 'https://resstock.nrel.gov/datasets',
    api: null,
    description: 'Residential building energy consumption data at high geographic resolution',
    indicators: ['residentialConsumption', 'buildingStock']
  },
  
  EGRID: {
    name: 'Emissions & Generation Resource Integrated Database',
    url: 'https://www.epa.gov/egrid',
    api: null,
    description: 'Power plant emissions and generation data',
    indicators: ['emissions', 'generation', 'renewablePercentage']
  }
} as const

export interface DataSourceConfig {
  name: string
  url: string
  api: string | null
  apiKeyRequired?: boolean
  description: string
  indicators: string[]
}

