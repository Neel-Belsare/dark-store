import React, { useState } from 'react';
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

interface ProfileScreenProps {
  userSession?: any;
  onLogout?: () => void;
}

const SAVED_ADDRESSES = [
  { id: '1', tag: 'HOME', address: 'Plot 42, CIDCO N-4, Near Shivaji Park, Aurangabad', isDefault: true },
  { id: '2', tag: 'WORK', address: 'Office 304, Nirala Bazar Commercial Hub, Aurangabad', isDefault: false },
  { id: '3', tag: 'OTHER', address: 'B-12, Kranti Chowk Road, Aurangabad', isDefault: false },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userSession,
  onLogout,
}) => {
  const { address, location } = useCurrentLocation();
  const apiBase = getApiBaseUrl();

  const [selectedAddrId, setSelectedAddrId] = useState<string>('1');

  const userName =
    userSession?.full_name ||
    userSession?.user_metadata?.full_name ||
    (userSession?.email ? userSession.email.split('@')[0] : 'Mansi Gaike');

  const userEmail =
    userSession?.email || 'mansi.gaike@quickzap.in';

  const userPhone =
    userSession?.phone ||
    userSession?.user_metadata?.phone ||
    '+91 98765 43210';

  const userInitials = userName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'QZ';

  const handleOpenStreamlit = () => {
    Linking.openURL('https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of QuickZap?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              if (supabase && typeof supabase.auth?.signOut === 'function') {
                await supabase.auth.signOut();
              }
            } catch (e) {
              console.warn('Supabase sign out error:', e);
            }
            if (onLogout) onLogout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* QuickZap Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
          <Text style={styles.userPhone}>{userPhone}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{userEmail}</Text>
          <View style={styles.membershipPill}>
            <Text style={styles.membershipText}>⚡ QUICKZAP VIP GOLD • 10-MIN SLA</Text>
          </View>
        </View>
      </View>

      {/* Saved Delivery Addresses */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Delivery Addresses</Text>
          <Text style={styles.activeTag}>AURANGABAD</Text>
        </View>

        {SAVED_ADDRESSES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.addressRow,
              selectedAddrId === item.id && styles.addressRowSelected,
            ]}
            onPress={() => setSelectedAddrId(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.addressLeft}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{item.tag}</Text>
              </View>
              <Text style={styles.addressLine} numberOfLines={2}>
                {item.address}
              </Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedAddrId === item.id && styles.radioOuterSelected,
              ]}
            >
              {selectedAddrId === item.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {location && (
          <View style={styles.gpsBanner}>
            <Text style={styles.gpsIcon}>🛰️</Text>
            <Text style={styles.coordsLine}>
              Live Device GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} ({address})
            </Text>
          </View>
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

        <TouchableOpacity
          style={styles.webAppBtn}
          onPress={handleOpenStreamlit}
          activeOpacity={0.85}
        >
          <Text style={styles.webAppBtnText}>🖥️ Open QuickZap 3D Command Center</Text>
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
        <Text style={styles.footerText}>QuickZap Mobile • v4.5 Production</Text>
        <Text style={styles.footerSub}>Architected for Chhatrapati Sambhajinagar (Aurangabad)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fd',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#e8e8ec',
    ...SHADOWS.small,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f7ce00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: '#eac300',
  },
  avatarText: {
    color: '#221b00',
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1c1f',
  },
  userPhone: {
    fontSize: 13,
    color: '#4d4632',
    marginTop: 2,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#7f775f',
    marginTop: 1,
  },
  membershipPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  membershipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400e',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#e8e8ec',
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1c1f',
    letterSpacing: 0.2,
  },
  activeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6549be',
    backgroundColor: '#e7deff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#eeedf2',
    marginBottom: 8,
    backgroundColor: '#fdfdfd',
  },
  addressRowSelected: {
    borderColor: '#f7ce00',
    backgroundColor: '#fffdf0',
  },
  addressLeft: {
    flex: 1,
    marginRight: 10,
  },
  tagBadge: {
    backgroundColor: '#eeedf2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4d4632',
  },
  addressLine: {
    fontSize: 12,
    color: '#1a1c1f',
    lineHeight: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d0c6ab',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#705d00',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#705d00',
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f7',
    padding: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 6,
  },
  gpsIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  coordsLine: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9f9fd',
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#eeedf2',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6549be',
  },
  statLabel: {
    fontSize: 11,
    color: '#7f775f',
    marginTop: 2,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f7',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f775f',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1c1f',
  },
  webAppBtn: {
    backgroundColor: '#6549be',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.small,
  },
  webAppBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '800',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  footerSub: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 2,
  },
});