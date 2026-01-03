/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EIA_API_KEY: string
  readonly VITE_CENSUS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
