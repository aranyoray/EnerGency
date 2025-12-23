# Energy Access Data

This directory contains energy access datasets from various DOE sources.

## Directory Structure

```
data/
├── raw/              # Raw data files from sources
│   ├── lead/         # LEAD Tool CSV files
│   ├── eia/          # EIA API data
│   └── oedi/         # OEDI datasets
└── processed/        # Processed GeoJSON files ready for mapping
```

## Data Sources

### 1. Low-Income Energy Affordability Data (LEAD) Tool
- **Source**: https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool
- **Format**: CSV files
- **Resolution**: Census tract level
- **Indicators**: Energy burden, expenditures, household characteristics
- **Download**: Manual download required from LEAD Tool website

### 2. Energy Information Administration (EIA)
- **Source**: https://www.eia.gov/opendata/
- **Format**: JSON API
- **Resolution**: State and utility level
- **Indicators**: Electricity access, consumption, prices
- **API Key**: Required (register at https://www.eia.gov/opendata/register.php)

### 3. Open Energy Data Initiative (OEDI)
- **Source**: https://data.openei.org/
- **Format**: Various (CSV, JSON, GeoJSON)
- **Resolution**: Varies by dataset
- **Indicators**: Grid data, renewable energy resources

### 4. ResStock Dataset
- **Source**: https://resstock.nrel.gov/datasets
- **Format**: CSV, Parquet
- **Resolution**: Census tract and building level
- **Indicators**: Residential energy consumption

## Data Processing

Run the download script to get started:

```bash
npm run download-data
```

For EIA data, set your API key:

```bash
EIA_API_KEY=your_key npm run download-data
```

## Data Format

Processed data follows the `EnergyAccessMetrics` interface defined in `src/types/energyData.ts`:

- Census tract identifiers (GEOID, state, county, tract)
- Overall energy access score (0-100)
- Component metrics (electricity access, affordability, reliability, etc.)
- Geographic coordinates for mapping

## License

Data sources maintain their respective licenses. Please review:
- DOE data: Public domain
- EIA data: Public domain
- Census data: Public domain

