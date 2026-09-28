import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { CartItemRow } from '../components/CartItemRow';
import { BillSummary } from '../components/BillSummary';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { CelebrationModal } from '../components/CelebrationModal';
import { placeLiveOrder } from '../services/api';
import { DispatchedOrder } from '../types';

interface CartScreenProps {
  onNavigateToHome: () => void;
}

const DELIVERY_INSTRUCTIONS = [
  { id: '1', label: '🚪 Leave at door', icon: '🚪' },
  { id: '2', label: '🔕 Don\'t ring bell', icon: '🔕' },
  { id: '3', label: '📞 Avoid calling', icon: '📞' },
  { id: '4', label: '🛡️ Leave at guard', icon: '🛡️' },
];

export const CartScreen: React.FC<CartScreenProps> = ({ onNavigateToHome }) => {
  const {
    cartItems,
    updateQuantity,
    totalItemCount,
    itemTotalAmount,
    deliveryFee,
    platformFee,
    grandTotal,
    savings,
    clearCart,
  } = useCart();

  const { location, address, isUsingGPS } = useCurrentLocation();

  const [selectedInstruction, setSelectedInstruction] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DispatchedOrder | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Basket', 'Add items from the store before checking out.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please enable GPS or select a delivery location.');
      return;
    }

    // 1. Show animated "Finding your nearest dark store..." overlay
    setIsLoading(true);

    try {
      // 2. Transmit coordinates and items to Python FastAPI backend
      const response = await placeLiveOrder(location.latitude, location.longitude, {
        customer_name: 'Neel Belsare',
        customer_phone: '+91 98765 43210',
        delivery_address: address,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        order_value: grandTotal,
      });

      // Artificial small delay so the user experiences the sleek loading animation
      await new Promise((r) => setTimeout(r, 900));

      if (response && response.success) {
        setConfirmedOrder(response.order);
        setCelebrationVisible(true);
      } else {
        Alert.alert('Routing Notice', response?.message || 'Could not route order.');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', err.message || 'Failed to connect to dark-store router.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCelebration = () => {
    setCelebrationVisible(false);
    clearCart();
    onNavigateToHome();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Basket ({totalItemCount})</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Pill */}
        <View style={styles.addressCard}>
          <View style={styles.addressLeft}>
            <View style={styles.addressIconBox}>
              <Text style={styles.addressIcon}>📍</Text>
            </View>
            <View style={styles.addressTexts}>
              <View style={styles.badgeRow}>
                <Text style={styles.addressBadgeTitle}>DELIVERING TO</Text>
                <View style={[styles.gpsDot, isUsingGPS ? styles.gpsActive : styles.gpsManual]} />
                <Text style={styles.gpsLabel}>{isUsingGPS ? 'GPS Locked' : 'Selected Hub'}</Text>
              </View>
              <Text style={styles.addressLine} numberOfLines={1}>{address}</Text>
              {location && (
                <Text style={styles.coordsLine}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Cart Items List */}
        {cartItems.length > 0 ? (
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Items Added</Text>
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Explore fresh groceries and essentials from our 12 dark store hubs.
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={onNavigateToHome} activeOpacity={0.85}>
              <Text style={styles.shopNowText}>Browse Groceries</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Instructions Chips */}
        {cartItems.length > 0 && (
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Delivery Instructions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {DELIVERY_INSTRUCTIONS.map((chip) => {
                const isSelected = selectedInstruction === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSelectedInstruction(chip.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bill Receipt Component */}
        {cartItems.length > 0 && (
          <BillSummary
            itemTotal={itemTotalAmount}
            deliveryFee={deliveryFee}
            platformFee={platformFee}
            grandTotal={grandTotal}
            savings={savings}
          />
        )}

        {/* Backend Routing Card */}
        {cartItems.length > 0 && (
          <View style={styles.telemetryCard}>
            <Text style={styles.telemetryTitle}>⚡ Dark Store Haversine Router</Text>
            <Text style={styles.telemetryText}>
              Checkout calculates the exact Haversine distance from your location to all 12 operational dark stores in Aurangabad and broadcasts the 3D delivery vector to the Streamlit Command Center.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Checkout Footer */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerPriceCol}>
            <Text style={styles.toPayLabel}>TO PAY</Text>
            <Text style={styles.grandTotalText}>₹{grandTotal}</Text>
            <Text style={styles.freeDeliveryLabel}>Free 10-Min Delivery</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleCheckout}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            <View style={styles.btnRow}>
              <Text style={styles.checkoutText}>Checkout</Text>
              <Text style={styles.checkoutArrow}>➔</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Animated Loading Overlay */}
      <LoadingOverlay visible={isLoading} />

      {/* Celebratory Order Confirmed Modal */}
      <CelebrationModal
        visible={celebrationVisible}
        order={confirmedOrder}
        onClose={handleCloseCelebration}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clearCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dangerRed,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 90,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#C6F6D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  addressIcon: {
    fontSize: 18,
  },
  addressTexts: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addressBadgeTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginRight: 6,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  gpsActive: {
    backgroundColor: COLORS.brandGreen,
  },
  gpsManual: {
    backgroundColor: COLORS.warningAmber,
  },
  gpsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addressLine: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  coordsLine: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  itemsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.sm,
    lineHeight: 16,
  },
  shopNowBtn: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  shopNowText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  instructionsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 8,
  },
  chipSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: '#F0FDF4',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.brandGreen,
    fontWeight: '800',
  },
  telemetryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: SPACING.md,
  },
  telemetryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentIndigo,
    marginBottom: 4,
  },
  telemetryText: {
    fontSize: 11,
    color: '#3730A3',
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.stickyFooter,
  },
  footerPriceCol: {
    flex: 1,
  },
  toPayLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  grandTotalText: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  freeDeliveryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brandGreen,
  },
  checkoutBtn: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 6,
  },
  checkoutArrow: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
