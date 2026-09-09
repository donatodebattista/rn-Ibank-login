import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Typography, Spacing } from '@/constants/tokens';

interface CheckboxProps {
  checked: boolean;
  onToggle: (newValue: boolean) => void;
  label?: string;
  linkText?: string;
  onLinkPress?: () => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label = 'By creating an account your aggree to our',
  linkText = 'Term and Condtions',
  onLinkPress,
  error,
  style,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => !disabled && onToggle(!checked)}
          style={[
            styles.checkboxBase,
            checked && styles.checkboxChecked,
            !!error && styles.checkboxError,
            disabled && styles.checkboxDisabled,
          ]}
          disabled={disabled}
        >
          {checked && (
            <Ionicons name="checkmark" size={14} color={Colors.textWhite} />
          )}
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.label}>
            {label}{' '}
            <Text
              style={styles.linkText}
              onPress={onLinkPress ? onLinkPress : () => !disabled && onToggle(!checked)}
            >
              {linkText}
            </Text>
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBase: {
    width: 22,
    height: 22,
    borderRadius: Radii.xs,
    borderWidth: 1.5,
    borderColor: Colors.checkboxBorder,
    backgroundColor: Colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.checkboxActive,
    borderColor: Colors.checkboxActive,
  },
  checkboxError: {
    borderColor: Colors.error,
  },
  checkboxDisabled: {
    opacity: 0.6,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: 28,
  },
});
