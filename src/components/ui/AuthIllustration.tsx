import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/tokens';

interface AuthIllustrationProps {
  type: 'lock' | 'user-phone' | 'success' | 'email-sent';
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({ type }) => {
  return (
    <View style={styles.outerContainer}>
      {/* Orbital Colored Dots (matching visual design) */}
      <View style={[styles.dot, styles.dotTopPurple]} />
      <View style={[styles.dot, styles.dotTopRightPink]} />
      <View style={[styles.dot, styles.dotBottomRightBlue]} />
      <View style={[styles.dot, styles.dotBottomLeftAmber]} />
      <View style={[styles.dot, styles.dotLeftTeal]} />

      {/* Main Pastel Circle */}
      <View style={styles.circle}>
        {type === 'lock' && (
          <View style={styles.lockContainer}>
            <View style={styles.shackle} />
            <View style={styles.lockBody}>
              <View style={styles.keyhole} />
              <View style={styles.keyholeBottom} />
            </View>
          </View>
        )}

        {type === 'user-phone' && (
          <View style={styles.phoneContainer}>
            <View style={styles.phoneSpeaker} />
            <View style={styles.phoneContent}>
              <Ionicons name="person-circle-outline" size={32} color={Colors.textWhite} />
              <View style={styles.badgeLock}>
                <Ionicons name="lock-closed" size={10} color={Colors.primary} />
              </View>
            </View>
          </View>
        )}

        {type === 'email-sent' && (
          <View style={styles.iconCenter}>
            <Ionicons name="mail" size={54} color={Colors.primary} />
          </View>
        )}

        {type === 'success' && (
          <View style={styles.successContainer}>
            <View style={styles.phoneSuccess}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={24} color={Colors.textWhite} />
              </View>
            </View>
            <View style={styles.shield}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: 170,
    height: 160,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  circle: {
    width: 135,
    height: 135,
    borderRadius: 70,
    backgroundColor: '#EEF0FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Dots
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
  dotTopPurple: {
    width: 8,
    height: 8,
    backgroundColor: '#3A2AA6',
    top: 14,
    left: 65,
  },
  dotTopRightPink: {
    width: 22,
    height: 22,
    backgroundColor: Colors.accents.coral,
    top: 20,
    right: 14,
  },
  dotBottomRightBlue: {
    width: 9,
    height: 9,
    backgroundColor: Colors.accents.skyBlue,
    bottom: 35,
    right: 18,
  },
  dotBottomLeftAmber: {
    width: 16,
    height: 16,
    backgroundColor: Colors.accents.amber,
    bottom: 30,
    left: 20,
  },
  dotLeftTeal: {
    width: 9,
    height: 9,
    backgroundColor: Colors.accents.teal,
    top: 60,
    left: 10,
  },

  // Lock Illustration
  lockContainer: {
    alignItems: 'center',
  },
  shackle: {
    width: 28,
    height: 24,
    borderWidth: 5,
    borderColor: '#4632C4',
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: -2,
  },
  lockBody: {
    width: 44,
    height: 38,
    backgroundColor: '#4632C4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyhole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  keyholeBottom: {
    width: 4,
    height: 8,
    backgroundColor: '#FFFFFF',
    marginTop: -1,
  },

  // Phone Illustration
  phoneContainer: {
    width: 44,
    height: 72,
    backgroundColor: '#4632C4',
    borderRadius: 9,
    alignItems: 'center',
    paddingTop: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  phoneSpeaker: {
    width: 12,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginBottom: 6,
  },
  phoneContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeLock: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 2,
  },

  // Email / Success
  iconCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phoneSuccess: {
    width: 50,
    height: 80,
    backgroundColor: '#4632C4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shield: {
    position: 'absolute',
    right: -18,
    bottom: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 2,
  },
});
