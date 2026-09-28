import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

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
      {/* Receipt Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.receiptIcon}>🧾</Text>
          <Text style={styles.cardTitle}>Bill Details</Text>
        </View>
        <View style={styles.invoiceBadge}>
          <Text style={styles.invoiceText}>FINAL SUMMARY</Text>
        </View>
      </View>

      {/* 1. Item Total */}
      <View style={styles.row}>
        <Text style={styles.label}>Item total</Text>
        <Text style={styles.value}>₹{itemTotal}</Text>
      </View>

      {/* 2. Delivery Partner Fee (With Strikethrough & Free Badge) */}
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

      {/* 3. Handling & Platform Fee */}
      {platformFee > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Handling & dark store fee</Text>
          <Text style={styles.value}>₹{platformFee}</Text>
        </View>
      )}

      {/* Perforated Receipt Divider */}
      <View style={styles.receiptDivider} />

      {/* 4. Grand Total / To Pay */}
      <View style={styles.totalRow}>
        <View>
          <Text style={styles.totalLabel}>To Pay</Text>
          <Text style={styles.inclusiveText}>Inclusive of all taxes & packaging</Text>
        </View>
        <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
      </View>

      {/* 5. Savings Callout Banner */}
      {savings > 0 && (
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsEmoji}>🎉</Text>
          <Text style={styles.savingsText}>
            You saved <Text style={styles.savingsHighlight}>₹{savings}</Text> on this order with Instant Dark Store Delivery
          </Text>
        </View>
      )}

      {/* Security Assurance */}
      <View style={styles.securityRow}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>100% Safe & Secure Payments via UPI, Cards, NetBanking</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIcon: {
    fontSize: 16,
    marginRight: SPACING.xs + 2,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.bodyLarge,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  invoiceBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  invoiceText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  labelWithPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freePill: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.brandGreen,
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginLeft: 6,
    borderWidth: 0.5,
    borderColor: COLORS.brandGreenBorder,
    overflow: 'hidden',
  },
  feeCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikethroughFee: {
    fontSize: TYPOGRAPHY.sub,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  freeFeeText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
  value: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
    borderStyle: 'dashed',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.subtitle,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  inclusiveText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  grandTotalValue: {
    fontSize: TYPOGRAPHY.hero,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreenLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.brandGreenBorder,
  },
  savingsEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs + 2,
  },
  savingsText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.brandGreenDark,
    lineHeight: 16,
  },
  savingsHighlight: {
    fontWeight: '900',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
  },
  securityIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  securityText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
