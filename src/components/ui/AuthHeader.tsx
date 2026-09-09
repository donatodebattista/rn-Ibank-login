import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/tokens';

interface AuthHeaderProps {
  title: string;
  onBackPress?: () => void;
  variant?: 'light' | 'dark'; // 'light' is white text (on purple), 'dark' is dark text (on white)
  style?: StyleProp<ViewStyle>;
  hideBack?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  onBackPress,
  variant = 'light',
  style,
  hideBack = false,
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? Colors.textWhite : Colors.textHeaderDark;
  const iconColor = isLight ? Colors.textWhite : Colors.textHeaderDark;

  return (
    <View style={[styles.container, style]}>
      {!hideBack && onBackPress ? (
        <TouchableOpacity
          onPress={onBackPress}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    justifyContent: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.xs,
  },
});
