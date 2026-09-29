import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../widgets/blinkit_header.dart';
import '../widgets/product_card.dart';
import 'cart_checkout_screen.dart';
import 'rider_mode_screen.dart';

class HomeCatalogScreen extends StatefulWidget {
  const HomeCatalogScreen({super.key});

  @override
  State<HomeCatalogScreen> createState() => _HomeCatalogScreenState();
}

class _HomeCatalogScreenState extends State<HomeCatalogScreen> {
  String _selectedCategory = 'All';

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final allProducts = ProductCatalog.sampleProducts;
    final filteredProducts = _selectedCategory == 'All'
        ? allProducts
        : allProducts.where((p) => p.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Top Blinkit Header
                BlinkitHeader(
                  onToggleRiderMode: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RiderModeScreen()),
                    );
                  },
                ),

                // Horizontal Category Filter Pills
                Container(
                  height: 44,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: ProductCatalog.categories.length,
                    itemBuilder: (context, index) {
                      final category = ProductCatalog.categories[index];
                      final isSelected = category == _selectedCategory;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(category),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _selectedCategory = category);
                            }
                          },
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? Colors.white : AppTheme.textSecondary,
                          ),
                          selectedColor: AppTheme.brandLavenderDark,
                          backgroundColor: AppTheme.surface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(
                              color: isSelected ? AppTheme.brandLavender : AppTheme.border,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Product Grid
                Expanded(
                  child: GridView.builder(
                    padding: EdgeInsets.fromLTRB(16, 4, 16, cart.totalItemCount > 0 ? 90 : 20),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      return ProductCard(product: filteredProducts[index]);
                    },
                  ),
                ),
              ],
            ),

            // Floating Bottom Cart Bar
            if (cart.totalItemCount > 0)
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const CartCheckoutScreen()),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppTheme.darkSlate,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 10,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        // Left item count & total
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '${cart.totalItemCount} ${cart.totalItemCount == 1 ? 'ITEM' : 'ITEMS'}',
                              style: const TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFB5AFF6),
                              ),
                            ),
                            Text(
                              '₹${cart.grandTotal.toInt()}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),

                        // Right CTA
                        const Row(
                          children: [
                            Text(
                              'View Cart',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
