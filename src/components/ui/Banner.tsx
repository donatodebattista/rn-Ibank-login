import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Typography, Spacing } from '@/constants/tokens';

interface BannerProps {
  message?: string | null;
  type?: 'error' | 'success' | 'info';
  onDismiss?: () => void;
}

export const Banner: React.FC<BannerProps> = ({
  message,
  type = 'error',
}) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <View
      style={[
        styles.container,
        isError && styles.errorContainer,
        isSuccess && styles.successContainer,
        !isError && !isSuccess && styles.infoContainer,
      ]}
    >
      <Ionicons
        name={
          isError
            ? 'alert-circle'
            : isSuccess
            ? 'checkmark-circle'
            : 'information-circle'
        }
        size={18}
        color={
          isError ? Colors.error : isSuccess ? Colors.success : Colors.info
        }
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          isError && styles.errorText,
          isSuccess && styles.successText,
          !isError && !isSuccess && styles.infoText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoContainer: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
  },
  errorText: {
    color: '#991B1B',
  },
  successText: {
    color: '#065F46',
  },
  infoText: {
    color: '#1E40AF',
  },
});
