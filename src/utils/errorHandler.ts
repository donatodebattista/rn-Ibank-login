import {
  SUPABASE_ERROR_MAPPINGS,
  DEFAULT_ERROR_MESSAGE,
  GENERIC_AUTH_ERROR,
} from '@/constants/errors';

import { logger } from '@/utils/logger';

export interface ParsedAuthError {
  message: string;
  isEmailUnconfirmed: boolean;
  isRateLimited: boolean;
  isGenericAuthError: boolean;
}

export function parseSupabaseError(error: any): ParsedAuthError {
  if (!error) {
    return {
      message: DEFAULT_ERROR_MESSAGE,
      isEmailUnconfirmed: false,
      isRateLimited: false,
      isGenericAuthError: false,
    };
  }

  logger.error('Error capturado por parseSupabaseError:', error);

  const rawMessage: string = String(error?.message || error?.error_description || error || '');
  const status: number = Number(error?.status || 0);
  const code: string = String(error?.code || '');

  // Rate Limiting (HTTP 429 or rate limit keyword)
  const isRateLimited =
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    rawMessage.toLowerCase().includes('rate limit') ||
    rawMessage.toLowerCase().includes('too many requests');

  if (isRateLimited) {
    const isEmailLimit =
      code === 'over_email_send_rate_limit' ||
      rawMessage.toLowerCase().includes('email rate limit');

    return {
      message: isEmailLimit
        ? 'Límite de correos alcanzado (Supabase limita a 3-4 correos/hora con el servicio gratuito). Espera unos momentos o usa otro email para pruebas.'
        : 'Demasiados intentos. Por favor espera 60 segundos antes de reintentar.',
      isEmailUnconfirmed: false,
      isRateLimited: true,
      isGenericAuthError: false,
    };
  }

  // Email not confirmed
  const isEmailUnconfirmed =
    code === 'email_not_confirmed' ||
    rawMessage.toLowerCase().includes('email not confirmed');

  if (isEmailUnconfirmed) {
    return {
      message: 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada.',
      isEmailUnconfirmed: true,
      isRateLimited: false,
      isGenericAuthError: false,
    };
  }

  // Invalid login credentials / anti-enumeration generic error
  const isGenericAuth =
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    rawMessage.toLowerCase().includes('invalid login credentials') ||
    rawMessage.toLowerCase().includes('invalid credentials');

  if (isGenericAuth) {
    return {
      message: GENERIC_AUTH_ERROR,
      isEmailUnconfirmed: false,
      isRateLimited: false,
      isGenericAuthError: true,
    };
  }

  // Check mapped errors
  if (SUPABASE_ERROR_MAPPINGS[code]) {
    return {
      message: SUPABASE_ERROR_MAPPINGS[code],
      isEmailUnconfirmed: false,
      isRateLimited: false,
      isGenericAuthError: false,
    };
  }

  // Search by keyword in mappings
  for (const [key, translated] of Object.entries(SUPABASE_ERROR_MAPPINGS)) {
    if (rawMessage.toLowerCase().includes(key.toLowerCase())) {
      return {
        message: translated,
        isEmailUnconfirmed: false,
        isRateLimited: false,
        isGenericAuthError: false,
      };
    }
  }

  // Network error detection
  if (
    rawMessage.toLowerCase().includes('network') ||
    rawMessage.toLowerCase().includes('fetch failed') ||
    rawMessage.toLowerCase().includes('failed to fetch')
  ) {
    return {
      message: 'Error de conexión. Verifica tu acceso a internet.',
      isEmailUnconfirmed: false,
      isRateLimited: false,
      isGenericAuthError: false,
    };
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
    isEmailUnconfirmed: false,
    isRateLimited: false,
    isGenericAuthError: false,
  };
}
