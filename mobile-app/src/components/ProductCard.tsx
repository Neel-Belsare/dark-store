import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  // Compute discount percentage if MRP is provided and greater than price
  const hasDiscount = Boolean(product.mrp && product.mrp > product.price);
  const discountPercent = hasDiscount
    ? Math.round((((product.mrp! - product.price) / product.mrp!) * 100))
    : 0;

  // Inventory threshold states
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock =
    !isOutOfStock &&
    product.stock !== undefined &&
    product.lowStockThreshold !== undefined &&
    product.stock <= product.lowStockThreshold;
  const isAtStockCap = product.stock !== undefined && quantity >= product.stock;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* 1. Visual Product Image / Emoji Container */}
      <View style={styles.imageBox}>
        {/* Delivery SLA Badge (Top Left) */}
        <View style={styles.slaBadge}>
          <Text style={styles.slaIcon}>⚡</Text>
          <Text style={styles.slaText}>{product.deliveryMins || 10} MINS</Text>
        </View>

        {/* Discount Badge (Top Right) */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Product Visual */}
        <Text style={styles.emoji}>{product.emoji}</Text>
      </View>

      {/* 2. Product Information Hierarchy */}
      <View style={styles.infoCol}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {product.name}
        </Text>
        <Text style={styles.unit} numberOfLines={1}>
          {product.unit}
        </Text>

        {/* Low Stock Threshold Warning Pill */}
        {isLowStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>⚠️ Only {product.stock} left!</Text>
          </View>
        )}

        {/* 3. Pricing & Prominent Add / Stepper Button */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {hasDiscount && <Text style={styles.mrp}>₹{product.mrp}</Text>}
          </View>

          {isOutOfStock ? (
            <View style={styles.outOfStockBtn}>
              <Text style={styles.outOfStockText}>SOLD OUT</Text>
            </View>
          ) : quantity === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => updateQuantity(product.id, quantity - 1)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              >
                <Text style={styles.stepMinus}>−</Text>
              </TouchableOpacity>

              <Text style={styles.stepQty}>{quantity}</Text>

              <TouchableOpacity
                style={[styles.stepBtn, isAtStockCap && styles.stepBtnDisabled]}
                onPress={() => {
                  if (!isAtStockCap) {
                    updateQuantity(product.id, quantity + 1);
                  }
                }}
                disabled={isAtStockCap}
                activeOpacity={isAtStockCap ? 1 : 0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              >
                <Text style={styles.stepPlus}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 162,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm + 2,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  imageBox: {
    height: 114,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emoji: {
    fontSize: 48,
  },
  slaBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.brandGreenBorder,
  },
  slaIcon: {
    fontSize: 8.5,
    marginRight: 3,
  },
  slaText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.brandGreenDark,
    letterSpacing: 0.3,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.brandYellow,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  discountText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#713F12',
    letterSpacing: 0.2,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  unit: {
    fontSize: TYPOGRAPHY.footnote,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  priceContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  price: {
    fontSize: TYPOGRAPHY.bodyLarge,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  mrp: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '500',
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.brandGreen,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.sm + 2,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: COLORS.brandGreen,
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.brandGreen,
    borderRadius: BORDER_RADIUS.sm + 2,
    minWidth: 68,
    height: 32,
    paddingHorizontal: 4,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stepBtn: {
    width: 22,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMinus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 18,
  },
  stepPlus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 18,
  },
  stepQty: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    minWidth: 16,
  },
  lowStockBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  lowStockText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  outOfStockBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
});
