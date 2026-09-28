import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <View style={styles.card}>
      {/* Visual Product Box */}
      <View style={styles.imageBox}>
        <Text style={styles.emoji}>{product.emoji}</Text>
        <View style={styles.slaBadge}>
          <Text style={styles.slaText}>⚡ {product.deliveryMins || 10} MINS</Text>
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.infoCol}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            )}
          </View>

          {/* Add / Stepper Button */}
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => updateQuantity(product.id, quantity - 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.stepMinus}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepQty}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => updateQuantity(product.id, quantity + 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.stepPlus}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 156,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  imageBox: {
    height: 105,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  emoji: {
    fontSize: 44,
  },
  slaBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  slaText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.brandGreenDark,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },
  unit: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  mrp: {
    fontSize: 10,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: COLORS.brandGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreen,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  stepBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepMinus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  stepPlus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  stepQty: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFF',
    paddingHorizontal: 4,
    minWidth: 16,
    textAlign: 'center',
  },
});
