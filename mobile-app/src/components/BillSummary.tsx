import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface BillSummaryProps {
  itemTotal: number;
  deliveryFee: number;
  grandTotal: number;
  platformFee?: number;
  savings?: number;
}

export const BillSummary: React.FC<BillSummaryProps> = ({
  itemTotal,
  deliveryFee,
  grandTotal,
  platformFee = 2,
  savings = 25,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.receiptIcon}>🧾</Text>
        <Text style={styles.cardTitle}>Bill Summary</Text>
      </View>

      {/* Item Total */}
      <View style={styles.row}>
        <Text style={styles.label}>Item total</Text>
        <Text style={styles.value}>₹{itemTotal}</Text>
      </View>

      {/* Delivery Fee with Strikethrough & Free Badge */}
      <View style={styles.row}>
        <View style={styles.labelWithPill}>
          <Text style={styles.label}>Delivery partner fee</Text>
          {deliveryFee === 0 && <Text style={styles.freePill}>FREE</Text>}
        </View>
        <View style={styles.feeCol}>
          {deliveryFee === 0 ? (
            <>
              <Text style={styles.strikethroughFee}>₹25</Text>
              <Text style={styles.freeFeeText}>₹0</Text>
            </>
          ) : (
            <Text style={styles.value}>₹{deliveryFee}</Text>
          )}
        </View>
      </View>

      {/* Handling & Platform Fee */}
      {platformFee > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Handling & platform charge</Text>
          <Text style={styles.value}>₹{platformFee}</Text>
        </View>
      )}

      {/* Receipt Divider Line */}
      <View style={styles.receiptDivider} />

      {/* Grand Total */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.inclusiveText}>Inclusive of all taxes</Text>
        </View>
        <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
      </View>

      {/* Savings Callout */}
      {savings > 0 && (
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsText}>
            🎉 You saved ₹{savings} with Free 10-Minute Dark Store Delivery
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  receiptIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  labelWithPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freePill: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.brandGreen,
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    overflow: 'hidden',
  },
  feeCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikethroughFee: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  freeFeeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brandGreen,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  inclusiveText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  grandTotalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  savingsBanner: {
    backgroundColor: COLORS.brandGreenLight,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  savingsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.brandGreenDark,
    textAlign: 'center',
  },
});
