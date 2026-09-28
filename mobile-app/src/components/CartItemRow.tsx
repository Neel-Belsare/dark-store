import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { CartItem } from '../types';

interface CartItemRowProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.container}>
      {/* Product Image / Visual Placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.emojiText}>{item.emoji || '🛒'}</Text>
      </View>

      {/* Item Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemUnit}>{item.unit}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>

      {/* Quick-Commerce Quantity Stepper */}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onDecrement(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.stepperMinus}>−</Text>
        </TouchableOpacity>

        <View style={styles.qtyBox}>
          <Text style={styles.stepperQty}>{item.quantity}</Text>
        </View>

        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onIncrement(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.stepperPlus}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  emojiText: {
    fontSize: 26,
  },
  detailsContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  itemUnit: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreenLight,
    borderWidth: 1,
    borderColor: COLORS.brandGreen,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperMinus: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brandGreen,
    marginTop: -2,
  },
  stepperPlus: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brandGreen,
    marginTop: -1,
  },
  qtyBox: {
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
});
