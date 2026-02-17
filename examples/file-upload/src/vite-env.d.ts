/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_COS_SECRET_ID?: string;
    readonly VITE_COS_SECRET_KEY?: string;
    readonly VITE_COS_BUCKET?: string;
    readonly VITE_COS_REGION?: string;
    readonly VITE_COS_CUSTOM_DOMAIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
