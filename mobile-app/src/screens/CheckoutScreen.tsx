import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { LocationBar } from '../components/LocationBar';
import { CartItemRow } from '../components/CartItemRow';
import { BillSummary } from '../components/BillSummary';
import { CelebrationModal } from '../components/CelebrationModal';
import { placeLiveOrder } from '../services/api';
import { CartItem, DispatchedOrder } from '../types';

const MOCK_GROCERY_ITEMS: CartItem[] = [
  {
    id: 'item-1',
    name: 'Amul Taaza Toned Fresh Milk',
    unit: '500 ml pouch',
    price: 27,
    quantity: 2,
    emoji: '🥛',
    category: 'Dairy',
  },
  {
    id: 'item-2',
    name: 'Britannia 100% Whole Wheat Bread',
    unit: '400 g pack',
    price: 45,
    quantity: 1,
    emoji: '🍞',
    category: 'Bakery',
  },
  {
    id: 'item-3',
    name: "Lay's India's Magic Masala Chips",
    unit: '50 g pouch',
    price: 20,
    quantity: 2,
    emoji: '🥔',
    category: 'Snacks',
  },
  {
    id: 'item-4',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    unit: '1 Litre pouch',
    price: 145,
    quantity: 1,
    emoji: '🌻',
    category: 'Pantry',
  },
  {
    id: 'item-5',
    name: 'Tata Salt Vacuum Evaporated Iodized',
    unit: '1 kg packet',
    price: 28,
    quantity: 1,
    emoji: '🧂',
    category: 'Pantry',
  },
];

export const CheckoutScreen: React.FC = () => {
  const {
    location,
    address,
    loading: locationLoading,
    isUsingGPS,
    fetchLiveGPS,
    setManualLocation,
    neighborhoodOptions,
  } = useCurrentLocation();

  const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_GROCERY_ITEMS);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DispatchedOrder | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(false);

  // Cart financial calculations
  const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 0; // Quick-commerce free delivery promise
  const platformFee = itemTotal > 0 ? 2 : 0;
  const grandTotal = itemTotal + deliveryFee + platformFee;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleIncrement = (id: string) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const handleDecrement = (id: string) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Basket', 'Please add items to your grocery cart before placing an order.');
      return;
    }

    if (!location) {
      Alert.alert('Location Missing', 'Please enable GPS or select a delivery location.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Call placeLiveOrder using current user coordinates
      const response = await placeLiveOrder(location.latitude, location.longitude, {
        customer_name: 'Neel Belsare',
        delivery_address: address,
        items: cartItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        order_value: grandTotal,
      });

      if (response && response.success) {
        setConfirmedOrder(response.order);
        setCelebrationVisible(true);
      } else {
        Alert.alert('Dispatch Notice', response?.message || 'Could not route order.');
      }
    } catch (error: any) {
      Alert.alert('Routing Error', error.message || 'Unable to connect to dark-store router.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 1. Sticky Quick-Commerce Location Bar */}
      <LocationBar
        location={location}
        address={address}
        isUsingGPS={isUsingGPS}
        loading={locationLoading}
        onRefreshGPS={fetchLiveGPS}
        onSelectOption={setManualLocation}
        options={neighborhoodOptions}
      />

      {/* 2. Scrollable Body */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub-15 Min SLA Banner */}
        <View style={styles.slaBanner}>
          <View style={styles.slaIconBadge}>
            <Text style={styles.slaLightning}>⚡</Text>
          </View>
          <View style={styles.slaTextCol}>
            <Text style={styles.slaBannerTitle}>Guaranteed 10-15 Min Delivery</Text>
            <Text style={styles.slaBannerSub}>
              Automatically dispatched from your strictly nearest Chhatrapati Sambhajinagar hub.
            </Text>
          </View>
        </View>

        {/* Grocery Cart Items Section */}
        <View style={styles.cartSection}>
          <View style={styles.cartSectionHeader}>
            <Text style={styles.cartSectionTitle}>Grocery Basket ({totalItemCount} items)</Text>
            <Text style={styles.reviewStepText}>Review items</Text>
          </View>

          {cartItems.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}

          {cartItems.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>Your cart is currently empty</Text>
            </View>
          )}
        </View>

        {/* Bill Receipt Component */}
        <BillSummary
          itemTotal={itemTotal}
          deliveryFee={deliveryFee}
          platformFee={platformFee}
          grandTotal={grandTotal}
          savings={25}
        />

        {/* Backend Routing Note */}
        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryTitle}>📡 Real-Time Dispatch Pipeline</Text>
          <Text style={styles.telemetryBody}>
            Tapping "Place Order" transmits your GPS coordinates to the FastAPI backend, calculates Haversine nearest dark-store geometry, and broadcasts live 3D Arc vectors to the Streamlit Command Center.
          </Text>
        </View>
      </ScrollView>

      {/* 3. Sticky Bottom Checkout Footer */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerToPayLabel}>TO PAY</Text>
          <Text style={styles.footerGrandTotal}>₹{grandTotal}</Text>
          <Text style={styles.footerSavingsText}>Free Delivery Saved ₹25</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, (isPlacingOrder || cartItems.length === 0) && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || cartItems.length === 0}
          activeOpacity={0.88}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <View style={styles.placeOrderRow}>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Text style={styles.placeOrderChevron}>➔</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 4. Celebratory Animated Modal */}
      <CelebrationModal
        visible={celebrationVisible}
        order={confirmedOrder}
        onClose={() => setCelebrationVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  slaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandYellowLight,
    borderWidth: 1,
    borderColor: '#F6E05E',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  slaIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brandYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  slaLightning: {
    fontSize: 18,
  },
  slaTextCol: {
    flex: 1,
  },
  slaBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#744210',
  },
  slaBannerSub: {
    fontSize: 11,
    color: '#975A16',
    marginTop: 2,
    lineHeight: 15,
  },
  cartSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cartSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cartSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  reviewStepText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  telemetryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  telemetryTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.accentIndigo,
    marginBottom: 4,
  },
  telemetryBody: {
    fontSize: 11.5,
    color: '#3730A3',
    lineHeight: 16,
  },
  stickyFooter: {
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
  footerToPayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  footerGrandTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  footerSavingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brandGreen,
  },
  placeOrderButton: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 165,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  placeOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 6,
  },
  placeOrderChevron: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
