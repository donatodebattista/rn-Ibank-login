import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '@/constants/tokens';
import { AuthHeader } from '@/components/ui/AuthHeader';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordChecklist } from '@/components/ui/PasswordChecklist';
import { Banner } from '@/components/ui/Banner';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordRules } from '@/hooks/usePasswordRules';
import { changePasswordSchema, ChangePasswordFormValues } from '@/utils/validation';

export const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const { session, isRecoveryFlow, updatePassword, signOut } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Check if session or recovery is valid
  // If there's no session and recovery flow is not detected, link is invalid/expired
  const isRecoveryValid = isRecoveryFlow || !!session;

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password') || '';
  const { criteria, isValid: isPasswordCriteriaMet } = usePasswordRules(watchedPassword);

  const isFormValid = isValid && isPasswordCriteriaMet && !isSubmitting;

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setErrorMessage(null);

    const result = await updatePassword(data.password);

    if (!result.success) {
      setErrorMessage(result.error || 'No se pudo actualizar la contraseña. Solicita un nuevo enlace.');
      return;
    }

    // Success: displays "Change password successfully!" screen as in design #2
    setIsSuccess(true);
  };

  const handleSuccessOk = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  // State 1: Success State (Change password #2.png)
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.screenLight} />
        <AuthHeader
          title=""
          variant="dark"
          hideBack
        />

        <View style={styles.successWrapper}>
          <AuthIllustration type="success" />

          <Text style={styles.successTitle}>Change password successfully!</Text>
          <Text style={styles.successSubtitle}>
            You have successfully change password. Please use the new password when Sign in.
          </Text>

          <Button
            title="Ok"
            onPress={handleSuccessOk}
            style={styles.okButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // State 2: Invalid or expired deep link state
  if (!isRecoveryValid) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.screenLight} />
        <AuthHeader
          title="Change password"
          variant="dark"
          onBackPress={() => router.replace('/(auth)/sign-in')}
        />

        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            </View>

            <Text style={styles.invalidTitle}>Enlace expirado o inválido</Text>
            <Text style={styles.invalidText}>
              Este enlace de recuperación de contraseña no es válido o ya ha expirado. Por razones de seguridad bancaria, los enlaces de recuperación solo pueden usarse una vez y tienen vigencia limitada.
            </Text>

            <Button
              title="Solicitar nuevo enlace"
              onPress={() => router.replace('/(auth)/forgot-password')}
              style={styles.actionButton}
            />

            <Button
              title="Volver al inicio"
              variant="ghost"
              onPress={() => router.replace('/(auth)/sign-in')}
              style={styles.ghostButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // State 3: Password form (Change password #1.png)
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.screenLight} />
      <AuthHeader
        title="Change password"
        variant="dark"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(auth)/sign-in');
          }
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Banner message={errorMessage} type="error" />

          {/* New Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Type your new password"
                placeholder="************"
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

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <Input
                label="Confirm password"
                placeholder="************"
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

          {/* Real-time Password Checklist */}
          <PasswordChecklist criteria={criteria} />

          {/* Submit Button */}
          <Button
            title="Change password"
            onPress={handleSubmit(onSubmit)}
            disabled={!isFormValid}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.card,
    padding: Spacing.xxl,
    ...Shadows.card,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  // Success state styles (matching Change password #2.png)
  successWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  successTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textTitle,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.md,
  },
  okButton: {
    width: '100%',
  },
  // Invalid state styles
  errorIconCircle: {
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  invalidTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textHeaderDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  invalidText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  ghostButton: {
    marginTop: Spacing.xs,
  },
});
