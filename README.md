# U.S. Energy Access Index

A comprehensive mapping tool for visualizing energy access across U.S. communities, similar to the Climate Vulnerability Index but focused on energy access metrics.

## Features

- **Interactive Map Visualization**: Explore energy access data at Census tract, County, and State levels
- **Multiple Indicators**: 
  - Overall Energy Access
  - Electricity Access
  - Energy Affordability
  - Energy Reliability
  - Renewable Energy
  - Energy Infrastructure
  - Energy Burden
- **Geographic Context**: Filter and view data by State, County, Census Tract, or Region
- **Responsive Design**: Modern, clean UI optimized for desktop and tablet viewing

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

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Leaflet** - Map visualization
- **React Leaflet** - React bindings for Leaflet
- **Lucide React** - Icon library

## Project Structure

```
src/
  components/
    Header.tsx          # Top navigation bar
    Sidebar.tsx         # Left sidebar with controls
    MapView.tsx         # Main map component
    IndicatorNav.tsx    # Indicator selection navigation
    GeographicSelector.tsx # Geographic context controls
  utils/
    mockData.ts        # Mock data generator
  App.tsx              # Main application component
  main.tsx             # Application entry point
```

## Data Integration

The application is configured to use real DOE datasets. Currently uses mock data for demonstration until real data is downloaded.

### Available Data Sources

1. **LEAD Tool (Low-Income Energy Affordability Data)**
   - Census tract level energy burden and affordability data
   - Manual download required from: https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool
   - Place CSV files in `data/raw/lead/`

2. **EIA API (Energy Information Administration)**
   - Electricity access, consumption, and price data
   - Requires API key (free registration): https://www.eia.gov/opendata/register.php
   - Set `VITE_EIA_API_KEY` in `.env` file

3. **OEDI (Open Energy Data Initiative)**
   - Grid data and renewable energy resources
   - Access at: https://data.openei.org/

4. **ResStock Dataset**
   - Residential building energy consumption
   - Download from: https://resstock.nrel.gov/datasets

### Setting Up Real Data

1. **Download LEAD Tool data:**
   ```bash
   # Download CSV files from LEAD Tool website
   # Place in data/raw/lead/
   ```

2. **Configure EIA API:**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   # Add your EIA API key
   ```

3. **Run data download script:**
   ```bash
   npm run download-data
   ```

4. **Process data:**
   - Data processing scripts will convert raw data to GeoJSON format
   - Processed data will be available in `data/processed/`

## License

MIT

