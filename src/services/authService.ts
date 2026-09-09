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

export const authService = {
  /**
   * Sign in with email and password.
   * Enforces generic error mapping to prevent user enumeration.
   * Catches unconfirmed emails and rate limits.
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      if (!isSupabaseConfigured) {
        if (email.toLowerCase().includes('demo@ibank.com')) {
          logger.info('Simulación demo: inicio de sesión exitoso');
          return { success: true };
        }
        return {
          success: false,
          error: MISSING_CONFIG_ERROR,
        };
      }
      logger.info(`Attempting sign in for: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
      if (!isSupabaseConfigured) {
        if (email.toLowerCase().includes('demo@ibank.com')) {
          logger.info('Simulación demo: registro exitoso');
          return { success: true, needsEmailConfirmation: true };
        }
        return { success: false, error: MISSING_CONFIG_ERROR };
      }
      const redirectUrl = getAuthRedirectUrl('pending-confirmation');
      logger.info(`Attempting sign up for: ${email} with redirect: ${redirectUrl}`);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
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
      const redirectUrl = getAuthRedirectUrl('pending-confirmation');
      logger.info(`Resending confirmation to: ${email} with redirect: ${redirectUrl}`);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
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
      const redirectUrl = getAuthRedirectUrl('change-password');
      logger.info(`Requesting password reset for: ${email} with redirect: ${redirectUrl}`);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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
   * Update user password during recovery flow.
   */
  async updatePassword(password: string): Promise<UpdatePasswordResult> {
    try {
      if (!isSupabaseConfigured) {
        return { success: true };
      }
      logger.info('Updating user password');
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        const parsed = parseSupabaseError(error);
        return { success: false, error: parsed.message };
      }

      // Immediately sign out to invalidate recovery session
      await supabase.auth.signOut();
      logger.info('Password updated successfully and signed out');
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
      await supabase.auth.signOut();
    } catch (err) {
      logger.error('Error during sign out', err);
    }
  },

  /**
   * Set Supabase session from recovery URL fragment/query.
   */
  async createSessionFromUrl(url: string): Promise<boolean> {
    try {
      logger.info('Parsing deep link URL for session');
      // Look for access_token and refresh_token in hash or query
      const hashIndex = url.indexOf('#');
      const queryIndex = url.indexOf('?');
      const paramsString =
        hashIndex !== -1
          ? url.substring(hashIndex + 1)
          : queryIndex !== -1
          ? url.substring(queryIndex + 1)
          : '';

      const searchParams = new URLSearchParams(paramsString);
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          logger.error('Failed to set session from URL', error);
          return false;
        }
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Error handling deep link session', err);
      return false;
    }
  },
};
