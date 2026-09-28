import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface BillSummaryProps {
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  grandTotal: number;
  savings: number;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  itemTotal,
  deliveryFee,
  platformFee,
  grandTotal,
  savings,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Bill Summary</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Item total</Text>
        <Text style={styles.value}>₹{itemTotal}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.rowInline}>
          <Text style={styles.label}>Delivery partner fee</Text>
          <Text style={styles.pillFree}>FREE</Text>
        </View>
        <Text style={styles.valueStrikethrough}>₹25</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Handling & platform fee</Text>
        <Text style={styles.value}>₹{platformFee}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>To Pay</Text>
        <Text style={styles.totalValue}>₹{grandTotal}</Text>
      </View>

      {savings > 0 && (
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsText}>🎉 You saved ₹{savings} with Free 10-Min Delivery</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  valueStrikethrough: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  pillFree: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  savingsBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
});
