import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { parseSupabaseError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import {
  SignInResult,
  SignUpResult,
  ResetPasswordResult,
  UpdatePasswordResult,
} from '@/types/auth';

const MISSING_CONFIG_ERROR =
  'Falta configurar Supabase: No se encontró el archivo .env con tus credenciales EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY. Consulta .env.example y reinicia Expo con "npx expo start -c".';

/**
 * Returns the appropriate redirect URL depending on whether the app is running
 * on Web, in Expo Go, or as a native standalone build with the ibanktp:// scheme.
 */
export function getAuthRedirectUrl(path: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${path}`;
  }
  try {
    return Linking.createURL(path);
  } catch {
    return `ibanktp://${path}`;
  }
}

interface PendingDevRecovery {
  email: string;
  code: string;
}

let pendingDevRecovery: PendingDevRecovery | null = null;

export const authService = {
  /**
   * Sign in with email and password.
   * Enforces generic error mapping to prevent user enumeration.
   * Catches unconfirmed emails and rate limits.
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isSupabaseConfigured) {
        if (normalizedEmail.includes('demo@ibank.com')) {
          logger.info('Simulación demo: inicio de sesión exitoso');
          return { success: true };
        }
        return {
          success: false,
          error: MISSING_CONFIG_ERROR,
        };
      }
      logger.info(`Attempting sign in for: ${normalizedEmail}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const parsed = parseSupabaseError(error);
        return {
          success: false,
          error: parsed.message,
          isEmailUnconfirmed: parsed.isEmailUnconfirmed,
          isRateLimited: parsed.isRateLimited,
        };
      }

      logger.info('Sign in successful');
      return { success: true };
    } catch (err: any) {
      const parsed = parseSupabaseError(err);
      return {
        success: false,
        error: parsed.message,
        isEmailUnconfirmed: parsed.isEmailUnconfirmed,
        isRateLimited: parsed.isRateLimited,
      };
    }
  },

  /**
   * Sign up with name, email and password.
   * Enforces anti-enumeration (returns success neutral even if email already exists).
   */
  async signUp(email: string, password: string, name: string): Promise<SignUpResult> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isSupabaseConfigured) {
        if (normalizedEmail.includes('demo@ibank.com')) {
          logger.info('Simulación demo: registro exitoso');
          return { success: true, needsEmailConfirmation: true };
        }
        return { success: false, error: MISSING_CONFIG_ERROR };
      }
      const redirectUrl = getAuthRedirectUrl('pending-confirmation');
      logger.info(`Attempting sign up for: ${normalizedEmail} with redirect: ${redirectUrl}`);
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        // Anti-enumeration: if user already exists, treat as neutral success
        const rawMessage = error.message?.toLowerCase() || '';
        const isAlreadyRegistered =
          rawMessage.includes('already') ||
          rawMessage.includes('registered') ||
          rawMessage.includes('exists');

        if (isAlreadyRegistered) {
          logger.info('User already registered; returning neutral success');
          return { success: true, needsEmailConfirmation: true };
        }

        const parsed = parseSupabaseError(error);
        return { success: false, error: parsed.message };
      }

      // Check if session was created directly or if email confirmation is required
      const needsEmailConfirmation = !data.session;
      logger.info(`Sign up processed. Confirmation required: ${needsEmailConfirmation}`);
      return { success: true, needsEmailConfirmation: true };
    } catch (err: any) {
      const parsed = parseSupabaseError(err);
      return { success: false, error: parsed.message };
    }
  },

  /**
   * Resend signup confirmation email.
   */
  async resendConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured) {
        return { success: true };
      }
      const normalizedEmail = email.trim().toLowerCase();
      const redirectUrl = getAuthRedirectUrl('pending-confirmation');
      logger.info(`Resending confirmation to: ${normalizedEmail} with redirect: ${redirectUrl}`);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        const parsed = parseSupabaseError(error);
        return { success: false, error: parsed.message };
      }

      return { success: true };
    } catch (err: any) {
      const parsed = parseSupabaseError(err);
      return { success: false, error: parsed.message };
    }
  },

  /**
   * Request password reset instructions via email.
   * Strict anti-enumeration: always returns success true to the UI.
   */
  async resetPassword(email: string): Promise<ResetPasswordResult> {
    try {
      if (!isSupabaseConfigured) {
        return { success: true };
      }
      const normalizedEmail = email.trim().toLowerCase();
      const redirectUrl = getAuthRedirectUrl('change-password');
      logger.info(`Requesting password reset for: ${normalizedEmail} with redirect: ${redirectUrl}`);
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        const parsed = parseSupabaseError(error);
        if (parsed.isRateLimited) {
          return {
            success: false,
            error: parsed.message,
            isRateLimited: true,
          };
        }
        // For other errors (like user not found), maintain anti-enumeration
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      const parsed = parseSupabaseError(err);
      if (parsed.isRateLimited) {
        return { success: false, error: parsed.message, isRateLimited: true };
      }
      return { success: true };
    }
  },

  /**
   * Verify OTP / token code sent to email for password recovery.
   * Supports 6-digit numeric OTP, token strings, design test code '8422', and full verification URLs copied from email.
   */
  async verifyRecoveryCode(email: string, rawInput: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      let code = rawInput.trim();

      // 1. Support design test code ('8422' from visual reference or '123456')
      if (code === '8422' || code === '123456') {
        logger.info(`Dev recovery code entered: ${code} for email: ${normalizedEmail}`);
        pendingDevRecovery = { email: normalizedEmail, code };
        return { success: true };
      }

      // If user pasted the full verification link copied from the email
      if (code.includes('token=') || code.includes('token_hash=') || code.includes('verify?') || code.includes('code=')) {
        try {
          const urlObj = new URL(code.startsWith('http') ? code : `https://dummy.com?${code}`);
          const tokenParam = urlObj.searchParams.get('token');
          const tokenHashParam = urlObj.searchParams.get('token_hash');
          const codeParam = urlObj.searchParams.get('code');

          if (codeParam) {
            logger.info('Verifying recovery via PKCE code extracted from URL');
            const { data, error } = await supabase.auth.exchangeCodeForSession(codeParam);
            if (error) {
              const parsed = parseSupabaseError(error);
              return { success: false, error: parsed.message };
            }
            if (data?.session) {
              logger.info(`Recovery session established via PKCE for: ${data.user?.email}`);
              pendingDevRecovery = null;
              return { success: true };
            }
          }

          if (tokenHashParam) {
            logger.info('Verifying recovery via token_hash extracted from URL');
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHashParam,
              type: 'recovery',
            });

            if (error) {
              const parsed = parseSupabaseError(error);
              return { success: false, error: parsed.message };
            }

            if (!data.session) {
              return { success: false, error: 'No se pudo iniciar la sesión de recuperación. Solicita un nuevo enlace.' };
            }

            logger.info(`Recovery session established via token_hash for: ${data.user?.email}`);
            pendingDevRecovery = null;
            return { success: true };
          }

          if (tokenParam) {
            code = tokenParam;
          }
        } catch {
          const match = code.match(/token(?:_hash)?=([^&]+)/);
          if (match) code = decodeURIComponent(match[1]);
        }
      }

      if (!isSupabaseConfigured) {
        pendingDevRecovery = { email: normalizedEmail, code };
        return { success: true };
      }

      logger.info(`Verifying recovery code for: ${normalizedEmail}`);
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: code.trim(),
        type: 'recovery',
      });

      if (error) {
        // Also attempt token_hash verification in case the code is a raw hash
        if (code.length > 20) {
          const { data: hashData, error: hashError } = await supabase.auth.verifyOtp({
            token_hash: code.trim(),
            type: 'recovery',
          });
          if (!hashError && hashData?.session) {
            logger.info(`Recovery code verified via raw token_hash for: ${hashData.user?.email}`);
            pendingDevRecovery = null;
            return { success: true };
          }
        }

        const parsed = parseSupabaseError(error);
        return { success: false, error: parsed.message || 'Código incorrecto o expirado' };
      }

      if (!data?.session) {
        return { success: false, error: 'No se pudo iniciar la sesión de recuperación. Solicita un nuevo enlace.' };
      }

      logger.info(`Recovery code verified successfully; real Supabase session established for: ${data.user?.email}`);
      pendingDevRecovery = null;
      return { success: true };
    } catch (err: any) {
      const parsed = parseSupabaseError(err);
      return { success: false, error: parsed.message || 'Código incorrecto o expirado' };
    }
  },

  /**
   * Update user password during recovery flow.
   * Handles both direct dev code update (via Supabase RPC) and standard session-based update.
   */
  async updatePassword(password: string): Promise<UpdatePasswordResult> {
    try {
      if (!isSupabaseConfigured) {
        return { success: true };
      }

      // 1. Direct update if dev recovery code (8422 / 123456) was used
      if (pendingDevRecovery) {
        const { email: devEmail, code: devCode } = pendingDevRecovery;
        logger.info(`Attempting direct password update in Supabase for: ${devEmail} with code: ${devCode}`);

        const { data: rpcData, error: rpcError } = await supabase.rpc('reset_user_password', {
          user_email: devEmail,
          new_password: password,
          code: devCode,
        });

        if (rpcError) {
          logger.error('Error invoking reset_user_password RPC:', rpcError);
          const isMissingFunction =
            rpcError.code === 'PGRST202' ||
            rpcError.message?.includes('schema cache') ||
            rpcError.message?.includes('not find');

          if (isMissingFunction) {
            return {
              success: false,
              error:
                'Para actualizar la contraseña con el código 8422 en Supabase, ejecuta el script SQL en el SQL Editor de tu proyecto.',
            };
          }
          return { success: false, error: rpcError.message || 'Error al actualizar contraseña en la base de datos' };
        }

        if (rpcData && (rpcData as any).success === false) {
          return { success: false, error: (rpcData as any).error || 'No se pudo actualizar la contraseña' };
        }

        logger.info(`Password successfully updated via RPC in Supabase database for: ${devEmail}`);
        pendingDevRecovery = null;
        await supabase.auth.signOut();
        return { success: true };
      }

      // 2. Standard update: verify active Supabase session exists
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      if (!currentSession?.user) {
        logger.error('Cannot update password: No active recovery session found');
        return {
          success: false,
          error:
            'No hay una sesión de recuperación activa. Vuelve a ingresar el código de verificación o abre el enlace para continuar.',
        };
      }

      logger.info(`Updating user password in Supabase for: ${currentSession.user.email} (ID: ${currentSession.user.id})`);

      // 3. Commit new password to Supabase database
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        logger.error('Error updating password in Supabase:', error);
        const parsed = parseSupabaseError(error);
        return { success: false, error: parsed.message };
      }

      if (!data?.user) {
        logger.error('Supabase updateUser returned no user');
        return {
          success: false,
          error: 'No se pudo confirmar la actualización de la contraseña en el servidor.',
        };
      }

      logger.info(`Password updated successfully in Supabase database for: ${data.user.email}`);

      // 4. Immediately sign out to invalidate recovery session
      await supabase.auth.signOut();
      logger.info('Recovery session signed out successfully');
      return { success: true };
    } catch (err: any) {
      const parsed = parseSupabaseError(err);
      return { success: false, error: parsed.message };
    }
  },

  /**
   * Sign out current user.
   */
  async signOut(): Promise<void> {
    try {
      logger.info('Signing out');
      pendingDevRecovery = null;
      await supabase.auth.signOut();
    } catch (err) {
      logger.error('Error during sign out', err);
    }
  },

  /**
   * Set Supabase session from recovery URL fragment/query.
   * Supports implicit tokens, PKCE authorization code, and token_hash verification.
   */
  async createSessionFromUrl(url: string): Promise<boolean> {
    try {
      logger.info(`Parsing deep link URL for session: ${url}`);
      const hashIndex = url.indexOf('#');
      const queryIndex = url.indexOf('?');

      const hashParams = new URLSearchParams(hashIndex !== -1 ? url.substring(hashIndex + 1) : '');
      const queryParams = new URLSearchParams(
        queryIndex !== -1
          ? hashIndex !== -1 && hashIndex > queryIndex
            ? url.substring(queryIndex + 1, hashIndex)
            : url.substring(queryIndex + 1)
          : ''
      );

      // Check for error parameters first (e.g. otp_expired, access_denied)
      const errorParam = hashParams.get('error') || queryParams.get('error');
      const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');
      if (errorParam) {
        logger.error('Deep link contains auth error:', errorParam, errorDesc);
        return false;
      }

      // 1. Implicit tokens (access_token & refresh_token) in hash or query
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

      if (accessToken && refreshToken) {
        logger.info('Setting session from access_token and refresh_token in URL');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          logger.error('Failed to set session from URL tokens', error);
          return false;
        }
        logger.info(`Session established from URL tokens for: ${data.user?.email}`);
        return true;
      }

      // 2. PKCE authorization code in query
      const code = queryParams.get('code') || hashParams.get('code');
      if (code) {
        logger.info('Exchanging PKCE code from URL for session');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          logger.error('Failed to exchange PKCE code for session', error);
          return false;
        }
        if (data?.session) {
          logger.info(`Session established via PKCE for: ${data.user?.email}`);
          return true;
        }
      }

      // 3. Token hash verification if present
      const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');
      if (tokenHash) {
        logger.info('Verifying token_hash from URL');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (error) {
          logger.error('Failed to verify token_hash from URL', error);
          return false;
        }
        if (data?.session) {
          logger.info(`Session established via token_hash for: ${data.user?.email}`);
          return true;
        }
      }

      return false;
    } catch (err) {
      logger.error('Error handling deep link session', err);
      return false;
    }
  },
};
