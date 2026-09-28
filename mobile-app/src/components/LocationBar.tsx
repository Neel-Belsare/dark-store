import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { COLORS } from '../constants/theme';
import { MockLocationOption, GPSLocation } from '../types';

interface LocationBarProps {
  location: GPSLocation;
  address: string;
  isUsingGPS: boolean;
  loading: boolean;
  onRefreshGPS: () => void;
  onSelectOption: (option: MockLocationOption) => void;
  options: MockLocationOption[];
}

export const LocationBar: React.FC<LocationBarProps> = ({
  location,
  address,
  isUsingGPS,
  loading,
  onRefreshGPS,
  onSelectOption,
  options,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.bar}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <View style={[styles.statusDot, isUsingGPS && styles.gpsActiveDot]} />
            <Text style={styles.deliveryTitle}>
              {isUsingGPS ? 'GPS LOCKED (10 MINS)' : 'DELIVERY LOCATION'}
            </Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {loading ? 'Locating nearest dark store...' : address}
          </Text>
          <Text style={styles.coordsSubtext}>
            Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.changeBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Neighborhood Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Aurangabad Location</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Simulate customer coordinates across Chhatrapati Sambhajinagar micro-markets:
            </Text>

            {/* Live GPS button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={() => {
                onRefreshGPS();
                setModalVisible(false);
              }}
            >
              <Text style={styles.gpsButtonIcon}>📍</Text>
              <View style={styles.gpsButtonTexts}>
                <Text style={styles.gpsButtonTitle}>Use Current Device GPS</Text>
                <Text style={styles.gpsButtonSub}>Lock high-accuracy coordinates via expo-location</Text>
              </View>
            </TouchableOpacity>

            <FlatList
              data={options}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onSelectOption(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionPin}>🏬</Text>
                  <View style={styles.optionDetails}>
                    <Text style={styles.optionTitle}>{item.label}</Text>
                    <Text style={styles.optionSub}>{item.sublabel}</Text>
                    <Text style={styles.optionCoords}>
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.warningOrange,
    marginRight: 6,
  },
  gpsActiveDot: {
    backgroundColor: COLORS.primaryGreen,
  },
  deliveryTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  coordsSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0FDF4',
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  gpsButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  gpsButtonTexts: {
    flex: 1,
  },
  gpsButtonTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  gpsButtonSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionPin: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
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
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  optionCoords: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
