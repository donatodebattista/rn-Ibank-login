/**
 * Secure logging utility that prevents accidental exposure of sensitive
 * tokens, passwords, and secrets in console output.
 */

const SENSITIVE_KEYS = [
  'password',
  'newpassword',
  'confirmPassword',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'secret',
  'apikey',
  'authorization',
  'bearer',
];

function sanitize(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Mask potential bearer token or jwt
    if (data.startsWith('ey') && data.length > 30) {
      return '[REDACTED_JWT]';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      const lower = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((s) => lower.includes(s));
      if (isSensitive) {
        cleaned[key] = '[REDACTED]';
      } else {
        cleaned[key] = sanitize(data[key]);
      }
    }
    return cleaned;
  }
  return data;
}

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[iBank:INFO] ${message}`, ...args.map(sanitize));
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[iBank:WARN] ${message}`, ...args.map(sanitize));
    }
  },
  error: (message: string, ...args: any[]) => {
    if (isDev) {
      console.error(`[iBank:ERROR] ${message}`, ...args.map(sanitize));
    }
  },
};
