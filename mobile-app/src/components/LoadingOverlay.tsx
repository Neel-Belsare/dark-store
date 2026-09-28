import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Finding your nearest dark store...',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Pulse animation loop
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Radar rotation loop
      const rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      pulseLoop.start();
      rotateLoop.start();

      return () => {
        pulseLoop.stop();
        rotateLoop.stop();
      };
    }
  }, [visible]);

  if (!visible) return null;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Animated Radar Pulse Effect */}
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.innerCircle}>
              <Animated.Text style={[styles.radarIcon, { transform: [{ rotate: spin }] }]}>
                🧭
              </Animated.Text>
            </View>
          </Animated.View>

          <ActivityIndicator size="small" color={COLORS.brandGreen} style={styles.spinner} />

          <Text style={styles.title}>{message}</Text>
          <Text style={styles.subtext}>
            Executing Haversine catchment routing across Chhatrapati Sambhajinagar hubs...
          </Text>

          <View style={styles.stepContainer}>
            <View style={styles.stepRow}>
              <Text style={styles.stepCheck}>✓</Text>
              <Text style={styles.stepText}>GPS coordinates locked</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepCheck}>✓</Text>
              <Text style={styles.stepText}>Calculating nearest fulfillment radius</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepCheckActive}>⚡</Text>
              <Text style={styles.stepTextActive}>Assigning delivery rider fleet</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.modal,
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brandGreenLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    marginBottom: SPACING.md,
  },
  innerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.brandGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarIcon: {
    fontSize: 26,
  },
  spinner: {
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  stepContainer: {
    width: '100%',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  stepCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.brandGreen,
    marginRight: SPACING.sm,
    width: 14,
  },
  stepText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  stepCheckActive: {
    fontSize: 12,
    color: COLORS.warningAmber,
    marginRight: SPACING.sm,
    width: 14,
  },
  stepTextActive: {
    fontSize: 11.5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
