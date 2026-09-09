export const SUPABASE_ERROR_MAPPINGS: Record<string, string> = {
  // Auth errors
  'invalid_credentials': 'Email o contraseña incorrectos',
  'invalid_grant': 'Email o contraseña incorrectos',
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'User already registered': 'Si el email no está registrado, recibirás un correo de confirmación',
  'user_already_exists': 'Si el email no está registrado, recibirás un correo de confirmación',
  'Email not confirmed': 'Debes confirmar tu correo electrónico antes de iniciar sesión',
  'email_not_confirmed': 'Debes confirmar tu correo electrónico antes de iniciar sesión',
  'signup_disabled': 'El registro de nuevos usuarios está deshabilitado temporalmente',
  'over_email_send_rate_limit': 'Demasiados intentos. Por favor espera un minuto antes de reintentar',
  'over_request_rate_limit': 'Demasiadas solicitudes. Por favor espera unos momentos',
  'user_not_found': 'Si el email existe en nuestro sistema, vas a recibir instrucciones',
  'weak_password': 'La contraseña no cumple con los requisitos mínimos de seguridad',
  'rate_limit': 'Demasiados intentos. Por favor espera 60 segundos',
  'network_error': 'No se pudo conectar con el servidor. Verifica tu conexión a internet',
  'recovery_expired': 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo',
};

export const DEFAULT_ERROR_MESSAGE = 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.';
export const GENERIC_AUTH_ERROR = 'Email o contraseña incorrectos';
export const GENERIC_RECOVERY_SUCCESS = 'Si el email existe en nuestro sistema, vas a recibir instrucciones';
export const GENERIC_SIGNUP_SUCCESS = 'Si el correo no está registrado, vas a recibir un correo con el enlace de confirmación';
export const RATE_LIMIT_COOLDOWN_SECONDS = 60;
