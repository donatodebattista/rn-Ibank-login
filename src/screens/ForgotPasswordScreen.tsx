import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Typography, Spacing, Radii, Shadows } from '@/constants/tokens';
import { AuthHeader } from '@/components/ui/AuthHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';
import { useAuth } from '@/hooks/useAuth';
import { useCooldown } from '@/hooks/useCooldown';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '@/utils/validation';
import { GENERIC_RECOVERY_SUCCESS } from '@/constants/errors';

export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { isCoolingDown, secondsLeft, startCooldown } = useCooldown(60);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const emailValue = watch('email');
  const isButtonEnabled = isValid && !isSubmitting && !isCoolingDown && !!emailValue;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await resetPassword(data.email);

    if (result.isRateLimited) {
      startCooldown(60);
      setErrorMessage(result.error || 'Demasiadas solicitudes. Por favor espera 60 segundos.');
      return;
    }

    // Strict anti-enumeration: always display generic recovery message
    startCooldown(60);
    setSuccessMessage(GENERIC_RECOVERY_SUCCESS);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.screenLight} />
      <AuthHeader
        title="Forgot password"
        variant="dark"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(auth)/sign-in');
          }
        }}
      />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Type your email</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                placeholder="name@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                value={value}
                onChangeText={(text) => {
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  onChange(text);
                }}
                onBlur={onBlur}
                disabled={isSubmitting || isCoolingDown}
                error={error?.message}
                containerStyle={styles.inputContainer}
              />
            )}
          />

          <Text style={styles.infoText}>
            Te enviaremos un enlace seguro para restablecer tu contraseña y recuperar el acceso a tu cuenta de iBank.
          </Text>

          <Banner message={successMessage} type="success" />
          <Banner message={errorMessage} type="error" />

          <Button
            title={isCoolingDown ? `Reenviar en ${secondsLeft}s` : 'Send'}
            onPress={handleSubmit(onSubmit)}
            disabled={!isButtonEnabled}
            loading={isSubmitting}
            cooldownSeconds={isCoolingDown ? secondsLeft : undefined}
            style={styles.sendButton}
          />

          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.replace('/(auth)/sign-in')}
            activeOpacity={0.7}
          >
            <Text style={styles.returnButtonText}>Volver a Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.screenLight,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.card,
    padding: Spacing.xxl,
    ...Shadows.card,
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSubtitle,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
    lineHeight: 20,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  sendButton: {
    marginTop: Spacing.xs,
  },
  returnButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  returnButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
});
