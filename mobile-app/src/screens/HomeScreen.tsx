import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { LocationBar } from '../components/LocationBar';
import { SearchBar } from '../components/SearchBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export const POPULAR_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Amul Taaza Toned Fresh Milk',
    price: 27,
    unit: '500 ml pouch',
    emoji: '🥛',
    category: 'Dairy & Breakfast',
    mrp: 30,
    deliveryMins: 8,
    stock: 12,
    lowStockThreshold: 4,
  },
  {
    id: 'prod-2',
    name: 'Britannia 100% Whole Wheat Bread',
    price: 45,
    unit: '400 g pack',
    emoji: '🍞',
    category: 'Dairy & Breakfast',
    mrp: 50,
    deliveryMins: 10,
    stock: 2,
    lowStockThreshold: 3,
  },
  {
    id: 'prod-3',
    name: "Lay's India's Magic Masala Chips",
    price: 20,
    unit: '50 g pouch',
    emoji: '🥔',
    category: 'Munchies & Snacks',
    mrp: 20,
    deliveryMins: 8,
    stock: 15,
    lowStockThreshold: 5,
  },
  {
    id: 'prod-4',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    price: 145,
    unit: '1 Litre pouch',
    emoji: '🌻',
    category: 'Atta, Rice & Dal',
    mrp: 170,
    deliveryMins: 12,
    stock: 1,
    lowStockThreshold: 2,
  },
  {
    id: 'prod-5',
    name: 'Coca-Cola Zero Sugar Can',
    price: 40,
    unit: '300 ml can',
    emoji: '🥤',
    category: 'Cold Drinks',
    mrp: 40,
    deliveryMins: 8,
    stock: 6,
    lowStockThreshold: 3,
  },
  {
    id: 'prod-6',
    name: 'Maggi 2-Minute Masala Instant Noodles',
    price: 14,
    unit: '70 g pack',
    emoji: '🍜',
    category: 'Instant Food',
    mrp: 14,
    deliveryMins: 8,
    stock: 20,
    lowStockThreshold: 5,
  },
  {
    id: 'prod-7',
    name: 'Fresh Farm Spinach (Palak)',
    price: 25,
    unit: '250 g bunch',
    emoji: '🥦',
    category: 'Fresh Vegetables',
    mrp: 35,
    deliveryMins: 10,
    stock: 3,
    lowStockThreshold: 4,
  },
];

interface HomeScreenProps {
  onNavigateToCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToCart }) => {
  const {
    location,
    address,
    loading: locationLoading,
    isUsingGPS,
    fetchLiveGPS,
    setManualLocation,
    neighborhoodOptions,
  } = useCurrentLocation();

  const { totalItemCount, grandTotal } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return POPULAR_PRODUCTS.filter((prod) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || prod.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Sticky Location + Search Top Surface */}
      <View style={styles.stickyHeader}>
        <LocationBar
          location={location}
          address={address}
          isUsingGPS={isUsingGPS}
          loading={locationLoading}
          onRefreshGPS={fetchLiveGPS}
          onSelectOption={setManualLocation}
          options={neighborhoodOptions}
        />
        <SearchBar query={searchQuery} onChangeQuery={setSearchQuery} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeIcon}>⚡</Text>
              <Text style={styles.heroBadgeText}>10 MINUTES DISPATCH</Text>
            </View>
            <Text style={styles.heroTitle}>Smart Quick Delivery</Text>
            <Text style={styles.heroSubtitle}>
              Fresh groceries & dark store inventory delivered in minutes
            </Text>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroEmoji}>📦</Text>
          </View>
        </View>

        {/* Categories Section */}
        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Popular Groceries Grid */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {selectedCategory ? selectedCategory : 'Popular Essentials'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {filteredProducts.length} items in stock
              </Text>
            </View>

            {selectedCategory && (
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalProducts}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>

          {filteredProducts.length === 0 && (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No matching groceries found</Text>
              <Text style={styles.emptySub}>Try searching for "milk", "bread", or "chips"</Text>
            </View>
          )}
        </View>

        {/* Quick-Commerce Value Props */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.featureIcon}>⚡</Text>
            </View>
            <Text style={styles.featureTitle}>Sub-15m Promise</Text>
            <Text style={styles.featureSub}>Dedicated courier dispatch</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Text style={styles.featureIcon}>🛡️</Text>
            </View>
            <Text style={styles.featureTitle}>Zero Delivery Fee</Text>
            <Text style={styles.featureSub}>Instant savings on all carts</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIconBox, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.featureIcon}>🏬</Text>
            </View>
            <Text style={styles.featureTitle}>12 City Hubs</Text>
            <Text style={styles.featureSub}>Real-time stock matching</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Mini-Cart Bar */}
      {totalItemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.floatingCart,
              pressed && styles.floatingCartPressed,
            ]}
            onPress={onNavigateToCart}
          >
            <View style={styles.cartInfoLeft}>
              <View style={styles.cartBadgePill}>
                <Text style={styles.cartItemsCount}>
                  🛒 {totalItemCount} {totalItemCount === 1 ? 'ITEM' : 'ITEMS'}
                </Text>
              </View>
              <Text style={styles.cartTotalPrice}>₹{grandTotal}</Text>
              <Text style={styles.cartSavedNotice}>Free Delivery Applied</Text>
            </View>

            <View style={styles.cartActionRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Text style={styles.viewCartArrow}>➔</Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stickyHeader: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    zIndex: 10,
    ...SHADOWS.small,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4E2298',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#6D28D9',
    ...SHADOWS.card,
  },
  heroLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.xs + 2,
    marginBottom: 6,
  },
  heroBadgeIcon: {
    fontSize: 9,
    marginRight: 3,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.footnote,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 16,
  },
  heroRight: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 26,
  },
  productsSection: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.footnote,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sub,
    fontWeight: '800',
    color: '#4E2298',
  },
  horizontalProducts: {
    paddingRight: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  emptySearch: {
    paddingVertical: SPACING.xxl,
    paddingRight: SPACING.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: TYPOGRAPHY.sub,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.small,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  featureSub: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 50,
  },
  floatingCart: {
    backgroundColor: '#4E2298',
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    shadowColor: '#4E2298',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  floatingCartPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  cartInfoLeft: {
    flexDirection: 'column',
  },
  cartBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: 2,
  },
  cartItemsCount: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cartTotalPrice: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
  },
  cartSavedNotice: {
    color: '#E0E7FF',
    fontSize: 9.5,
    fontWeight: '600',
  },
  cartActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCartText: {
    color: '#4E2298',
    fontSize: 13,
    fontWeight: '900',
    marginRight: 6,
  },
  viewCartArrow: {
    color: '#4E2298',
    fontSize: 13,
    fontWeight: '900',
  },
});