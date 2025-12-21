/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_TWILIO_ACCOUNT_SID?: string;
  readonly VITE_TWILIO_VERIFY_SERVICE_SID?: string;
  readonly VITE_TWILIO_AUTH_TOKEN?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

