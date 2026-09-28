import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { MockLocationOption, GPSLocation } from '../types';

interface LocationBarProps {
  location: GPSLocation | null;
  address: string;
  isUsingGPS?: boolean;
  loading?: boolean;
  onRefreshGPS?: () => void;
  onSelectOption?: (option: MockLocationOption) => void;
  options?: MockLocationOption[];
}

export const LocationBar: React.FC<LocationBarProps> = ({
  location,
  address,
  isUsingGPS = true,
  loading = false,
  onRefreshGPS,
  onSelectOption,
  options = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const displayCoords = location
    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
    : 'Acquiring GPS...';

  return (
    <>
      {/* Sticky Location Header Bar */}
      <View style={styles.stickyContainer}>
        <TouchableOpacity
          style={styles.locationTouchable}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.lightningIcon}>⚡</Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.deliveryTitle}>Blinkit in 10 minutes</Text>
              <Text style={styles.dropdownChevron}>▼</Text>
            </View>

            <Text style={styles.addressLine} numberOfLines={1}>
              {loading ? 'Locating delivery address...' : address || 'Chhatrapati Sambhajinagar'}
            </Text>

            <View style={styles.coordsRow}>
              <View style={[styles.gpsDot, isUsingGPS ? styles.gpsDotActive : styles.gpsDotManual]} />
              <Text style={styles.coordsText}>
                {isUsingGPS ? 'GPS: ' : 'Hub: '}
                {displayCoords}
              </Text>
            </View>
          </View>

          <View style={styles.changeBadge}>
            <Text style={styles.changeBadgeText}>Change</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick-Commerce Address Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Delivery Location</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select your Aurangabad micro-market or sync live GPS to match the nearest dark store hub.
            </Text>

            {/* Live GPS Re-fetch Option */}
            {onRefreshGPS && (
              <TouchableOpacity
                style={styles.liveGpsOption}
                onPress={() => {
                  onRefreshGPS();
                  setModalVisible(false);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.gpsIconCircle}>
                  <Text style={styles.gpsTargetIcon}>📍</Text>
                </View>
                <View style={styles.gpsTextCol}>
                  <Text style={styles.liveGpsTitle}>Use Current Device GPS</Text>
                  <Text style={styles.liveGpsSub}>Lock high-accuracy coordinates via expo-location</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Preset Neighborhood Options */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.label}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    if (onSelectOption) onSelectOption(item);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.storeIconBox}>
                    <Text style={styles.storeIcon}>🏬</Text>
                  </View>
                  <View style={styles.optionDetails}>
                    <Text style={styles.optionTitle}>{item.label}</Text>
                    <Text style={styles.optionSub}>{item.sublabel}</Text>
                    <Text style={styles.optionCoords}>
                      Coords: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <Text style={styles.selectChevron}>➔</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  stickyContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.small,
  },
  locationTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.brandYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  lightningIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  dropdownChevron: {
    fontSize: 10,
    color: COLORS.textPrimary,
    marginLeft: 6,
    marginTop: 1,
  },
  addressLine: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  gpsDotActive: {
    backgroundColor: COLORS.brandGreen,
  },
  gpsDotManual: {
    backgroundColor: COLORS.warningAmber,
  },
  coordsText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  changeBadge: {
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  changeBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
    maxHeight: '75%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCloseIcon: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textSecondary,
    padding: 4,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  liveGpsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreenLight,
    borderWidth: 1,
    borderColor: COLORS.brandGreen,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  gpsTargetIcon: {
    fontSize: 18,
  },
  gpsTextCol: {
    flex: 1,
  },
  liveGpsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.brandGreenDark,
  },
  liveGpsSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  storeIconBox: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  storeIcon: {
    fontSize: 18,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  optionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  optionCoords: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectChevron: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});
