import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii } from '@/constants/tokens';
import { PasswordCriteria } from '@/types/auth';

interface PasswordChecklistProps {
  criteria: PasswordCriteria;
}

export const PasswordChecklist: React.FC<PasswordChecklistProps> = ({ criteria }) => {
  const items = [
    { label: 'Mínimo 8 caracteres', met: criteria.minLength },
    { label: 'Al menos una letra mayúscula (A-Z)', met: criteria.hasUppercase },
    { label: 'Al menos una letra minúscula (a-z)', met: criteria.hasLowercase },
    { label: 'Al menos un dígito numérico (0-9)', met: criteria.hasDigit },
    { label: 'Al menos un símbolo especial (!@#$...)', met: criteria.hasSymbol },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requisitos de seguridad:</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View
            style={[
              styles.iconCircle,
              item.met ? styles.iconCircleMet : styles.iconCircleUnmet,
            ]}
          >
            {item.met ? (
              <Ionicons name="checkmark" size={12} color={Colors.textWhite} />
            ) : (
              <View style={styles.dotUnmet} />
            )}
          </View>
          <Text
            style={[
              styles.itemLabel,
              item.met ? styles.itemLabelMet : styles.itemLabelUnmet,
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FE',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#ECEFF8',
  },
  title: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSubtitle,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  iconCircleMet: {
    backgroundColor: Colors.success,
  },
  iconCircleUnmet: {
    backgroundColor: '#E2E5EC',
  },
  dotUnmet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },
  itemLabel: {
    fontSize: Typography.sizes.xs,
  },
  itemLabelMet: {
    color: '#065F46',
    fontWeight: Typography.weights.medium,
  },
  itemLabelUnmet: {
    color: Colors.textMuted,
  },
});
