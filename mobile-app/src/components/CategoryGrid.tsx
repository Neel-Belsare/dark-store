import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { Category } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', title: 'Fresh Vegetables', icon: '🥦', itemCount: 42 },
  { id: 'cat-2', title: 'Dairy & Breakfast', icon: '🥛', itemCount: 38 },
  { id: 'cat-3', title: 'Munchies & Snacks', icon: '🥔', itemCount: 56 },
  { id: 'cat-4', title: 'Cold Drinks', icon: '🥤', itemCount: 29 },
  { id: 'cat-5', title: 'Instant Food', icon: '🍜', itemCount: 34 },
  { id: 'cat-6', title: 'Atta, Rice & Dal', icon: '🌾', itemCount: 45 },
];

interface CategoryGridProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryTitle: string | null) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Header with Clear Option */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <Text style={styles.sectionSubtitle}>Handpicked from nearest micro-fulfillment center</Text>
        </View>

        {selectedCategory && (
          <TouchableOpacity
            style={styles.clearFilterBadge}
            onPress={() => onSelectCategory(null)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearFilterText}>Show All ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Uniform 3-Column Grid Layout */}
      <View style={styles.grid}>
        {MOCK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.title;

          return (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}
              onPress={() => onSelectCategory(isSelected ? null : cat.title)}
            >
              {/* Category Icon Squircle Container */}
              <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                <Text style={styles.iconText}>{cat.icon}</Text>
              </View>

              {/* Title & Item Count */}
              <Text
                style={[styles.catTitle, isSelected && styles.catTitleSelected]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {cat.title}
              </Text>

              {isSelected && <View style={styles.selectedIndicatorDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitleGroup: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.subtitle,
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
  clearFilterBadge: {
    backgroundColor: COLORS.brandGreenLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.brandGreenBorder,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.brandGreen,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.md,
  },
  card: {
    width: '31.2%',
    minHeight: 106,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderSubtle,
    position: 'relative',
    ...SHADOWS.small,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.brandGreenLight,
    ...SHADOWS.cardHover,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBoxSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: COLORS.brandGreenBorder,
  },
  iconText: {
    fontSize: 24,
  },
  catTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 15,
  },
  catTitleSelected: {
    color: COLORS.brandGreenDark,
    fontWeight: '800',
  },
  selectedIndicatorDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.brandGreen,
  },
});
