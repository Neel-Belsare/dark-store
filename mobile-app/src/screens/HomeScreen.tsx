import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
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

  // Filter products by category and search query
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
      {/* 1. Sticky Location Header Bar */}
      <LocationBar
        location={location}
        address={address}
        isUsingGPS={isUsingGPS}
        loading={locationLoading}
        onRefreshGPS={fetchLiveGPS}
        onSelectOption={setManualLocation}
        options={neighborhoodOptions}
      />

      {/* 2. Grocery Search Input */}
      <SearchBar query={searchQuery} onChangeQuery={setSearchQuery} />

      {/* 3. Scrollable Storefront Body */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub-15 Min SLA Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ 10 MINUTES DELIVERY</Text>
          </View>
          <Text style={styles.heroTitle}>Groceries Delivered at Light Speed</Text>
          <Text style={styles.heroSubtitle}>
            From nearest dark store in Chhatrapati Sambhajinagar
          </Text>
        </View>

        {/* Categories Grid */}
        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Popular Products Horizontal Scroller */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${selectedCategory}` : 'Popular Items'}
            </Text>
            <Text style={styles.seeAllText}>
              {filteredProducts.length} items
            </Text>
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
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Sub-15m Promise</Text>
            <Text style={styles.featureSub}>Dedicated courier dispatch</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Zero Delivery Fee</Text>
            <Text style={styles.featureSub}>Instant savings on all carts</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏬</Text>
            <Text style={styles.featureTitle}>12 City Hubs</Text>
            <Text style={styles.featureSub}>Real-time stock matching</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Mini-Cart Bar */}
      {totalItemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCart}
            onPress={onNavigateToCart}
            activeOpacity={0.88}
          >
            <View style={styles.cartInfoLeft}>
              <Text style={styles.cartItemsCount}>
                🛒 {totalItemCount} {totalItemCount === 1 ? 'ITEM' : 'ITEMS'}
              </Text>
              <Text style={styles.cartTotalPrice}>₹{grandTotal}</Text>
            </View>

            <View style={styles.cartActionRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Text style={styles.viewCartArrow}>➔</Text>
            </View>
          </TouchableOpacity>
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroBanner: {
    backgroundColor: COLORS.brandYellow,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#F6E05E',
    ...SHADOWS.small,
  },
  heroBadge: {
    backgroundColor: COLORS.brandGreen,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: '#554200',
    fontWeight: '600',
    marginTop: 2,
  },
  productsSection: {
    marginTop: SPACING.xs,
    paddingLeft: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  horizontalProducts: {
    paddingRight: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  emptySearch: {
    paddingVertical: SPACING.xl,
    paddingRight: SPACING.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureItem: {
    alignItems: 'center',
    width: '32%',
  },
  featureIcon: {
    fontSize: 20,
    marginBottom: 4,
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
    marginTop: 1,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  floatingCart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cartInfoLeft: {
    flexDirection: 'column',
  },
  cartItemsCount: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DCFCE7',
    letterSpacing: 0.5,
  },
  cartTotalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  cartActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    marginRight: 6,
  },
  viewCartArrow: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
