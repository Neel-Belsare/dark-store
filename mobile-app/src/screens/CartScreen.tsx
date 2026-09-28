import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { CartItemRow } from '../components/CartItemRow';
import { BillSummary } from '../components/BillSummary';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { CelebrationModal } from '../components/CelebrationModal';
import { placeLiveOrder, checkServiceability, resetLiveOrder } from '../services/api';
import { DispatchedOrder, ServiceabilityResponse, SubstitutionPreference } from '../types';

interface CartScreenProps {
  onNavigateToHome: () => void;
}

const DELIVERY_SUGGESTIONS = [
  { id: '1', label: 'Leave at door', icon: '🚪' },
  { id: '2', label: "Don't ring bell", icon: '🔕' },
  { id: '3', label: 'Avoid calling', icon: '📞' },
  { id: '4', label: 'Leave at guard', icon: '🛡️' },
  { id: '5', label: 'Pet in house', icon: '🐶' },
];

const SUBSTITUTION_OPTIONS: { id: SubstitutionPreference; title: string; subtitle: string; icon: string }[] = [
  {
    id: 'similar',
    title: 'Smart Replacement',
    subtitle: 'Auto-replace with equal or higher value brand',
    icon: '🔄',
  },
  {
    id: 'call_confirm',
    title: 'Call to Confirm',
    subtitle: 'Rider calls for approval before picking alternative',
    icon: '📞',
  },
  {
    id: 'do_not_substitute',
    title: "Don't Substitute",
    subtitle: 'Refund unavailable items immediately',
    icon: '🚫',
  },
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
    deliveryNotes,
    setDeliveryNotes,
    substitutionPreference,
    setSubstitutionPreference,
  } = useCart();

  const { location, address, isUsingGPS } = useCurrentLocation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DispatchedOrder | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState<boolean>(false);
  const [serviceability, setServiceability] = useState<ServiceabilityResponse | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState<boolean>(false);

  // Real-time GeoJSON Catchment Serviceability Evaluation
  useEffect(() => {
    if (location) {
      let isMounted = true;
      setCheckingServiceability(true);
      checkServiceability(location.latitude, location.longitude)
        .then((res) => {
          if (isMounted) setServiceability(res);
        })
        .catch((err) => {
          console.warn('Serviceability verification error:', err);
        })
        .finally(() => {
          if (isMounted) setCheckingServiceability(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [location]);

  const isServiceable = serviceability ? serviceability.is_serviceable : true;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Basket', 'Add items from the store before checking out.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please enable GPS or select a delivery location.');
      return;
    }

    if (!isServiceable) {
      Alert.alert(
        'Out of Service Area',
        `Your delivery address is ${serviceability?.distance_km ?? '>4'} km away, exceeding our quick-commerce dark store radius (4.0 km).`
      );
      return;
    }

    // 1. Show animated "Finding your nearest dark store..." overlay
    setIsLoading(true);

    try {
      // 2. Transmit coordinates and enriched payload to Python FastAPI backend
      const response = await placeLiveOrder(location.latitude, location.longitude, {
        customer_name: 'Neel Belsare',
        customer_phone: '+91 98765 43210',
        delivery_address: address,
        delivery_notes: deliveryNotes,
        substitution_preference: substitutionPreference,
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

  const handleCloseCelebration = async () => {
    setCelebrationVisible(false);
    // Bi-directional Done/Reset Sync: Notify backend & Streamlit to return to idle
    try {
      await resetLiveOrder();
    } catch (err) {
      console.warn('Reset live order sync error:', err);
    }
    clearCart();
    onNavigateToHome();
  };

  const handlePromptClearCart = () => {
    Alert.alert(
      'Clear Basket?',
      'Are you sure you want to remove all items from your basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onNavigateToHome}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your cart
            </Text>
          </View>
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handlePromptClearCart}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearBtnText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Pill & SLA Banner */}
        <View style={styles.addressCard}>
          <View style={styles.slaRow}>
            <View style={styles.slaBadge}>
              <Text style={styles.slaBolt}>⚡</Text>
              <Text style={styles.slaText}>10 MINS DELIVERY</Text>
            </View>
            <View style={styles.gpsStatusPill}>
              <View style={[styles.gpsDot, isUsingGPS ? styles.gpsActive : styles.gpsManual]} />
              <Text style={styles.gpsStatusText}>
                {isUsingGPS ? 'Live GPS Locked' : 'Selected Hub'}
              </Text>
            </View>
          </View>

          <View style={styles.addressDivider} />

          <View style={styles.addressBody}>
            <View style={styles.addressIconCircle}>
              <Text style={styles.addressIconEmoji}>📍</Text>
            </View>
            <View style={styles.addressTextCol}>
              <Text style={styles.addressLabel}>Delivering to</Text>
              <Text style={styles.addressLine} numberOfLines={2}>
                {address}
              </Text>
              {location && (
                <Text style={styles.coordsLine}>
                  {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Catchment Serviceability Warning Banner (When outside dark store radius) */}
        {!isServiceable && (
          <View style={styles.serviceabilityAlertCard}>
            <View style={styles.serviceabilityAlertHeader}>
              <Text style={styles.serviceabilityAlertEmoji}>🚫</Text>
              <Text style={styles.serviceabilityAlertTitle}>Location Outside Delivery Zone</Text>
            </View>
            <Text style={styles.serviceabilityAlertBody}>
              {serviceability?.message ||
                `Your selected address is ${serviceability?.distance_km ?? 'beyond'} km away, which exceeds our 4.0 km 10-minute dark store delivery perimeter.`}
            </Text>
            <Text style={styles.serviceabilityAlertSub}>
              Please select an address within Aurangabad dark store coverage (e.g., Osmanpura, CIDCO, Kranti Chowk).
            </Text>
          </View>
        )}

        {/* Cart Items List */}
        {cartItems.length > 0 ? (
          <View style={styles.itemsSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleLeft}>
                <Text style={styles.sectionTitle}>Basket Items</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{totalItemCount}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onNavigateToHome} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.addMoreLink}>+ Add More</Text>
              </TouchableOpacity>
            </View>

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
          /* Empty Cart State */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>🛍️</Text>
            </View>
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptySub}>
              Browse through fresh groceries and everyday essentials dispatched in 10 minutes from our nearest dark store.
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={onNavigateToHome}
              activeOpacity={0.85}
            >
              <Text style={styles.shopNowText}>Start Shopping ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Instructions & Custom Notes Card */}
        {cartItems.length > 0 && (
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Delivery Notes & Instructions</Text>
            <Text style={styles.instructionsSub}>Drop-off directions for the dark store courier</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {DELIVERY_SUGGESTIONS.map((chip) => {
                const isPresent = deliveryNotes.includes(chip.label);
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.chip, isPresent && styles.chipSelected]}
                    onPress={() => {
                      if (isPresent) {
                        setDeliveryNotes(
                          deliveryNotes
                            .replace(chip.label, '')
                            .replace(/,\s*,/g, ',')
                            .replace(/^,\s*|\s*,\s*$/g, '')
                            .trim()
                        );
                      } else {
                        const newNotes = deliveryNotes ? `${deliveryNotes}, ${chip.label}` : chip.label;
                        setDeliveryNotes(newNotes);
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chipIcon}>{chip.icon}</Text>
                    <Text style={[styles.chipText, isPresent && styles.chipTextSelected]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Custom Notes Input Field */}
            <View style={styles.customNotesBox}>
              <Text style={styles.customNotesLabel}>Courier Note / Flat / Gate Details:</Text>
              <TextInput
                style={styles.customNotesInput}
                placeholder="e.g. Ring bell twice, leave with security guard..."
                placeholderTextColor={COLORS.textMuted}
                value={deliveryNotes}
                onChangeText={setDeliveryNotes}
                maxLength={140}
              />
            </View>
          </View>
        )}

        {/* Out-of-Stock Substitution Preferences */}
        {cartItems.length > 0 && (
          <View style={styles.substitutionSection}>
            <Text style={styles.sectionTitle}>Item Substitution Policy</Text>
            <Text style={styles.instructionsSub}>If an item runs out during warehouse picking</Text>

            <View style={styles.substitutionList}>
              {SUBSTITUTION_OPTIONS.map((opt) => {
                const isSelected = substitutionPreference === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.substitutionCard, isSelected && styles.substitutionCardSelected]}
                    onPress={() => setSubstitutionPreference(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.substitutionRadioRow}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={styles.substitutionIcon}>{opt.icon}</Text>
                      <View style={styles.substitutionTextCol}>
                        <Text style={[styles.substitutionTitle, isSelected && styles.substitutionTitleSelected]}>
                          {opt.title}
                        </Text>
                        <Text style={styles.substitutionSubtitle}>{opt.subtitle}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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

        {/* Dark Store Haversine Router Telemetry Card */}
        {cartItems.length > 0 && (
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryHeader}>
              <View style={styles.telemetryPill}>
                <Text style={styles.telemetryDot}>●</Text>
                <Text style={styles.telemetryPillText}>AI DISPATCH ENGINE</Text>
              </View>
              <Text style={styles.telemetrySubTag}>12 Aurangabad Hubs</Text>
            </View>
            <Text style={styles.telemetryTitle}>Predictive Dark Store Routing</Text>
            <Text style={styles.telemetryText}>
              Checkout calculates the exact Haversine vector from your location to all 12 operational dark stores in Aurangabad, evaluates weather & traffic modifiers, and dispatches your order instantly to the Streamlit Command Center.
            </Text>
          </View>
        )}

        {/* Cancellation Notice */}
        {cartItems.length > 0 && (
          <View style={styles.policyCard}>
            <Text style={styles.policyIcon}>⏱️</Text>
            <Text style={styles.policyText}>
              Orders cannot be cancelled once packed to guarantee rapid 10-minute dispatch.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Checkout Footer */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerPriceCol}>
            <Text style={styles.toPayLabel}>TO PAY</Text>
            <View style={styles.totalWithSavings}>
              <Text style={styles.grandTotalText}>₹{grandTotal}</Text>
              {savings > 0 && (
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsPillText}>SAVE ₹{savings}</Text>
                </View>
              )}
            </View>
            <Text style={styles.freeDeliveryLabel}>
              {isServiceable ? '⚡ FREE Delivery applied' : '⚠️ Address unserviceable'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              (isLoading || !isServiceable) && styles.checkoutBtnDisabled,
            ]}
            onPress={handleCheckout}
            disabled={isLoading || !isServiceable}
            activeOpacity={0.88}
          >
            <View style={styles.btnRow}>
              <Text style={styles.checkoutText}>
                {isLoading
                  ? 'Routing...'
                  : !isServiceable
                  ? 'Out of Zone'
                  : 'Place Order'}
              </Text>
              {isServiceable && !isLoading && <Text style={styles.checkoutArrow}>➔</Text>}
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
    borderBottomColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  clearBtn: {
    backgroundColor: COLORS.dangerRedLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.dangerRed,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  slaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandYellowLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  slaBolt: {
    fontSize: 12,
    marginRight: 4,
  },
  slaText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#854D0E',
    letterSpacing: 0.4,
  },
  gpsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  gpsActive: {
    backgroundColor: COLORS.brandGreen,
  },
  gpsManual: {
    backgroundColor: COLORS.warningAmber,
  },
  gpsStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addressDivider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: SPACING.md,
  },
  addressBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brandGreenLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  addressIconEmoji: {
    fontSize: 17,
  },
  addressTextCol: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  coordsLine: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: 6,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  addMoreLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginTop: SPACING.lg,
    ...SHADOWS.card,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.brandYellowLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyIcon: {
    fontSize: 34,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  shopNowBtn: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  shopNowText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '800',
  },
  instructionsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  instructionsSub: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 8,
  },
  chipSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.brandGreenLight,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.brandGreen,
    fontWeight: '800',
  },
  telemetryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xs,
  },
  telemetryDot: {
    fontSize: 8,
    color: COLORS.accentIndigo,
    marginRight: 5,
  },
  telemetryPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.accentIndigo,
    letterSpacing: 0.5,
  },
  telemetrySubTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1',
  },
  telemetryTitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  telemetryText: {
    fontSize: 11.5,
    color: '#4338CA',
    lineHeight: 16,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
  },
  policyIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  policyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    ...SHADOWS.stickyFooter,
  },
  footerPriceCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  toPayLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  totalWithSavings: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  grandTotalText: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  savingsPill: {
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginLeft: 6,
  },
  savingsPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
  freeDeliveryLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.brandGreen,
  },
  checkoutBtn: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 155,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutBtnDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.bodyMedium,
    fontWeight: '800',
    marginRight: 6,
  },
  checkoutArrow: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  serviceabilityAlertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#F87171',
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  serviceabilityAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceabilityAlertEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  serviceabilityAlertTitle: {
    fontSize: TYPOGRAPHY.bodyMedium,
    fontWeight: '800',
    color: '#991B1B',
  },
  serviceabilityAlertBody: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: '#B91C1C',
    lineHeight: 18,
    marginBottom: 6,
  },
  serviceabilityAlertSub: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#7F1D1D',
  },
  customNotesBox: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  customNotesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  customNotesInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  substitutionSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  substitutionList: {
    marginTop: 4,
  },
  substitutionCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  substitutionCardSelected: {
    backgroundColor: COLORS.brandGreenLight,
    borderColor: COLORS.brandGreen,
  },
  substitutionRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: COLORS.brandGreen,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brandGreen,
  },
  substitutionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  substitutionTextCol: {
    flex: 1,
  },
  substitutionTitle: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  substitutionTitleSelected: {
    color: COLORS.brandGreenDark,
    fontWeight: '800',
  },
  substitutionSubtitle: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
