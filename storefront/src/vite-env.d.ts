/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Koren backend-a bez `/api`, npr. `http://localhost:8080` */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
