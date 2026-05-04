/**
 * Centralized configuration for environment variables
 * Provides type-safe access to all environment variables
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  },
  auth: {
    tokenKey: process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'admin_auth_token',
    refreshTokenKey: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_KEY || 'admin_refresh_token',
    jwtSecret: process.env.JWT_SECRET || '',
  },
  session: {
    timeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000', 10),
    tokenRefreshInterval: parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL || '300000', 10),
  },
  app: {
    env: (process.env.NEXT_PUBLIC_APP_ENV || 'development') as
      | 'development'
      | 'staging'
      | 'production',
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Healthcare Market Research Admin',
  },
  features: {
    darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  media: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760', 10),
    allowedFileTypes: (
      process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp'
    ).split(','),
  },
  preview: {
    domain: process.env.NEXT_PUBLIC_PREVIEW_DOMAIN || '',
  },
} as const;
