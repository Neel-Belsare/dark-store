import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DispatchedOrder } from '../types';

const { width } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  order: DispatchedOrder | null;
  onClose: () => void;
}

// Generate animated confetti particles
const CONFETTI_COLORS = ['#F7D435', '#0C831F', '#6366F1', '#EC4899', '#06B6D4', '#F59E0B'];
const PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  angle: (i / 20) * 2 * Math.PI,
  distance: 75 + (i % 4) * 24,
  size: 6 + (i % 3) * 3,
}));

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  order,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const checkBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7);
      slideAnim.setValue(60);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);
      checkBounceAnim.setValue(0);

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
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(180),
          Animated.spring(checkBounceAnim, {
            toValue: 1,
            friction: 4,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!order) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.dialog,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Confetti Explosion Burst */}
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

          {/* Bouncing Success Check Badge */}
          <Animated.View
            style={[
              styles.badgeWrapper,
              { transform: [{ scale: checkBounceAnim }] },
            ]}
          >
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </Animated.View>

          {/* User Requested Celebratory Message */}
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.packingMessage}>
            Your dark store is packing your bags 🎒
          </Text>

          {/* ETA Pill */}
          <View style={styles.slaBadge}>
            <Text style={styles.slaLightning}>⚡</Text>
            <Text style={styles.slaText}>Delivering in {order.eta_mins} minutes</Text>
          </View>

          {/* Real-Time Routing Summary */}
          <View style={styles.routingCard}>
            <View style={styles.routingRow}>
              <Text style={styles.routingLabel}>Order ID:</Text>
              <Text style={styles.routingValueBold}>#{order.order_id}</Text>
            </View>
            <View style={styles.routingRow}>
              <Text style={styles.routingLabel}>Assigned Hub:</Text>
              <Text style={styles.routingValueBold} numberOfLines={1}>{order.assigned_store}</Text>
            </View>
            <View style={styles.routingRow}>
              <Text style={styles.routingLabel}>Road Distance:</Text>
              <Text style={styles.routingValueGreen}>{order.distance_km} km away</Text>
            </View>
            <View style={styles.routingRow}>
              <Text style={styles.routingLabel}>Assigned Fleet:</Text>
              <Text style={styles.routingValue}>{order.rider}</Text>
            </View>
          </View>

          {/* Streamlit Command Center Live Sync Callout */}
          <View style={styles.syncBanner}>
            <View style={styles.pulseDot} />
            <Text style={styles.syncText}>
              Live 3D Telemetry active in Streamlit Command Center
            </Text>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Track Live Telemetry</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialog: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  confettiContainer: {
    position: 'absolute',
    top: 55,
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
  badgeWrapper: {
    marginBottom: SPACING.md,
  },
  checkCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
    marginTop: -2,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  packingMessage: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandYellowLight,
    borderWidth: 1,
    borderColor: '#F3E58D',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  slaLightning: {
    fontSize: 14,
    marginRight: 6,
  },
  slaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7A5B00',
  },
  routingCard: {
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
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    marginBottom: SPACING.lg,
    width: '100%',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentIndigo,
    marginRight: 6,
  },
  syncText: {
    fontSize: 11,
    color: COLORS.accentIndigo,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.brandGreen,
    width: '100%',
    paddingVertical: 14,
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
    fontSize: 15,
    fontWeight: '800',
  },
});
