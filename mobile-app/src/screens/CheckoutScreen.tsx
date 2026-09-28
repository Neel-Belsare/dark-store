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
import { COLORS } from '../constants/theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { LocationBar } from '../components/LocationBar';
import { CartItemRow } from '../components/CartItemRow';
import { BillSummary } from '../components/BillSummary';
import { CelebrationModal } from '../components/CelebrationModal';
import { submitOrder } from '../services/api';
import { CartItem, DispatchedOrder, OrderPayload } from '../types';

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'item-1',
    name: 'Amul Taaza Toned Milk',
    unit: '500 ml',
    price: 27,
    quantity: 2,
    emoji: '🥛',
    category: 'Dairy',
  },
  {
    id: 'item-2',
    name: 'Britannia 100% Whole Wheat Bread',
    unit: '400 g',
    price: 45,
    quantity: 1,
    emoji: '🍞',
    category: 'Bakery',
  },
  {
    id: 'item-3',
    name: "Lay's India's Magic Masala",
    unit: '50 g',
    price: 20,
    quantity: 2,
    emoji: '🥔',
    category: 'Snacks',
  },
  {
    id: 'item-4',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    unit: '1 L',
    price: 145,
    quantity: 1,
    emoji: '🌻',
    category: 'Pantry',
  },
  {
    id: 'item-5',
    name: 'Tata Salt Vacuum Evaporated',
    unit: '1 kg',
    price: 28,
    quantity: 1,
    emoji: '🧂',
    category: 'Pantry',
  },
];

const DELIVERY_INSTRUCTIONS = [
  { id: '1', label: '🚪 Leave at door', icon: '🚪' },
  { id: '2', label: '🔕 Don\'t ring bell', icon: '🔕' },
  { id: '3', label: '📞 Avoid calling', icon: '📞' },
  { id: '4', label: '🛡️ Guard delivery', icon: '🛡️' },
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

  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [selectedInstruction, setSelectedInstruction] = useState<string>('1');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DispatchedOrder | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(false);

  // Cart calculations
  const itemTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = itemTotal > 0 ? 2 : 0;
  const deliveryFee = 0; // Free delivery
  const grandTotal = itemTotal + platformFee + deliveryFee;
  const savings = 25; // Standard delivery fee waiver

  const handleIncrement = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const handleDecrement = (id: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    setIsPlacingOrder(true);

    const payload: OrderPayload = {
      latitude: location.latitude,
      longitude: location.longitude,
      customer_name: 'Neel Belsare',
      customer_phone: '+91 98765 43210',
      delivery_address: address,
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      order_value: grandTotal,
    };

    try {
      const response = await submitOrder(payload);
      if (response && response.success) {
        setConfirmedOrder(response.order);
        setCelebrationVisible(true);
      } else {
        Alert.alert('Order Failed', response?.message || 'Could not dispatch order.');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', err.message || 'Failed to connect to dark store router.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.headerBrandRow}>
          <Text style={styles.logoText}>blink<Text style={styles.logoHighlight}>it</Text></Text>
          <View style={styles.slaBadgeHeader}>
            <Text style={styles.slaBadgeText}>⚡ 10 MINUTES</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Chhatrapati Sambhajinagar Quick Commerce</Text>
      </View>

      {/* GPS Location Bar */}
      <LocationBar
        location={location}
        address={address}
        isUsingGPS={isUsingGPS}
        loading={locationLoading}
        onRefreshGPS={fetchLiveGPS}
        onSelectOption={setManualLocation}
        options={neighborhoodOptions}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Delivery ETA Alert */}
        <View style={styles.etaCard}>
          <View style={styles.etaIconCircle}>
            <Text style={styles.etaIcon}>⚡</Text>
          </View>
          <View style={styles.etaDetails}>
            <Text style={styles.etaTitle}>Sub-15 Minute Delivery Promised</Text>
            <Text style={styles.etaSub}>
              Routed automatically to the nearest Aurangabad dark store hub via Haversine geometry.
            </Text>
          </View>
        </View>

        {/* Cart Items Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cart Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</Text>
            <Text style={styles.stepInfo}>Step 1 of 2</Text>
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
            <View style={styles.emptyCart}>
              <Text style={styles.emptyText}>Your grocery basket is empty</Text>
            </View>
          )}
        </View>

        {/* Delivery Instructions Chips */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {DELIVERY_INSTRUCTIONS.map((chip) => {
              const isSelected = selectedInstruction === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.instructionChip, isSelected && styles.instructionChipSelected]}
                  onPress={() => setSelectedInstruction(chip.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.instructionChipText, isSelected && styles.instructionChipTextSelected]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Bill Summary */}
        <BillSummary
          itemTotal={itemTotal}
          deliveryFee={deliveryFee}
          platformFee={platformFee}
          grandTotal={grandTotal}
          savings={savings}
        />

        {/* Streamlit Bridge Integration Notice */}
        <View style={styles.bridgeNotice}>
          <Text style={styles.bridgeNoticeTitle}>📡 Streamlit Telemetry Link</Text>
          <Text style={styles.bridgeNoticeText}>
            Submitting this order sends live GPS coordinates to the FastAPI bridge (<Text style={{fontWeight: '700'}}>Port 8000</Text>), which instantly triggers 3D Arc & telemetry animation in your Streamlit Command Center dashboard.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Order Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomToPayLabel}>TO PAY</Text>
          <Text style={styles.bottomPriceValue}>₹{grandTotal}</Text>
          <Text style={styles.bottomSavingsSub}>Free Delivery Applied</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isPlacingOrder && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || cartItems.length === 0}
          activeOpacity={0.85}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <View style={styles.placeOrderRow}>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Text style={styles.placeOrderArrow}>➔</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Celebratory Dispatch Modal with Micro-Animations */}
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
  header: {
    backgroundColor: COLORS.primaryYellow,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2BD1C',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },
  logoHighlight: {
    color: COLORS.primaryGreen,
  },
  slaBadgeHeader: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  slaBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#554200',
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEA',
    borderWidth: 1,
    borderColor: '#F6E05E',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  etaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  etaIcon: {
    fontSize: 20,
  },
  etaDetails: {
    flex: 1,
  },
  etaTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#744210',
  },
  etaSub: {
    fontSize: 11,
    color: '#975A16',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stepInfo: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyCart: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: 10,
  },
  instructionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  instructionChipSelected: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: '#F0FDF4',
  },
  instructionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  instructionChipTextSelected: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  bridgeNotice: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: 14,
    marginTop: 4,
  },
  bridgeNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.accentIndigo,
    marginBottom: 4,
  },
  bridgeNoticeText: {
    fontSize: 11.5,
    color: '#3730A3',
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomToPayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
  bottomPriceValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  bottomSavingsSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  placeOrderBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
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
  placeOrderArrow: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
