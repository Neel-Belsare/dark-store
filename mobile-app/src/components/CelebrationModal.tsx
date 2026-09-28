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
import { COLORS } from '../constants/theme';
import { DispatchedOrder } from '../types';

const { width } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  order: DispatchedOrder | null;
  onClose: () => void;
}

// Generate deterministic confetti particle positions
const CONFETTI_COLORS = ['#F7D435', '#0C831F', '#6366F1', '#EC4899', '#06B6D4', '#F59E0B'];
const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  angle: (i / 18) * 2 * Math.PI,
  distance: 70 + (i % 4) * 25,
  size: 6 + (i % 3) * 3,
}));

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  order,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);

      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!order) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
          
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
                inputRange: [0, 0.7, 1],
                outputRange: [1, 1, 0],
              });
              const particleScale = confettiAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.4, 1.2, 0.6],
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

          {/* Success Check Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>

          {/* Order Title */}
          <Text style={styles.title}>Order Dispatched!</Text>
          <Text style={styles.orderSubtitle}>
            Order #{order.order_id} • ₹{order.order_val}
          </Text>

          {/* SLA Banner */}
          <View style={styles.slaBadge}>
            <Text style={styles.slaLightning}>⚡</Text>
            <Text style={styles.slaText}>Arriving in {order.eta_mins} minutes</Text>
          </View>

          {/* Telemetry Summary Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned Hub:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{order.assigned_store}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Road Distance:</Text>
              <Text style={styles.detailValueGreen}>{order.distance_km} km away</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Fleet:</Text>
              <Text style={styles.detailValue}>{order.rider}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Address:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{order.delivery_address || 'Aurangabad'}</Text>
            </View>
          </View>

          {/* Streamlit Sync Indicator */}
          <View style={styles.syncBanner}>
            <View style={styles.pulseDot} />
            <Text style={styles.syncText}>
              Telemetry live on Streamlit Command Center
            </Text>
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>View Order Status</Text>
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
    padding: 24,
  },
  dialog: {
    width: width - 48,
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
  badgeWrapper: {
    marginBottom: 14,
    marginTop: 4,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: -2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  orderSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 14,
  },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9D2',
    borderWidth: 1,
    borderColor: '#F3E58D',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
  },
  slaLightning: {
    fontSize: 15,
    marginRight: 6,
  },
  slaText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#7A5B00',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12.5,
    color: COLORS.textPrimary,
    fontWeight: '700',
    maxWidth: '58%',
    textAlign: 'right',
  },
  detailValueGreen: {
    fontSize: 12.5,
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accentIndigo,
    marginRight: 7,
  },
  syncText: {
    fontSize: 11,
    color: COLORS.accentIndigo,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: COLORS.primaryGreen,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
