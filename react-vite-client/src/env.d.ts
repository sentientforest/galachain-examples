/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_NETWORK_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
