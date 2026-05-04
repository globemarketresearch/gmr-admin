declare namespace NodeJS {
  interface ProcessEnv {
    // Backend API Configuration
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_API_TIMEOUT: string;

    // Authentication
    NEXT_PUBLIC_JWT_TOKEN_KEY: string;
    NEXT_PUBLIC_JWT_REFRESH_TOKEN_KEY: string;
    JWT_SECRET: string;

    // Session Configuration
    NEXT_PUBLIC_SESSION_TIMEOUT: string;
    NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL: string;

    // Environment
    NEXT_PUBLIC_APP_ENV: 'development' | 'staging' | 'production';
    NEXT_PUBLIC_APP_NAME: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_DARK_MODE: string;
    NEXT_PUBLIC_ENABLE_ANALYTICS: string;

    // Media/Upload Configuration
    NEXT_PUBLIC_MAX_FILE_SIZE: string;
    NEXT_PUBLIC_ALLOWED_FILE_TYPES: string;

    // Preview Domain
    NEXT_PUBLIC_PREVIEW_DOMAIN?: string;
  }
}
