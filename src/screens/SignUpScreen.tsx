import { AuthHeader } from '@/components/ui/AuthHeader';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { CardContainer } from '@/components/ui/CardContainer';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { PasswordChecklist } from '@/components/ui/PasswordChecklist';
import { Colors, Spacing, Typography } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordRules } from '@/hooks/usePasswordRules';
import { isSupabaseConfigured } from '@/services/supabase';
import { SignUpFormValues, signUpSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { signUp } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      termsAccepted: false as any,
    },
  });

  const watchedPassword = watch('password') || '';
  const termsAccepted = watch('termsAccepted');
  const { criteria, isValid: isPasswordCriteriaMet } = usePasswordRules(watchedPassword);

  const isFormValid = isValid && isPasswordCriteriaMet && termsAccepted && !isSubmitting;

  const onSubmit = async (data: SignUpFormValues) => {
    setErrorMessage(null);

    const result = await signUp(data.email, data.password, data.name);

    if (!result.success) {
      setErrorMessage(result.error || 'No se pudo completar el registro. Intenta de nuevo.');
      return;
    }

    // Anti-enumeration: neutral redirection to pending confirmation
    router.push({
      pathname: '/(auth)/pending-confirmation',
      params: { email: data.email },
    });
  };

  const showTermsModal = () => {
    Alert.alert(
      'Términos y Condiciones',
      'Al utilizar iBank, aceptas las políticas de seguridad bancaria, privacidad y tratamiento de datos personales conforme a la regulación financiera vigente.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.headerBackground} />
      {/* Header with back button */}
      <AuthHeader
        title="Sign up"
        variant="light"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(auth)/sign-in');
          }
        }}
      />

      {/* Main Sheet Card */}
      <CardContainer variant="sheet">
        <Text style={styles.title}>Welcome to us,</Text>
        <Text style={styles.subtitle}>Hello there, create New account</Text>

        {/* User Phone Illustration with orbital dots */}
        <AuthIllustration type="user-phone" />

        {!isSupabaseConfigured && (
          <Banner
            type="info"
            message="Supabase no está configurado en .env. Puedes usar demo@ibank.com para probar el registro o configurar tus credenciales."
          />
        )}

        <Banner message={errorMessage} type="error" />

        {/* Name Input */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              placeholder="Name"
              autoCapitalize="words"
              value={value}
              onChangeText={(text) => {
                setErrorMessage(null);
                onChange(text);
              }}
              onBlur={onBlur}
              disabled={isSubmitting}
              error={error?.message}
            />
          )}
        />

        {/* Email Input */}
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
              disabled={isSubmitting}
              error={error?.message}
            />
          )}
        />

        {/* Password Input */}
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
              disabled={isSubmitting}
              error={error?.message}
            />
          )}
        />

        {/* Password Real-time Criteria Checklist */}
        <PasswordChecklist criteria={criteria} />

        {/* Terms and Conditions Checkbox */}
        <Controller
          control={control}
          name="termsAccepted"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Checkbox
              checked={!!value}
              onToggle={onChange}
              label="By creating an account your aggree to our"
              linkText="Term and Condtions"
              onLinkPress={showTermsModal}
              error={error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        {/* Sign up Button */}
        <Button
          title="Sign up"
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormValid}
          loading={isSubmitting}
          style={styles.signUpButton}
        />

        {/* Sign In Navigation */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Have an account? </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/sign-in')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Sign In</Text>
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
    marginBottom: Spacing.xs,
  },
  signUpButton: {
    marginTop: Spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
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
