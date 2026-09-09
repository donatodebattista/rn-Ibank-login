import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
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

export const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { resetPassword, verifyRecoveryCode } = useAuth();
  const { isCoolingDown, secondsLeft, startCooldown } = useCooldown(60);

  // Step 1: 'email' (Forgot password #1.png)
  // Step 2: 'code' (Forgot password #3.png and #4.png)
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);
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
  const isSendButtonEnabled = isValid && !isSubmitting && !isCoolingDown && !!emailValue;

  // Step 1: Submit Email to send recovery code
  const onSubmitEmail = async (data: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    const emailToUse = data.email.trim();
    setSubmittedEmail(emailToUse);

    const result = await resetPassword(emailToUse);

    if (result.isRateLimited) {
      startCooldown(60);
      setErrorMessage(result.error || 'Demasiadas solicitudes. Por favor espera 60 segundos.');
      return;
    }

    // Move directly to Step 2 (Code Entry view matching Forgot password #3.png)
    startCooldown(60);
    setStep('code');
  };

  // Step 2: Resend Code
  const handleResendCode = async () => {
    if (isCoolingDown || !submittedEmail) return;
    setErrorMessage(null);

    const result = await resetPassword(submittedEmail);
    if (result.isRateLimited) {
      setErrorMessage(result.error || 'Demasiadas solicitudes. Por favor espera 60 segundos.');
    } else {
      startCooldown(60);
    }
  };

  // Step 2: Verify Code and proceed to Change Password
  const onVerifyCode = async () => {
    if (!code.trim() || isVerifyingCode) return;
    setErrorMessage(null);
    setIsVerifyingCode(true);

    const result = await verifyRecoveryCode(submittedEmail, code.trim());

    setIsVerifyingCode(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Código inválido o expirado. Por favor intenta de nuevo.');
      return;
    }

    // Success: Navigate to Change Password view
    router.push('/(auth)/change-password');
  };

  const handleBackPress = () => {
    if (step === 'code') {
      setStep('email');
      setErrorMessage(null);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.screenLight} />
      <AuthHeader
        title="Forgot password"
        variant="dark"
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'email' ? (
            /* ============================================================ */
            /* STEP 1: Enter Email (Forgot password #1.png)                 */
            /* ============================================================ */
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
                Te enviaremos un código de verificación a tu correo para restablecer tu contraseña y recuperar el acceso a tu cuenta de iBank.
              </Text>

              <Banner message={errorMessage} type="error" />

              <Button
                title={isCoolingDown ? `Reenviar en ${secondsLeft}s` : 'Send'}
                onPress={handleSubmit(onSubmitEmail)}
                disabled={!isSendButtonEnabled}
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
          ) : (
            /* ============================================================ */
            /* STEP 2: Enter Code (Forgot password #3.png & #4.png)        */
            /* ============================================================ */
            <>
              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Type a code</Text>

                {/* Code input row with Resend button on the right */}
                <View style={styles.codeRow}>
                  <View style={styles.codeInputWrapper}>
                    <TextInput
                      style={styles.codeInput}
                      placeholder="Code"
                      placeholderTextColor={Colors.inputPlaceholder}
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={code}
                      onChangeText={(val) => {
                        setErrorMessage(null);
                        setCode(val);
                      }}
                      editable={!isVerifyingCode}
                      maxLength={500}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.resendButton,
                      isCoolingDown && styles.resendButtonDisabled,
                    ]}
                    onPress={handleResendCode}
                    disabled={isCoolingDown}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.resendButtonText,
                        isCoolingDown && styles.resendButtonTextDisabled,
                      ]}
                    >
                      {isCoolingDown ? `${secondsLeft}s` : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Explanatory text matching visual reference */}
                <Text style={styles.infoText}>
                  We sent you a code to verify your email{' '}
                  <Text style={styles.emailHighlight}>{submittedEmail}</Text>
                </Text>

                <Text style={styles.subInfoText}>
                  This code will expired 10 minutes after this message. If you don't get a message.
                </Text>

                <Banner message={errorMessage} type="error" />

                {/* Change password button */}
                <TouchableOpacity
                  style={[
                    styles.changePasswordButton,
                    (!code.trim() || isVerifyingCode) && styles.changePasswordButtonDisabled,
                  ]}
                  onPress={onVerifyCode}
                  disabled={!code.trim() || isVerifyingCode}
                  activeOpacity={0.85}
                >
                  {isVerifyingCode ? (
                    <ActivityIndicator size="small" color={Colors.buttonActiveText} />
                  ) : (
                    <Text
                      style={[
                        styles.changePasswordButtonText,
                        !code.trim() && styles.changePasswordButtonTextDisabled,
                      ]}
                    >
                      Change password
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Change your email link below card */}
              <TouchableOpacity
                style={styles.changeEmailFooter}
                onPress={() => {
                  setStep('email');
                  setErrorMessage(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.changeEmailText}>Change your email</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.screenLight,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: Spacing.sm,
  },
  subInfoText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSubtitle,
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
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

  // Code row styles (Forgot password #3.png & #4.png)
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  codeInputWrapper: {
    flex: 1,
    height: 54,
    borderWidth: 1.2,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.input,
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  codeInput: {
    height: '100%',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.inputText,
    letterSpacing: 1.5,
  },
  resendButton: {
    width: 96,
    height: 54,
    borderRadius: Radii.input,
    backgroundColor: Colors.buttonActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  resendButtonDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  resendButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.buttonActiveText,
  },
  resendButtonTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  changePasswordButton: {
    height: 54,
    borderRadius: Radii.button,
    backgroundColor: Colors.buttonActiveBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  changePasswordButtonDisabled: {
    backgroundColor: Colors.buttonDisabledBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  changePasswordButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.buttonActiveText,
  },
  changePasswordButtonTextDisabled: {
    color: Colors.buttonDisabledText,
  },
  changeEmailFooter: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  changeEmailText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
