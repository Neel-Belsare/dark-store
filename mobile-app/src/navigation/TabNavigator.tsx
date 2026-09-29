import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RiderScreen } from '../screens/RiderScreen';
import { useCart } from '../context/CartContext';
import { TabName } from '../types';

export const TabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const { totalItemCount } = useCart();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen onNavigateToCart={() => setActiveTab('Cart')} />;
      case 'Cart':
        return <CartScreen onNavigateToHome={() => setActiveTab('Home')} />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Rider':
        return <RiderScreen />;
      default:
        return <HomeScreen onNavigateToCart={() => setActiveTab('Cart')} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Active Screen View */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Sleek Blinkit Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('Home')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, activeTab === 'Home' && styles.iconWrapperActive]}>
            <Text style={[styles.tabIcon, activeTab === 'Home' && styles.tabIconActive]}>🏠</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Cart with Badge */}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('Cart')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, activeTab === 'Cart' && styles.iconWrapperActive]}>
            <Text style={[styles.tabIcon, activeTab === 'Cart' && styles.tabIconActive]}>🛒</Text>
            {totalItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItemCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'Cart' && styles.tabLabelActive]}>
            Cart
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Profile */}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('Profile')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, activeTab === 'Profile' && styles.iconWrapperActive]}>
            <Text style={[styles.tabIcon, activeTab === 'Profile' && styles.tabIconActive]}>👤</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Rider Partner Mode */}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab('Rider')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, activeTab === 'Rider' && styles.iconWrapperActive]}>
            <Text style={[styles.tabIcon, activeTab === 'Rider' && styles.tabIconActive]}>🛵</Text>
            <View style={styles.riderLiveDot} />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'Rider' && styles.tabLabelActive]}>
            Rider
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.stickyFooter,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.brandGreenLight,
  },
  tabIcon: {
    fontSize: 19,
    opacity: 0.65,
  },
  tabIconActive: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: COLORS.brandGreen,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  riderLiveDot: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.brandGreen,
    fontWeight: '800',
  },
});
