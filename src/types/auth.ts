import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
  createdAt?: string;
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRecoveryFlow: boolean;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  isEmailUnconfirmed?: boolean;
  isRateLimited?: boolean;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
  isRateLimited?: boolean;
}

export interface UpdatePasswordResult {
  success: boolean;
  error?: string;
}
