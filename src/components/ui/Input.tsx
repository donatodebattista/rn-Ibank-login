import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Typography, Spacing } from '@/constants/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  containerStyle,
  rightIconName,
  onRightIconPress,
  disabled = false,
  value,
  placeholder,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder={placeholder}
          placeholderTextColor={Colors.inputPlaceholder}
          secureTextEntry={isSecure}
          editable={!disabled}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...restProps}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        ) : rightIconName ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightIconPress}
            activeOpacity={0.7}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIconName} size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSubtitle,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.2,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.lg,
  },
  inputWrapperFocused: {
    borderColor: Colors.inputBorderFocus,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: Colors.inputBorderError,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: Typography.sizes.base,
    color: Colors.inputText,
    paddingVertical: 0,
  },
  inputDisabled: {
    color: Colors.textMuted,
  },
  iconButton: {
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
