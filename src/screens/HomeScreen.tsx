import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '@/constants/tokens';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const userEmail = user?.email || 'usuario@ibank.com';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Cliente iBank';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.headerLogoutBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>$ 1.254.300,50</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardNumber}>•••• •••• •••• 4892</Text>
            <Text style={styles.cardType}>iBank Platinum</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <View style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#EEF0FD' }]}>
              <Ionicons name="arrow-up-circle" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Transferir</Text>
          </View>

          <View style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="qr-code" size={24} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>Pagar QR</Text>
          </View>

          <View style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="card" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.actionLabel}>Tarjetas</Text>
          </View>

          <View style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="stats-chart" size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionLabel}>Inversiones</Text>
          </View>
        </View>

        {/* User Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Detalles de la sesión</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Email:</Text>
            <Text style={styles.infoValue}>{userEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Estado:</Text>
            <Text style={[styles.infoValue, { color: Colors.success, fontWeight: 'bold' }]}>
              Autenticado
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>ID de Usuario:</Text>
            <Text style={styles.infoValue}>{user?.id?.slice(0, 12)}...</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Button
          title="Cerrar sesión"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Typography.sizes.sm,
    color: '#D2D4F8',
  },
  userName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textWhite,
  },
  headerLogoutBtn: {
    padding: Spacing.xs,
  },
  content: {
    backgroundColor: Colors.screenLight,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    padding: Spacing.xxl,
    flexGrow: 1,
    paddingBottom: Spacing.huge,
  },
  balanceCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radii.card,
    padding: Spacing.xxl,
    ...Shadows.card,
    marginBottom: Spacing.xxl,
  },
  balanceLabel: {
    fontSize: Typography.sizes.sm,
    color: '#A5B4FC',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.xl,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: Typography.sizes.sm,
    color: '#E0E7FF',
    letterSpacing: 1.5,
  },
  cardType: {
    fontSize: Typography.sizes.sm,
    color: '#C7D2FE',
    fontWeight: Typography.weights.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSubtitle,
    fontWeight: Typography.weights.medium,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radii.card,
    padding: Spacing.xl,
    ...Shadows.card,
    marginBottom: Spacing.xxl,
  },
  infoTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textHeaderDark,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  infoKey: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSubtitle,
  },
  infoValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textHeaderDark,
  },
  signOutButton: {
    marginTop: Spacing.md,
  },
});
