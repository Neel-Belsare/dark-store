import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { getApiBaseUrl } from '../config/apiConfig';
import { supabase } from '../supabaseClient';

export const ProfileScreen: React.FC = () => {
  const { address, location } = useCurrentLocation();
  const apiBase = getApiBaseUrl();
  const [userEmail, setUserEmail] = useState<string>('User');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleOpenStreamlit = () => {
    Linking.openURL('https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Logout Failed', error.message);
      }
    } catch (err: any) {
      console.error('Logout error:', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userEmail.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>{userEmail}</Text>
          <Text style={styles.userPhone}>InventoryPro Registered Customer</Text>
          <View style={styles.membershipPill}>
            <Text style={styles.membershipText}>⚡ VIP CUSTOMER • FREE PRIORITY DISPATCH</Text>
          </View>
        </View>
      </View>

      {/* Primary Saved Address Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Default Delivery Address</Text>
          <Text style={styles.tagHome}>HOME</Text>
        </View>
        <Text style={styles.addressLine}>{address}</Text>
        {location && (
          <Text style={styles.coordsLine}>
            GPS Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Dark Store Network Stats */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Chhatrapati Sambhajinagar Network</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Active Hubs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>8-12m</Text>
            <Text style={styles.statLabel}>Avg SLA</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>98.4%</Text>
            <Text style={styles.statLabel}>Coverage</Text>
          </View>
        </View>
      </View>

      {/* Quick-Commerce Telemetry & Command Center Links */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick-Commerce Infrastructure</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>FastAPI Bridge URL:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{apiBase}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Routing Algorithm:</Text>
          <Text style={styles.infoValue}>Haversine Great Circle</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telemetry Engine:</Text>
          <Text style={styles.infoValue}>Deck.gl 3D (PyDeck)</Text>
        </View>

        <TouchableOpacity style={styles.webAppBtn} onPress={handleOpenStreamlit} activeOpacity={0.85}>
          <Text style={styles.webAppBtnText}>🖥️ Open 3D Command Center</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions / Logout */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>Blinkit Dark Store Mobile • v3.0 Production</Text>
        <Text style={styles.footerSub}>Architected for Chhatrapati Sambhajinagar</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4E2298',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: '#4E2298',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  userPhone: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  membershipPill: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  membershipText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4E2298',
    letterSpacing: 0.4,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tagHome: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4E2298',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressLine: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  coordsLine: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statBox: {
    width: '31%',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4E2298',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '700',
    maxWidth: '55%',
    textAlign: 'right',
  },
  webAppBtn: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  webAppBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4E2298',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  footerSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});