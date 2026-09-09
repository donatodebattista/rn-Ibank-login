import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '@/constants/tokens';

interface CardContainerProps {
  children: React.ReactNode;
  variant?: 'sheet' | 'floating';
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  variant = 'sheet',
  style,
  contentContainerStyle,
  scrollable = true,
}) => {
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        variant === 'sheet' ? styles.sheetContent : styles.floatingContent,
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        variant === 'sheet' ? styles.sheetContent : styles.floatingContent,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        variant === 'sheet' ? styles.sheetWrapper : styles.floatingWrapper,
        style,
      ]}
    >
      <View
        style={[
          variant === 'sheet' ? styles.sheetCard : styles.floatingCard,
        ]}
      >
        {content}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  sheetWrapper: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  sheetCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.huge,
    flexGrow: 1,
  },
  floatingWrapper: {
    flex: 1,
    backgroundColor: Colors.screenLight,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  floatingCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.card,
    ...Shadows.card,
    overflow: 'hidden',
  },
  floatingContent: {
    padding: Spacing.xxl,
  },
});
