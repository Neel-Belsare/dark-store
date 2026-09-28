import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
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
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        {selectedCategory && (
          <TouchableOpacity onPress={() => onSelectCategory(null)}>
            <Text style={styles.clearFilterText}>Show All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        {MOCK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.title;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onSelectCategory(isSelected ? null : cat.title)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                <Text style={styles.iconText}>{cat.icon}</Text>
              </View>
              <Text style={[styles.catTitle, isSelected && styles.catTitleSelected]} numberOfLines={2}>
                {cat.title}
              </Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.brandGreen,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardSelected: {
    borderColor: COLORS.brandGreen,
    backgroundColor: COLORS.brandGreenLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconBoxSelected: {
    backgroundColor: '#DCFCE7',
  },
  iconText: {
    fontSize: 22,
  },
  catTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  catTitleSelected: {
    color: COLORS.brandGreenDark,
  },
});
