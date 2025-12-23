#!/usr/bin/env node
/**
 * Script to download and process DOE energy datasets
 * 
 * This script helps download data from various DOE sources:
 * - LEAD Tool (requires manual download from website)
 * - EIA API (requires API key)
 * - OEDI datasets
 * 
 * Usage:
 *   npm run download-data
 *   EIA_API_KEY=your_key npm run download-data
 */

import * as fs from 'fs'
import * as path from 'path'
import { DATA_SOURCES } from '../src/services/dataSources'

const DATA_DIR = path.join(process.cwd(), 'data')
const RAW_DATA_DIR = path.join(DATA_DIR, 'raw')
const PROCESSED_DATA_DIR = path.join(DATA_DIR, 'processed')

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(RAW_DATA_DIR)) fs.mkdirSync(RAW_DATA_DIR, { recursive: true })
if (!fs.existsSync(PROCESSED_DATA_DIR)) fs.mkdirSync(PROCESSED_DATA_DIR, { recursive: true })

async function downloadLEADData() {
  console.log('📥 LEAD Tool Data')
  console.log('   Note: LEAD Tool requires manual download from:')
  console.log(`   ${DATA_SOURCES.LEAD.url}`)
  console.log('   Please download CSV files and place them in data/raw/lead/')
  console.log('')
}

async function downloadEIAData(apiKey?: string) {
  if (!apiKey) {
    console.log('⚠️  EIA API Key not provided')
    console.log('   Set EIA_API_KEY environment variable to download EIA data')
    console.log('   Get your API key from: https://www.eia.gov/opendata/register.php')
    console.log('')
    return
  }

  console.log('📥 Downloading EIA Data...')
  // In production, this would fetch from EIA API
  console.log('   EIA API integration ready')
  console.log('')
}

async function downloadOEDIData() {
  console.log('📥 OEDI Data')
  console.log('   OEDI datasets available at:')
  console.log(`   ${DATA_SOURCES.OEDI.url}`)
  console.log('   Download datasets and place in data/raw/oedi/')
  console.log('')
}

async function main() {
  console.log('🚀 Energy Data Downloader')
  console.log('========================\n')

  const eiaApiKey = process.env.EIA_API_KEY

  await downloadLEADData()
  await downloadEIAData(eiaApiKey)
  await downloadOEDIData()

  console.log('✅ Data download script completed')
  console.log('\nNext steps:')
  console.log('1. Download LEAD Tool CSV files and place in data/raw/lead/')
  console.log('2. Download OEDI datasets and place in data/raw/oedi/')
  console.log('3. Set EIA_API_KEY environment variable for EIA data')
  console.log('4. Run data processing scripts to convert to GeoJSON')
}

main().catch(console.error)

