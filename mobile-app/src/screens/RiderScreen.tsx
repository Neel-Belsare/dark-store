import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { RealDeliveryMap } from '../components/RealDeliveryMap';
import { getLatestOrder, updateRiderStatus } from '../services/api';
import { DispatchedOrder, RiderOrderStatus, RiderShiftStats } from '../types';

export const RiderScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<DispatchedOrder | null>(null);
  const [riderStatus, setRiderStatus] = useState<RiderOrderStatus>('incoming');
  const [itemsChecked, setItemsChecked] = useState<Record<number, boolean>>({});
  const [stats, setStats] = useState<RiderShiftStats>({
    ordersDelivered: 14,
    earningsToday: 770,
    tipsEarned: 120,
    onlineHours: 5.2,
    rating: 4.94,
  });

  // Fetch active order from FastAPI / Supabase
  const pollActiveOrder = useCallback(async () => {
    try {
      const order = await getLatestOrder();
      if (order && order.active !== false && order.status !== 'completed' && order.status !== 'delivered') {
        setActiveOrder(order);
        if (order.status === 'in_transit') {
          setRiderStatus('picked_up');
        } else if (order.status === 'at_dark_store') {
          setRiderStatus('arrived_hub');
        } else if (order.status === 'rider_assigned') {
          setRiderStatus('accepted');
        } else {
          setRiderStatus('incoming');
        }
      } else if (!activeOrder) {
        // No active order from backend
      }
    } catch (e) {
      console.warn('Rider poll error:', e);
    }
  }, [activeOrder]);

  useEffect(() => {
    pollActiveOrder();
    const interval = setInterval(pollActiveOrder, 5000);
    return () => clearInterval(interval);
  }, [pollActiveOrder]);

  // Demo Fallback Order generator when user clicks "Simulate Incoming Dispatch"
  const handleSimulateDispatch = () => {
    const mockOrder: DispatchedOrder = {
      order_id: `CSN-RDR-${Math.floor(1000 + Math.random() * 9000)}`,
      cust_lat: 19.8762,
      cust_lon: 75.3654,
      customer_name: 'Aditi Sharma',
      delivery_address: 'Flat 402, Royal Palms, Cannaught Place, CIDCO',
      delivery_notes: 'Leave at front security desk. Don\'t ring bell.',
      substitution_preference: 'similar',
      assigned_store: 'Store 1 - CIDCO Hub',
      store_lat: 19.8735,
      store_lon: 75.3621,
      coverage_area: 'CIDCO N-1 to N-7, Cannaught',
      distance_km: 1.15,
      eta_mins: 8,
      weather: 'Clear',
      traffic: 'Moderate',
      items: [
        'Amul Taaza Toned Fresh Milk (x2)',
        'Britannia 100% Whole Wheat Bread (x1)',
        'Lay\'s India\'s Magic Masala Chips (x2)',
      ],
      order_val: 179,
      rider: 'Rahul S. (Rider #18)',
      timestamp: new Date().toLocaleTimeString(),
      source: 'Rider Partner Simulation',
      status: 'active',
      active: true,
    };
    setActiveOrder(mockOrder);
    setRiderStatus('incoming');
    setItemsChecked({});
  };

  // Status transitions
  const handleAcceptOrder = async () => {
    if (!activeOrder) return;
    setLoading(true);
    await updateRiderStatus(activeOrder.order_id, 'accepted');
    setRiderStatus('accepted');
    setLoading(false);
  };

  const handleArrivedHub = async () => {
    if (!activeOrder) return;
    setLoading(true);
    await updateRiderStatus(activeOrder.order_id, 'arrived_hub');
    setRiderStatus('arrived_hub');
    setLoading(false);
  };

  const handlePickedUp = async () => {
    if (!activeOrder) return;
    setLoading(true);
    await updateRiderStatus(activeOrder.order_id, 'picked_up');
    setRiderStatus('picked_up');
    setLoading(false);
  };

  const handleDelivered = async () => {
    if (!activeOrder) return;
    setLoading(true);
    await updateRiderStatus(activeOrder.order_id, 'delivered');
    setRiderStatus('delivered');
    setStats((prev) => ({
      ...prev,
      ordersDelivered: prev.ordersDelivered + 1,
      earningsToday: prev.earningsToday + 55,
      tipsEarned: prev.tipsEarned + 10,
    }));
    setLoading(false);
    Alert.alert('🎉 Delivery Completed!', '₹65 (₹55 base + ₹10 tip) added to your shift wallet!');
  };

  const handleResetForNext = () => {
    setActiveOrder(null);
    setRiderStatus('incoming');
    setItemsChecked({});
  };

  const toggleItemCheck = (idx: number) => {
    setItemsChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Rider Partner Header & Duty Status */}
      <View style={styles.partnerHeader}>
        <View style={styles.riderProfileRow}>
          <View style={styles.riderAvatar}>
            <Text style={styles.riderAvatarText}>🛵</Text>
          </View>
          <View style={styles.riderInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.riderName}>Rahul Shinde</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>PRO RIDER</Text>
              </View>
            </View>
            <Text style={styles.vehicleText}>Bajaj Chetak EV • MH-20-EQ-4421</Text>
            <Text style={styles.hubSubtext}>Assigned: CIDCO Sector N-4 Dark Store Hub</Text>
          </View>
        </View>

        {/* Online / Offline Duty Switch */}
        <View style={[styles.dutyStatusCard, isOnline ? styles.dutyOnline : styles.dutyOffline]}>
          <View style={styles.dutyLeft}>
            <View style={[styles.dutyDot, isOnline ? styles.dotGreen : styles.dotGray]} />
            <Text style={styles.dutyLabel}>
              {isOnline ? 'ONLINE • RECEIVING ORDERS' : 'OFFLINE • DUTY PAUSED'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#94A3B8', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 2. Today's Performance & Earnings Strip */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.earningsToday}</Text>
          <Text style={styles.statTitle}>Today's Pay</Text>
          <Text style={styles.statDelta}>+₹{stats.tipsEarned} tips</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.ordersDelivered}</Text>
          <Text style={styles.statTitle}>Delivered</Text>
          <Text style={styles.statDelta}>Avg 9.2 min</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.rating} ★</Text>
          <Text style={styles.statTitle}>Rating</Text>
          <Text style={styles.statDelta}>Top 5%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.onlineHours}h</Text>
          <Text style={styles.statTitle}>Online</Text>
          <Text style={styles.statDelta}>Active shift</Text>
        </View>
      </View>

      {/* 3. Active Order / Dispatch Management Card */}
      {!isOnline ? (
        <View style={styles.offlinePlaceholder}>
          <Text style={styles.placeholderEmoji}>⏸️</Text>
          <Text style={styles.placeholderTitle}>You are currently Offline</Text>
          <Text style={styles.placeholderSub}>
            Toggle your status to Online above to receive fast dark-store dispatch orders in Aurangabad.
          </Text>
        </View>
      ) : activeOrder ? (
        <View style={styles.orderCard}>
          {/* Top Order Pill & Payout */}
          <View style={styles.orderTopBar}>
            <View>
              <Text style={styles.orderIdText}>Order #{activeOrder.order_id}</Text>
              <Text style={styles.orderTimeText}>Placed {activeOrder.timestamp} • {activeOrder.distance_km} km away</Text>
            </View>
            <View style={styles.payoutBadge}>
              <Text style={styles.payoutAmount}>₹55</Text>
              <Text style={styles.payoutSub}>Est. Payout</Text>
            </View>
          </View>

          {/* Stepper Progress Indicator */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepItem, riderStatus !== 'incoming' && styles.stepItemActive]}>
              <View style={[styles.stepCircle, riderStatus !== 'incoming' && styles.stepCircleActive]}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Accept</Text>
            </View>
            <View style={[styles.stepLine, (riderStatus === 'arrived_hub' || riderStatus === 'picked_up' || riderStatus === 'delivered') && styles.stepLineActive]} />

            <View style={[styles.stepItem, (riderStatus === 'arrived_hub' || riderStatus === 'picked_up' || riderStatus === 'delivered') && styles.stepItemActive]}>
              <View style={[styles.stepCircle, (riderStatus === 'arrived_hub' || riderStatus === 'picked_up' || riderStatus === 'delivered') && styles.stepCircleActive]}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepLabel}>At Hub</Text>
            </View>
            <View style={[styles.stepLine, (riderStatus === 'picked_up' || riderStatus === 'delivered') && styles.stepLineActive]} />

            <View style={[styles.stepItem, (riderStatus === 'picked_up' || riderStatus === 'delivered') && styles.stepItemActive]}>
              <View style={[styles.stepCircle, (riderStatus === 'picked_up' || riderStatus === 'delivered') && styles.stepCircleActive]}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Picked</Text>
            </View>
            <View style={[styles.stepLine, riderStatus === 'delivered' && styles.stepLineActive]} />

            <View style={[styles.stepItem, riderStatus === 'delivered' && styles.stepItemActive]}>
              <View style={[styles.stepCircle, riderStatus === 'delivered' && styles.stepCircleActive]}>
                <Text style={styles.stepNum}>4</Text>
              </View>
              <Text style={styles.stepLabel}>Delivered</Text>
            </View>
          </View>

          {/* Pickup & Drop Details */}
          <View style={styles.routeBox}>
            <View style={styles.stopRow}>
              <View style={styles.stopIconHub}>
                <Text style={styles.stopIconText}>🏬</Text>
              </View>
              <View style={styles.stopDetails}>
                <Text style={styles.stopTitle}>PICKUP: {activeOrder.assigned_store}</Text>
                <Text style={styles.stopSubtitle}>Packaging Bay 3 • Fast Dispatch Ready</Text>
              </View>
            </View>

            <View style={styles.stopDivider} />

            <View style={styles.stopRow}>
              <View style={styles.stopIconCust}>
                <Text style={styles.stopIconText}>🏠</Text>
              </View>
              <View style={styles.stopDetails}>
                <Text style={styles.stopTitle}>DROP: {activeOrder.customer_name || 'Customer'}</Text>
                <Text style={styles.stopSubtitle}>{activeOrder.delivery_address || 'CIDCO, Aurangabad'}</Text>
                {activeOrder.delivery_notes && (
                  <View style={styles.notesPill}>
                    <Text style={styles.notesText}>📝 "{activeOrder.delivery_notes}"</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Interactive Road Navigation Map */}
          <View style={styles.mapSection}>
            <Text style={styles.mapHeaderTitle}>🗺️ Live Turn-by-Turn Road Route</Text>
            <RealDeliveryMap
              storeLat={activeOrder.store_lat}
              storeLon={activeOrder.store_lon}
              storeName={activeOrder.assigned_store}
              custLat={activeOrder.cust_lat}
              custLon={activeOrder.cust_lon}
              custAddress={activeOrder.delivery_address}
              riderName={activeOrder.rider}
              distanceKm={activeOrder.distance_km}
              etaMins={activeOrder.eta_mins}
            />
          </View>

          {/* Item Checklist for Bag Packing */}
          <View style={styles.itemsBox}>
            <Text style={styles.itemsHeader}>📦 Items to Verify ({activeOrder.items?.length || 0}):</Text>
            {activeOrder.items && activeOrder.items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.itemCheckRow, itemsChecked[idx] && styles.itemCheckRowDone]}
                onPress={() => toggleItemCheck(idx)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, itemsChecked[idx] && styles.checkboxActive]}>
                  <Text style={styles.checkMark}>{itemsChecked[idx] ? '✓' : ''}</Text>
                </View>
                <Text style={[styles.itemText, itemsChecked[idx] && styles.itemTextDone]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contextual Action Stepper Buttons */}
          <View style={styles.actionSection}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.brandGreen} />
            ) : riderStatus === 'incoming' ? (
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleAcceptOrder}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>🟢 ACCEPT DISPATCH ORDER (₹55)</Text>
              </TouchableOpacity>
            ) : riderStatus === 'accepted' ? (
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handleArrivedHub}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>🏬 ARRIVED AT DARK STORE HUB</Text>
              </TouchableOpacity>
            ) : riderStatus === 'arrived_hub' ? (
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={handlePickedUp}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>📦 ITEMS CHECKED & PICKED UP</Text>
              </TouchableOpacity>
            ) : riderStatus === 'picked_up' ? (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
                onPress={handleDelivered}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>🏁 DELIVERED TO CUSTOMER</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.deliveredSuccessBox}>
                <Text style={styles.deliveredSuccessTitle}>🎉 Order CSN-{activeOrder.order_id} Completed!</Text>
                <Text style={styles.deliveredSuccessSub}>Payout credited to your balance.</Text>
                <TouchableOpacity
                  style={styles.nextOrderBtn}
                  onPress={handleResetForNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextOrderBtnText}>✨ Ready for Next Dispatch</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.waitingCard}>
          <Text style={styles.radarEmoji}>📡</Text>
          <Text style={styles.waitingTitle}>Scanning for Dispatch Orders...</Text>
          <Text style={styles.waitingSub}>
            You are stationed in a high-demand quick commerce zone (CIDCO Sector N-4). Orders are automatically dispatched to the nearest available rider.
          </Text>

          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={handleSimulateDispatch}
            activeOpacity={0.85}
          >
            <Text style={styles.simulateBtnText}>⚡ Simulate Incoming Dispatch Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Safety & Rider Support Notice */}
      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>🛡️ Aurangabad Rider Safety & Protocol</Text>
        <Text style={styles.supportPoint}>• Max speed limit: 35 km/h on internal sector streets.</Text>
        <Text style={styles.supportPoint}>• Wear high-visibility helmet and dark store rain windcheater.</Text>
        <Text style={styles.supportPoint}>• Cold-bag insulation mandatory for dairy & ice cream items.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  partnerHeader: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  riderProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  riderAvatarText: {
    fontSize: 26,
  },
  riderInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riderName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  vehicleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  hubSubtext: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  dutyStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  dutyOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  dutyOffline: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  dutyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dutyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotGray: {
    backgroundColor: '#94A3B8',
  },
  dutyLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDelta: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.brandGreen,
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  orderTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  payoutBadge: {
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.brandGreenBorder,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.brandGreen,
  },
  payoutSub: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.brandGreenDark,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepItemActive: {},
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: COLORS.brandGreen,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: COLORS.brandGreen,
  },
  routeBox: {
    backgroundColor: COLORS.surfaceSecondary,
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stopIconHub: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIconCust: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIconText: {
    fontSize: 15,
  },
  stopDetails: {
    flex: 1,
  },
  stopTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stopSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notesPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  notesText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  stopDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  mapSection: {
    marginBottom: SPACING.md,
  },
  mapHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  itemsBox: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: SPACING.md,
  },
  itemsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  itemCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  itemCheckRowDone: {
    backgroundColor: '#F0FDF4',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  itemText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  itemTextDone: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  actionSection: {
    marginTop: 4,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.brandGreen,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  deliveredSuccessBox: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  deliveredSuccessTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  deliveredSuccessSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    marginBottom: 10,
  },
  nextOrderBtn: {
    backgroundColor: COLORS.brandYellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  nextOrderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  waitingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  radarEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  waitingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  waitingSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  simulateBtn: {
    backgroundColor: COLORS.brandYellow,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#EAB308',
    ...SHADOWS.small,
  },
  simulateBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  offlinePlaceholder: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  placeholderEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  placeholderSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  supportCard: {
    backgroundColor: '#FEF9C3',
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  supportTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
    marginBottom: 4,
  },
  supportPoint: {
    fontSize: 10,
    color: '#713F12',
    lineHeight: 15,
  },
});
