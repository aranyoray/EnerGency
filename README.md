# 🇺🇸 EnerGency - Emergency Preparedness & Energy Management Dashboard

An interactive, public-facing dashboard providing high-resolution insights on emergency preparedness, disaster management, and energy resilience across American communities. Built with data from NOAA, FEMA, EIA, Census Bureau, and DOE.

## ✨ Features

### 🗺️ Interactive Map Visualization
- **Census-level gradient visualization** showing stress levels across communities
- **Multiple geographic levels**: Census tract, ZIP code, County, City, and State
- **Hover tooltips** with detailed emergency metrics
- **Symbol overlays** for top stressed areas (⚠️ markers)
- **Real-time layer toggling** with checkboxes
- **Time slider** for viewing energy demand trends over time

### 📊 Emergency Metrics
- **Natural Disaster Events**: NOAA storm events, FEMA declarations, damage estimates
- **Cooling & Heating Costs**: Annual energy expenses and degree days
- **Energy Burden**: Percentage of household income spent on energy
- **Migration Stress**: Population movement patterns and community stability
- **Energy Demand**: Grid load patterns with hourly/daily/monthly views
- **Composite Stress Scores**: Overall risk assessment (Low, Moderate, High, Critical)

### 🎛️ Interactive Controls
- **Layer Controls**: Toggle different data overlays
  - Overall Stress Level (choropleth gradient)
  - Natural Disaster Events (symbols)
  - Cooling Costs (choropleth)
  - Heating Costs (choropleth)
  - Energy Burden (choropleth)
  - Migration Stress (choropleth)
  - Top Stressed Areas (⚠️ symbols)
- **Time Slider**: Navigate through energy demand data
  - Play/pause animation
  - Adjustable time steps (hour, day, week, month)
  - Date range selector
- **Geographic Filters**: Filter by state and geographic level

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Build

```bash
npm run build
```

### Deploy to Vercel

This project is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

Or simply connect your GitHub repository to Vercel for automatic deployments.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Leaflet** - Map visualization
- **React Leaflet** - React bindings for Leaflet
- **Lucide React** - Icon library
- **Vercel** - Deployment platform

## Project Structure

```
src/
  components/
    EnhancedMapView.tsx    # Main interactive map with all features
    LayerControls.tsx      # Layer toggle checkboxes
    TimeSlider.tsx         # Time navigation slider
    Header.tsx             # Top navigation bar
    Sidebar.tsx            # Left sidebar with controls
    MapView.tsx            # Original map component (legacy)
    IndicatorNav.tsx       # Indicator selection navigation
    GeographicSelector.tsx # Geographic context controls
  services/
    noaaData.ts                    # NOAA Storm Events data
    femaData.ts                    # FEMA Disaster Declarations
    censusData.ts                  # Census Migration data
    energyDemandData.ts            # EIA energy demand data
    emergencyMetricsAggregator.ts  # Combines all data sources
    eiaData.ts                     # EIA API integration
    leadData.ts                    # DOE LEAD tool data
  types/
    emergencyMetrics.ts   # TypeScript interfaces for emergency data
    energyData.ts         # TypeScript interfaces for energy data
  AppEnhanced.tsx         # Main application component
  App.tsx                 # Original application (legacy)
  main.tsx                # Application entry point
```

## Data Integration

The application integrates data from multiple authoritative sources. Currently uses mock data for demonstration; configure API keys and download datasets for production use.

### Data Sources

#### 1. **NOAA Storm Events Database**
   - **URL**: https://www.ncei.noaa.gov/stormevents/
   - **Data**: Storm events including hurricanes, tornadoes, floods, wildfires, heat/cold events
   - **Resolution**: County level with lat/long coordinates
   - **Format**: CSV files (public access)
   - **Integration**: `src/services/noaaData.ts`

#### 2. **FEMA Disaster Declarations**
   - **URL**: https://www.fema.gov/openfema-data-page/disaster-declarations-summaries
   - **API**: https://www.fema.gov/about/openfema/api
   - **Data**: Major disasters, emergencies, fire management declarations
   - **Resolution**: County and state level
   - **Format**: JSON API (public access, no key required)
   - **Integration**: `src/services/femaData.ts`

#### 3. **EIA (Energy Information Administration)**
   - **URL**: https://www.eia.gov/opendata/
   - **Data**: Energy demand (EIA-930), electricity prices, generation by source
   - **Resolution**: State, utility, and regional level; hourly data available
   - **Format**: JSON API (requires free API key)
   - **Setup**: Register at https://www.eia.gov/opendata/register.php, add `VITE_EIA_API_KEY` to `.env`
   - **Integration**: `src/services/energyDemandData.ts`, `src/services/eiaData.ts`

#### 4. **U.S. Census Bureau Migration Data**
   - **URL**: https://www.census.gov/data/tables/time-series/demo/geographic-mobility/county-to-county-migration.html
   - **IRS Data**: https://www.irs.gov/statistics/soi-tax-stats-migration-data
   - **Data**: County-to-county migration flows, population estimates
   - **Resolution**: County level
   - **Format**: CSV files
   - **Integration**: `src/services/censusData.ts`

#### 5. **DOE LEAD Tool**
   - **URL**: https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool
   - **Data**: Energy burden, household characteristics, energy costs
   - **Resolution**: Census tract level
   - **Format**: CSV files (manual download)
   - **Integration**: `src/services/leadData.ts`

#### 6. **ISO/RTO High-Resolution Load Data** (Optional)
   - **ERCOT**: https://www.ercot.com/mp/data-products/
   - **PJM**: https://dataminer2.pjm.com/list
   - **CAISO**: https://oasis.caiso.com/
   - **Data**: Real-time and historical grid load data
   - **Resolution**: Hourly/sub-hourly
   - **Note**: Use for enhanced energy demand visualization

### Setting Up Real Data

1. **Configure API Keys:**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env

   # Edit .env and add your API keys:
   # VITE_EIA_API_KEY=your_key_here
   # VITE_CENSUS_API_KEY=your_key_here (optional)
   ```

2. **Download Dataset Files:**
   - **NOAA Storm Events**: Download CSV files from https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/
   - **Census Migration**: Download from https://www.irs.gov/statistics/soi-tax-stats-migration-data
   - **LEAD Tool**: Download from https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool
   - Place downloaded files in `data/raw/` subdirectories

3. **Process Data (Optional):**
   ```bash
   npm run download-data
   ```
   This will process downloaded datasets and prepare them for the application.

4. **Production Deployment:**
   - For production use, consider setting up a backend API to serve processed data
   - This avoids rate limits and improves performance
   - The current implementation uses mock data for demonstration

## 🎯 Usage Guide

### Map Interaction

1. **Viewing Emergency Metrics:**
   - Hover over any area on the map to see detailed tooltips
   - Tooltips show disaster events, energy costs, and migration data
   - Color intensity indicates stress level severity

2. **Toggling Layers:**
   - Click the **Map Layers** panel in the top-right
   - Check/uncheck layers to show different data overlays
   - Multiple choropleth layers available (stress, costs, burden, migration)
   - Symbol overlays for disaster events and top stressed areas

3. **Time Navigation:**
   - Use the **time slider** at the bottom to navigate dates
   - Click the play button to auto-advance through time
   - View energy demand trends and seasonal patterns
   - Adjust time step (hour/day/week/month) as needed

4. **Geographic Filtering:**
   - Select **Geographic Level** to change zoom (state/county/city/ZIP/tract)
   - Choose a specific **State** to focus on regional data
   - Map automatically adjusts boundaries and detail level

### Understanding Stress Levels

- **🟢 Low (0-25)**: Minimal risk, stable conditions
- **🟡 Moderate (25-50)**: Some concerns, monitoring recommended
- **🟠 High (50-75)**: Significant challenges, preparedness advised
- **🔴 Critical (75-100)**: Severe conditions, immediate attention needed

### Interpreting Metrics

- **Disaster Stress Score**: Based on frequency, damage, and casualties from storm events and FEMA declarations
- **Energy Stress Score**: Calculated from peak demand ratios and energy burden percentage
- **Migration Stress Score**: High outmigration indicates economic or environmental pressures
- **Overall Stress Score**: Weighted combination of all factors (40% disaster, 40% energy, 20% migration)

## 🚀 Deployment on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/energency)

### Manual Deployment

1. **Connect to Vercel:**
   - Push your code to GitHub
   - Import project in Vercel dashboard
   - Vercel auto-detects Vite configuration

2. **Configure Environment Variables:**
   - Add `VITE_EIA_API_KEY` in Vercel project settings
   - Add `VITE_CENSUS_API_KEY` (optional)

3. **Deploy:**
   - Vercel automatically builds and deploys on every push
   - Production URL will be provided

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for American communities**

