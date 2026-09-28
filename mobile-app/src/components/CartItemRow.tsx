import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
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
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.unit}>{item.unit}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>

      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onDecrement(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.qtyText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onIncrement(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>+</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unit: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginVertical: 1,
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryGreen,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    paddingHorizontal: 6,
    minWidth: 20,
    textAlign: 'center',
  },
});
