import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Radii, Shadows } from '@/constants/tokens';
import { AuthHeader } from '@/components/ui/AuthHeader';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';
import { useAuth } from '@/hooks/useAuth';
import { useCooldown } from '@/hooks/useCooldown';

export const PendingConfirmationScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || 'tu correo electrónico';

  const { resendConfirmation } = useAuth();
  const { isCoolingDown, secondsLeft, startCooldown } = useCooldown(60);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (isCoolingDown || isResending) return;

    setIsResending(true);
    setFeedbackMessage(null);

    const result = await resendConfirmation(email);

    setIsResending(false);
    if (result.success) {
      startCooldown(60);
      setFeedbackType('success');
      setFeedbackMessage('Te hemos enviado un nuevo correo de confirmación.');
    } else {
      setFeedbackType('error');
      setFeedbackMessage(result.error || 'No se pudo reenviar el correo. Intenta más tarde.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.screenLight} />
      <AuthHeader
        title="Confirmación"
        variant="dark"
        onBackPress={() => router.replace('/(auth)/sign-in')}
      />

      <View style={styles.container}>
        <View style={styles.card}>
          <AuthIllustration type="email-sent" />

          <Text style={styles.title}>Confirma tu cuenta</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un enlace de activación a:
          </Text>
          <Text style={styles.emailHighlight}>{email}</Text>

          <Text style={styles.instruction}>
            Por favor, revisa tu bandeja de entrada o la carpeta de spam para verificar tu cuenta e iniciar sesión en iBank.
          </Text>

          <Banner message={feedbackMessage} type={feedbackType} />

          <Button
            title={
              isCoolingDown
                ? `Reenviar en ${secondsLeft}s`
                : 'Reenviar correo'
            }
            variant="outline"
            onPress={handleResend}
            disabled={isCoolingDown || isResending}
            loading={isResending}
            cooldownSeconds={isCoolingDown ? secondsLeft : undefined}
            style={styles.resendButton}
          />

          <Button
            title="Volver a Iniciar sesión"
            onPress={() => router.replace('/(auth)/sign-in')}
            style={styles.backButton}
          />
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
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.card,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.card,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textHeaderDark,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emailHighlight: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginTop: 4,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  instruction: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  resendButton: {
    marginBottom: Spacing.md,
  },
  backButton: {
    width: '100%',
  },
});
