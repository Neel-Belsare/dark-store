import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DispatchedOrder } from '../types';

const { width, height } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  order: DispatchedOrder | null;
  onClose: () => void;
}

type OrderStage = 'placed' | 'accepted' | 'on_the_way';

// Confetti particle configuration
const CONFETTI_COLORS = ['#F7D435', '#0C831F', '#6366F1', '#EC4899', '#06B6D4', '#F59E0B'];
const PARTICLES = Array.from({ length: 24 }).map((_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  angle: (i / 24) * 2 * Math.PI,
  distance: 70 + (i % 4) * 24,
  size: 6 + (i % 3) * 3,
}));

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  order,
  onClose,
}) => {
  // Current progression stage: 'placed' -> 'accepted' -> 'on_the_way'
  const [currentStage, setCurrentStage] = useState<OrderStage>('placed');
  const [etaRemaining, setEtaRemaining] = useState<number>(order?.eta_mins || 5);

  // Animated values
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const checkBounceAnim = useRef(new Animated.Value(0)).current;

  // Rider route movement animation (0.0 to 1.0)
  const riderAnim = useRef(new Animated.Value(0)).current;
  const riderLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Auto-progress timers
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (riderLoopRef.current) {
      riderLoopRef.current.stop();
    }
  };

  const startRiderAnimation = () => {
    riderAnim.setValue(0);
    riderLoopRef.current = Animated.loop(
      Animated.timing(riderAnim, {
        toValue: 1,
        duration: 10000, // 10-second route traversal
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    riderLoopRef.current.start();
  };

  useEffect(() => {
    if (visible && order) {
      clearTimers();
      setCurrentStage('placed');
      setEtaRemaining(order.eta_mins || 5);

      scaleAnim.setValue(0.85);
      slideAnim.setValue(50);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);
      checkBounceAnim.setValue(0);
      riderAnim.setValue(0);

      // Entrance animations
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(checkBounceAnim, {
            toValue: 1,
            friction: 4,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Stage 1 -> Stage 2: "Order Accepted" after 2.2 seconds
      const t1 = setTimeout(() => {
        setCurrentStage('accepted');
      }, 2200);

      // Stage 2 -> Stage 3: "Rider on the Way" after 4.5 seconds
      const t2 = setTimeout(() => {
        setCurrentStage('on_the_way');
        startRiderAnimation();
      }, 4500);

      timersRef.current = [t1, t2];
    } else {
      clearTimers();
      setCurrentStage('placed');
    }

    return () => {
      clearTimers();
    };
  }, [visible, order]);

  // Dynamic countdown timer as rider travels
  useEffect(() => {
    if (currentStage === 'on_the_way' && order) {
      const interval = setInterval(() => {
        setEtaRemaining((prev) => {
          if (prev <= 1) return 1;
          return prev - 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentStage, order]);

  if (!order) return null;

  // Multi-node road path coordinates inside map (320x170 px coordinate space)
  // Segment 1: (30, 130) -> (95, 130)
  // Segment 2: (95, 130) -> (95, 80)
  // Segment 3: (95, 80)  -> (185, 80)
  // Segment 4: (185, 80) -> (185, 30)
  // Segment 5: (185, 30) -> (260, 30)
  const riderPosX = riderAnim.interpolate({
    inputRange: [0, 0.22, 0.44, 0.72, 1],
    outputRange: [30, 95, 95, 185, 260],
  });

  const riderPosY = riderAnim.interpolate({
    inputRange: [0, 0.22, 0.44, 0.72, 1],
    outputRange: [130, 130, 80, 80, 30],
  });

  const handleCallRider = () => {
    Alert.alert(
      'Calling Delivery Fleet',
      `Connecting to ${order.rider} on +91 98230 44821...`,
      [{ text: 'End Call', style: 'cancel' }]
    );
  };

  const handleReplay = () => {
    startRiderAnimation();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.dialog,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Confetti Explosion (shown during initial placed stage) */}
          {currentStage === 'placed' && (
            <View style={styles.confettiContainer} pointerEvents="none">
              {PARTICLES.map((p) => {
                const translateX = confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.cos(p.angle) * p.distance],
                });
                const translateY = confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(p.angle) * p.distance],
                });
                const particleOpacity = confettiAnim.interpolate({
                  inputRange: [0, 0.75, 1],
                  outputRange: [1, 1, 0],
                });
                const particleScale = confettiAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1.25, 0.5],
                });

                return (
                  <Animated.View
                    key={p.id}
                    style={[
                      styles.particle,
                      {
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        transform: [{ translateX }, { translateY }, { scale: particleScale }],
                        opacity: particleOpacity,
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header Badge */}
            <View style={styles.headerIconRow}>
              {currentStage === 'placed' && (
                <Animated.View style={[styles.badgeWrapper, { transform: [{ scale: checkBounceAnim }] }]}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                </Animated.View>
              )}
              {currentStage === 'accepted' && (
                <View style={[styles.checkCircle, { backgroundColor: '#F59E0B' }]}>
                  <Text style={styles.checkIcon}>🎒</Text>
                </View>
              )}
              {currentStage === 'on_the_way' && (
                <View style={[styles.checkCircle, { backgroundColor: '#06B6D4' }]}>
                  <Text style={styles.checkIcon}>🛵</Text>
                </View>
              )}
            </View>

            {/* Dynamic Stage Title & Subtitle */}
            <Text style={styles.title}>
              {currentStage === 'placed' && 'Order Placed!'}
              {currentStage === 'accepted' && 'Order Accepted & Packed!'}
              {currentStage === 'on_the_way' && 'Rider is on the Way!'}
            </Text>

            <Text style={styles.subtitle}>
              {currentStage === 'placed' && 'Routing your cart to the closest dark store...'}
              {currentStage === 'accepted' && `Bags packed at ${order.assigned_store.split(' - ')[0]}`}
              {currentStage === 'on_the_way' && `${order.rider} picked up your bag & is driving to you`}
            </Text>

            {/* Step-by-Step Order Progression Stepper */}
            <View style={styles.stepperContainer}>
              {/* Step 1 */}
              <TouchableOpacity
                onPress={() => setCurrentStage('placed')}
                style={styles.stepItem}
                activeOpacity={0.8}
              >
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                  <Text style={styles.stepCircleText}>✓</Text>
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Order Placed</Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.stepLine,
                  currentStage === 'accepted' || currentStage === 'on_the_way'
                    ? styles.stepLineActive
                    : styles.stepLineInactive,
                ]}
              />

              {/* Step 2 */}
              <TouchableOpacity
                onPress={() => setCurrentStage('accepted')}
                style={styles.stepItem}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.stepCircle,
                    currentStage === 'accepted' || currentStage === 'on_the_way'
                      ? styles.stepCircleActive
                      : styles.stepCirclePending,
                  ]}
                >
                  <Text style={styles.stepCircleText}>
                    {currentStage === 'accepted' || currentStage === 'on_the_way' ? '✓' : '2'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStage === 'accepted' || currentStage === 'on_the_way'
                      ? styles.stepLabelActive
                      : styles.stepLabelPending,
                  ]}
                >
                  Accepted
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.stepLine,
                  currentStage === 'on_the_way' ? styles.stepLineActive : styles.stepLineInactive,
                ]}
              />

              {/* Step 3 */}
              <TouchableOpacity
                onPress={() => {
                  setCurrentStage('on_the_way');
                  startRiderAnimation();
                }}
                style={styles.stepItem}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.stepCircle,
                    currentStage === 'on_the_way' ? styles.stepCircleActive : styles.stepCirclePending,
                  ]}
                >
                  <Text style={styles.stepCircleText}>{currentStage === 'on_the_way' ? '🛵' : '3'}</Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStage === 'on_the_way' ? styles.stepLabelActive : styles.stepLabelPending,
                  ]}
                >
                  On the Way
                </Text>
              </TouchableOpacity>
            </View>

            {/* ============================================================= */}
            {/* LIVE DELIVERY ROUTE MAP & MOVING RIDER (On the Way stage)      */}
            {/* ============================================================= */}
            {currentStage === 'on_the_way' ? (
              <View style={styles.mapCardContainer}>
                {/* Top Badge */}
                <View style={styles.mapHeaderRow}>
                  <View style={styles.mapPulseDot} />
                  <Text style={styles.mapHeaderText}>Live GPS Delivery Route</Text>
                  <TouchableOpacity onPress={handleReplay} style={styles.replayButton}>
                    <Text style={styles.replayText}>🔄 Replay</Text>
                  </TouchableOpacity>
                </View>

                {/* Stylized Vector City Map Canvas */}
                <View style={styles.mapCanvas}>
                  {/* Grid matrix lines */}
                  <View style={[styles.gridLineH, { top: 40 }]} />
                  <View style={[styles.gridLineH, { top: 90 }]} />
                  <View style={[styles.gridLineH, { top: 140 }]} />
                  <View style={[styles.gridLineV, { left: 80 }]} />
                  <View style={[styles.gridLineV, { left: 160 }]} />
                  <View style={[styles.gridLineV, { left: 240 }]} />

                  {/* Waterway / Canal Accent */}
                  <View style={styles.canalStrip} />

                  {/* City Sector Labels */}
                  <Text style={[styles.mapSectorLabel, { bottom: 8, left: 12 }]}>
                    🏬 Dark Store Sector
                  </Text>
                  <Text style={[styles.mapSectorLabel, { top: 8, right: 12 }]}>
                    🏡 Residential Sector
                  </Text>

                  {/* Road Network Segments */}
                  {/* Segment 1: (30, 130) -> (95, 130) */}
                  <View style={[styles.roadH, { left: 30, top: 130, width: 65 }]} />
                  {/* Segment 2: (95, 80) -> (95, 130) */}
                  <View style={[styles.roadV, { left: 95, top: 80, height: 50 }]} />
                  {/* Segment 3: (95, 80) -> (185, 80) */}
                  <View style={[styles.roadH, { left: 95, top: 80, width: 90 }]} />
                  {/* Segment 4: (185, 30) -> (185, 80) */}
                  <View style={[styles.roadV, { left: 185, top: 30, height: 50 }]} />
                  {/* Segment 5: (185, 30) -> (260, 30) */}
                  <View style={[styles.roadH, { left: 185, top: 30, width: 75 }]} />

                  {/* Point A: Dark Store Marker */}
                  <View style={[styles.mapMarker, { left: 15, top: 115 }]}>
                    <View style={styles.hubBeaconRing} />
                    <View style={styles.hubMarkerCore}>
                      <Text style={styles.markerEmoji}>🏬</Text>
                    </View>
                    <Text style={styles.markerTagHub} numberOfLines={1}>
                      HUB
                    </Text>
                  </View>

                  {/* Point B: Customer Destination Marker */}
                  <View style={[styles.mapMarker, { left: 248, top: 15 }]}>
                    <View style={styles.custBeaconRing} />
                    <View style={styles.custMarkerCore}>
                      <Text style={styles.markerEmoji}>🏠</Text>
                    </View>
                    <Text style={styles.markerTagCust}>YOU</Text>
                  </View>

                  {/* ANIMATED DELIVERY RIDER MOVING ALONG ROAD */}
                  <Animated.View
                    style={[
                      styles.riderContainer,
                      {
                        left: riderPosX,
                        top: riderPosY,
                      },
                    ]}
                  >
                    <View style={styles.riderPulseHalo} />
                    <View style={styles.riderVehicleCircle}>
                      <Text style={styles.riderIconEmoji}>🛵</Text>
                    </View>
                    <View style={styles.riderTooltipPill}>
                      <Text style={styles.riderTooltipText}>
                        {order.rider.split(' ')[0]} • MH 20
                      </Text>
                    </View>
                  </Animated.View>
                </View>

                {/* Live Delivery Telemetry Banner */}
                <View style={styles.mapTelemetryRow}>
                  <View>
                    <Text style={styles.telemetryMutedLabel}>ESTIMATED ARRIVAL</Text>
                    <Text style={styles.telemetryEtaText}>
                      {etaRemaining <= 1 ? 'Arriving Now! 🎉' : `~${etaRemaining} Mins`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.telemetryMutedLabel}>ROAD DISTANCE</Text>
                    <Text style={styles.telemetryDistText}>{order.distance_km} km away</Text>
                  </View>
                </View>

                {/* Linear Rider Progress Bar */}
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: riderAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['6%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>

                {/* Rider Profile Card */}
                <View style={styles.riderCard}>
                  <View style={styles.riderCardLeft}>
                    <View style={styles.riderAvatar}>
                      <Text style={{ fontSize: 20 }}>🛵</Text>
                    </View>
                    <View>
                      <View style={styles.riderNameRow}>
                        <Text style={styles.riderNameText}>{order.rider}</Text>
                        <View style={styles.ratingBadge}>
                          <Text style={styles.ratingText}>★ 4.96</Text>
                        </View>
                      </View>
                      <Text style={styles.riderVehicleText}>Bajaj Chetak EV • MH 20 BY 4821</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={handleCallRider} style={styles.callButton} activeOpacity={0.8}>
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Staging & Packaging Details (For Placed & Accepted stages) */
              <View style={styles.stagingCard}>
                <View style={styles.routingRow}>
                  <Text style={styles.routingLabel}>Order ID:</Text>
                  <Text style={styles.routingValueBold}>#{order.order_id}</Text>
                </View>
                <View style={styles.routingRow}>
                  <Text style={styles.routingLabel}>Fulfillment Hub:</Text>
                  <Text style={styles.routingValueBold} numberOfLines={1}>
                    {order.assigned_store}
                  </Text>
                </View>
                <View style={styles.routingRow}>
                  <Text style={styles.routingLabel}>Distance:</Text>
                  <Text style={styles.routingValueGreen}>{order.distance_km} km (Fast Haversine)</Text>
                </View>
                <View style={styles.routingRow}>
                  <Text style={styles.routingLabel}>Assigned Fleet:</Text>
                  <Text style={styles.routingValue}>{order.rider}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setCurrentStage('on_the_way');
                    startRiderAnimation();
                  }}
                  style={styles.viewRouteFastBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewRouteFastText}>🗺️ View Live Rider Route ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Close / Done Button */}
            <TouchableOpacity style={styles.primaryButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>
                {currentStage === 'on_the_way' ? 'Continue Shopping 🛍️' : 'Done'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  dialog: {
    width: Math.min(width - 24, 430),
    maxHeight: height * 0.88,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: SPACING.sm,
  },
  confettiContainer: {
    position: 'absolute',
    top: 50,
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    borderRadius: 3,
  },
  headerIconRow: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  badgeWrapper: {
    alignItems: 'center',
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },

  /* Stepper */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: COLORS.brandGreen,
  },
  stepCirclePending: {
    backgroundColor: '#E2E8F0',
  },
  stepCircleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: COLORS.brandGreen,
  },
  stepLabelPending: {
    color: COLORS.textSecondary,
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: COLORS.brandGreen,
  },
  stepLineInactive: {
    backgroundColor: '#E2E8F0',
  },

  /* Live Map Card */
  mapCardContainer: {
    width: '100%',
    backgroundColor: '#090D16',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  mapPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  mapHeaderText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  replayButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  replayText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Vector Map Canvas (300 x 160) */
  mapCanvas: {
    width: '100%',
    height: 165,
    backgroundColor: '#060A12',
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1E293B',
    opacity: 0.4,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#1E293B',
    opacity: 0.4,
  },
  canalStrip: {
    position: 'absolute',
    top: 55,
    left: -20,
    right: -20,
    height: 22,
    backgroundColor: '#071F36',
    transform: [{ rotate: '-8deg' }],
    opacity: 0.5,
  },
  mapSectorLabel: {
    position: 'absolute',
    color: '#475569',
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  /* Road Line Segments */
  roadH: {
    position: 'absolute',
    height: 5,
    backgroundColor: '#10B981',
    borderRadius: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },
  roadV: {
    position: 'absolute',
    width: 5,
    backgroundColor: '#10B981',
    borderRadius: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },

  /* Map Markers */
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  hubBeaconRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  hubMarkerCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  custBeaconRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  custMarkerCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#082F49',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerEmoji: {
    fontSize: 11,
  },
  markerTagHub: {
    position: 'absolute',
    bottom: -12,
    fontSize: 7.5,
    fontWeight: '900',
    color: '#10B981',
  },
  markerTagCust: {
    position: 'absolute',
    bottom: -12,
    fontSize: 7.5,
    fontWeight: '900',
    color: '#38BDF8',
  },

  /* Moving Rider Element */
  riderContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    zIndex: 100,
  },
  riderPulseHalo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  riderVehicleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderIconEmoji: {
    fontSize: 13,
  },
  riderTooltipPill: {
    position: 'absolute',
    top: -16,
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  riderTooltipText: {
    color: '#34D399',
    fontSize: 7.5,
    fontWeight: '800',
  },

  /* Telemetry Row */
  mapTelemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: 4,
  },
  telemetryMutedLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },
  telemetryEtaText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 1,
  },
  telemetryDistText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },

  /* Progress Bar */
  progressBarBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 99,
  },

  /* Rider Card */
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  riderCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  riderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderNameText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginRight: 6,
  },
  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  riderVehicleText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  callButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  callButtonText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Staging Card (Placed/Accepted stages) */
  stagingCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  routingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  routingLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  routingValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  routingValueBold: {
    fontSize: 12.5,
    color: COLORS.textPrimary,
    fontWeight: '800',
    maxWidth: '60%',
    textAlign: 'right',
  },
  routingValueGreen: {
    fontSize: 12.5,
    color: COLORS.brandGreen,
    fontWeight: '800',
  },
  viewRouteFastBtn: {
    marginTop: SPACING.md,
    paddingVertical: 9,
    backgroundColor: COLORS.brandGreen,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  viewRouteFastText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Primary Button */
  primaryButton: {
    backgroundColor: COLORS.brandGreen,
    width: '100%',
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
