# Energy Access Index - Dataset Sources

This document outlines the DOE datasets integrated into the Energy Access Index application.

## Primary Data Sources

### 1. Low-Income Energy Affordability Data (LEAD) Tool
**Source**: U.S. Department of Energy  
**URL**: https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool  
**Resolution**: Census Tract  
**Format**: CSV  
**Indicators**:
- Energy burden (percentage of income spent on energy)
- Low-income energy burden
- Median energy costs
- Household characteristics
- Housing unit characteristics

**Access**: Manual download required from LEAD Tool website  
**Data Location**: `data/raw/lead/`

**Key Fields**:
- GEOID (Census tract identifier)
- State, County, Tract
- Energy Burden (%)
- Low-Income Energy Burden (%)
- Median Energy Cost ($)
- Total Households
- Low-Income Households

### 2. Energy Information Administration (EIA) API
**Source**: U.S. Energy Information Administration  
**URL**: https://www.eia.gov/opendata/  
**Resolution**: State, Utility, Plant level  
**Format**: JSON API  
**Indicators**:
- Electricity generation by source
- Retail electricity sales
- Average retail prices
- Electricity consumption
- Power plant data

**Access**: Free API key required (register at https://www.eia.gov/opendata/register.php)  
**API Key**: Set `VITE_EIA_API_KEY` in `.env` file

**Key Endpoints**:
- `/electricity/retail-sales/data/` - Retail electricity sales and prices
- `/electricity/facility-fuel/data/` - Power plant fuel consumption
- `/electricity/rto/region-data/data/` - Regional electricity data

### 3. Open Energy Data Initiative (OEDI)
**Source**: National Renewable Energy Laboratory (NREL)  
**URL**: https://data.openei.org/  
**Resolution**: Varies by dataset  
**Format**: CSV, JSON, GeoJSON  
**Indicators**:
- Grid infrastructure data
- Renewable energy resource potential
- Energy storage data
- Grid integration studies

**Access**: Public datasets available for download  
**Data Location**: `data/raw/oedi/`

### 4. ResStock Dataset
**Source**: National Renewable Energy Laboratory (NREL)  
**URL**: https://resstock.nrel.gov/datasets  
**Resolution**: Census Tract, Building level  
**Format**: CSV, Parquet  
**Indicators**:
- Residential building energy consumption
- Heating and cooling loads
- Appliance usage patterns
- Building stock characteristics

**Access**: Public datasets available for download  
**Data Location**: `data/raw/resstock/`

### 5. Emissions & Generation Resource Integrated Database (eGRID)
**Source**: U.S. Environmental Protection Agency  
**URL**: https://www.epa.gov/egrid  
**Resolution**: Plant, State, Regional level  
**Format**: Excel, CSV  
**Indicators**:
- Power plant emissions
- Electricity generation by fuel type
- Renewable energy percentage
- Grid reliability metrics

**Access**: Public datasets available for download  
**Data Location**: `data/raw/egrid/`

## Data Processing Pipeline

1. **Download**: Raw data files downloaded from sources
2. **Extract**: Data extracted and validated
3. **Transform**: Data converted to standardized `EnergyAccessMetrics` format
4. **Aggregate**: Data aggregated by geographic level (Tract, County, State)
5. **Geocode**: Geographic coordinates and boundaries added
6. **Export**: Processed data exported as GeoJSON for mapping

## Data Integration Status

- ✅ **Data Types**: TypeScript interfaces defined
- ✅ **Data Services**: Service layer for fetching and processing
- ✅ **Data Aggregation**: Functions for combining multiple sources
- ✅ **GeoJSON Conversion**: Utilities for map visualization
- ⏳ **LEAD Data**: Requires manual download and CSV processing
- ⏳ **EIA Data**: API integration ready, requires API key
- ⏳ **OEDI Data**: Framework ready, requires dataset download
- ⏳ **ResStock Data**: Framework ready, requires dataset download

## Next Steps

1. **Download LEAD Tool CSV files**:
   - Visit https://www.energy.gov/scep/low-income-energy-affordability-data-lead-tool
   - Download census tract level data
   - Place CSV files in `data/raw/lead/`

2. **Register for EIA API Key**:
   - Visit https://www.eia.gov/opendata/register.php
   - Register for free API key
   - Add key to `.env` file as `VITE_EIA_API_KEY`

3. **Download OEDI Datasets**:
   - Browse available datasets at https://data.openei.org/
   - Download relevant grid and renewable energy datasets
   - Place in `data/raw/oedi/`

4. **Download ResStock Data**:
   - Visit https://resstock.nrel.gov/datasets
   - Download residential building energy datasets
   - Place in `data/raw/resstock/`

5. **Process Data**:
   - Run data processing scripts to convert to GeoJSON
   - Validate data quality and completeness
   - Update data loading utilities with real data paths

## Data Quality Notes

- **Census Tract Coverage**: LEAD Tool provides comprehensive census tract coverage
- **Temporal Coverage**: Data availability varies by source (typically 2010-present)
- **Missing Data**: Some tracts may have missing data; handled gracefully in application
- **Data Updates**: Sources update at different frequencies; implement refresh strategy

## References

- [DOE Open Energy Data](https://www.energy.gov/data/open-energy-data)
- [EIA Open Data](https://www.eia.gov/opendata/)
- [NREL Data Catalog](https://www.nrel.gov/data/)
- [EPA eGRID](https://www.epa.gov/egrid)

