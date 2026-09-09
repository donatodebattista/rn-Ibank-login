import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase';
import { authService } from '@/services/authService';
import { logger } from '@/utils/logger';
import {
  SignInResult,
  SignUpResult,
  ResetPasswordResult,
  UpdatePasswordResult,
} from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRecoveryFlow: boolean;
  setRecoveryFlow: (value: boolean) => void;
  signIn: (email: string, pass: string) => Promise<SignInResult>;
  signUp: (email: string, pass: string, name: string) => Promise<SignUpResult>;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
  updatePassword: (password: string) => Promise<UpdatePasswordResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState<boolean>(false);

  // Initialize session and auth state listener
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Error fetching initial session', error);
        }
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (err) {
        logger.error('Exception resolving initial session', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        logger.info(`Auth state change event: ${event}`);
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'PASSWORD_RECOVERY') {
          logger.info('Entering password recovery flow');
          setIsRecoveryFlow(true);
        } else if (event === 'SIGNED_OUT') {
          setIsRecoveryFlow(false);
        }

        setIsLoading(false);
      }
    );

    // Handle deep links when app is already open or opened from link
    const handleDeepLink = async (url: string | null) => {
      if (!url) return;
      logger.info(`Deep link received: ${url}`);
      if (url.includes('recovery') || url.includes('change-password') || url.includes('type=recovery')) {
        setIsRecoveryFlow(true);
        await authService.createSessionFromUrl(url);
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const sub = Linking.addEventListener('url', (event) => handleDeepLink(event.url));

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  const signIn = async (email: string, pass: string): Promise<SignInResult> => {
    return authService.signIn(email, pass);
  };

  const signUp = async (email: string, pass: string, name: string): Promise<SignUpResult> => {
    return authService.signUp(email, pass, name);
  };

  const resendConfirmation = async (email: string) => {
    return authService.resendConfirmation(email);
  };

  const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
    return authService.resetPassword(email);
  };

  const updatePassword = async (password: string): Promise<UpdatePasswordResult> => {
    const result = await authService.updatePassword(password);
    if (result.success) {
      setIsRecoveryFlow(false);
      setUser(null);
      setSession(null);
    }
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setIsRecoveryFlow(false);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!session && !isRecoveryFlow,
      isRecoveryFlow,
      setRecoveryFlow: setIsRecoveryFlow,
      signIn,
      signUp,
      resendConfirmation,
      resetPassword,
      updatePassword,
      signOut,
    }),
    [user, session, isLoading, isRecoveryFlow]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
