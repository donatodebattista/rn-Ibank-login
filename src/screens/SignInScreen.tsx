import { AuthHeader } from '@/components/ui/AuthHeader';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { CardContainer } from '@/components/ui/CardContainer';
import { FingerprintButton } from '@/components/ui/FingerprintButton';
import { Input } from '@/components/ui/Input';
import { RATE_LIMIT_COOLDOWN_SECONDS } from '@/constants/errors';
import { Colors, Spacing, Typography } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { useCooldown } from '@/hooks/useCooldown';
import { isSupabaseConfigured } from '@/services/supabase';
import { SignInFormValues, signInSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const SignInScreen: React.FC = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const { isCoolingDown, secondsLeft, startCooldown } = useCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');
  // PRD: "Botón habilitado solo con email válido y password no vacía"
  const isButtonEnabled =
    isValid &&
    !isSubmitting &&
    !isCoolingDown &&
    !!emailValue &&
    !!passwordValue;

  const onSubmit = async (data: SignInFormValues) => {
    setErrorMessage(null);

    const result = await signIn(data.email, data.password);

    if (result.isRateLimited) {
      startCooldown(60);
      setErrorMessage(result.error || 'Demasiados intentos. Por favor espera 60 segundos.');
      return;
    }

    if (result.isEmailUnconfirmed) {
      router.push({
        pathname: '/(auth)/pending-confirmation',
        params: { email: data.email },
      });
      return;
    }

    if (!result.success) {
      setErrorMessage(result.error || 'Email o contraseña incorrectos');
      return;
    }

    // Navigation to authenticated home is handled reactively by auth listener/layout
    router.replace('/(app)/home');
  };

  const handleFingerprintPress = () => {
    setErrorMessage('Ingresa con tus credenciales para habilitar biometría.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerBackground} />
      {/* Header with back button / title */}
      <AuthHeader
        title="Sign in"
        variant="light"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          }
        }}
      />

      {/* Main Sheet Card */}
      <CardContainer variant="sheet">
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Hello there, sign in to continue</Text>

        {/* Lock Illustration with orbital dots */}
        <AuthIllustration type="lock" />

        {!isSupabaseConfigured && (
          <Banner
            type="info"
            message="Supabase no está configurado en .env. Puedes usar demo@ibank.com y cualquier clave para probar el flujo, o configurar tus credenciales."
          />
        )}

        <Banner message={errorMessage} type="error" />

        {/* Form Fields */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              placeholder="Email"
              keyboardType="email-address"
              autoComplete="email"
              value={value}
              onChangeText={(text) => {
                setErrorMessage(null);
                onChange(text);
              }}
              onBlur={onBlur}
              disabled={isSubmitting || isCoolingDown}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              placeholder="Password"
              isPassword
              value={value}
              onChangeText={(text) => {
                setErrorMessage(null);
                onChange(text);
              }}
              onBlur={onBlur}
              disabled={isSubmitting || isCoolingDown}
              error={error?.message}
            />
          )}
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotPasswordButton}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotPasswordText}>Forgot your password ?</Text>
        </TouchableOpacity>

        {/* Sign in Button */}
        <Button
          title={isCoolingDown ? `Espera (${secondsLeft}s)` : 'Sign in'}
          onPress={handleSubmit(onSubmit)}
          disabled={!isButtonEnabled}
          loading={isSubmitting}
          cooldownSeconds={isCoolingDown ? secondsLeft : undefined}
          style={styles.signInButton}
        />

        {/* Fingerprint Biometrics */}
        <FingerprintButton onPress={handleFingerprintPress} />

        {/* Sign Up Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </CardContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.headerBackground,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textTitle,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSubtitle,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  signInButton: {
    marginTop: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
  },
  footerLink: {
    fontSize: Typography.sizes.sm,
    color: Colors.textLink,
    fontWeight: Typography.weights.bold,
  },
});
