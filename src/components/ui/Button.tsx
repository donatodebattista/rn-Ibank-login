import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Colors, Radii, Typography, Shadows, Spacing } from '@/constants/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  cooldownSeconds?: number;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  cooldownSeconds,
  testID,
}) => {
  const isButtonDisabled = disabled || loading || (cooldownSeconds !== undefined && cooldownSeconds > 0);

  const displayTitle =
    cooldownSeconds && cooldownSeconds > 0
      ? `${title} (${cooldownSeconds}s)`
      : title;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isButtonDisabled && styles.disabled,
        style,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isButtonDisabled ? Colors.buttonDisabledText : Colors.buttonActiveText}
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'outline' && styles.outlineText,
            variant === 'ghost' && styles.ghostText,
            isButtonDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {displayTitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: Radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.buttonActiveBg,
    ...Shadows.button,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: Colors.buttonDisabledBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  textBase: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: Colors.buttonActiveText,
  },
  secondaryText: {
    color: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.textMuted,
  },
  disabledText: {
    color: Colors.buttonDisabledText,
  },
});
