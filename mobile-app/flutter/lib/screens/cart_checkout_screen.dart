import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../providers/location_provider.dart';
import 'rider_mode_screen.dart';

class CartCheckoutScreen extends StatefulWidget {
  const CartCheckoutScreen({super.key});

  @override
  State<CartCheckoutScreen> createState() => _CartCheckoutScreenState();
}

class _CartCheckoutScreenState extends State<CartCheckoutScreen> {
  bool _isCheckingOut = false;

  void _handlePlaceOrder() async {
    setState(() => _isCheckingOut = true);

    final cart = context.read<CartProvider>();
    final loc = context.read<LocationProvider>();

    final success = await cart.checkoutToSupabase(
      custLat: loc.latitude,
      custLon: loc.longitude,
      address: loc.address,
    );

    setState(() => _isCheckingOut = false);

    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Text('🎉', style: TextStyle(fontSize: 24)),
              SizedBox(width: 8),
              Text(
                'Order Dispatched!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Your quick-commerce order has been matched to the nearest dark store hub:',
                style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.brandLavenderLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.brandLavender),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🏬 Assigned Hub: CIDCO Dark Store #04',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '🛵 Courier Partner: Rahul Shinde (EV Bike)',
                      style: TextStyle(fontSize: 11.5, color: AppTheme.textSecondary),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '⏱️ Guaranteed SLA: 11 Minutes',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.brandLavenderDark,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx); // Close dialog
                Navigator.pop(context); // Go back home
              },
              child: const Text('Back to Store'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.darkSlate,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const RiderModeScreen()),
                );
              },
              child: const Text('Track Rider Mode ➔'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final loc = context.watch<LocationProvider>();
    final catalog = ProductCatalog.sampleProducts;

    if (cart.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Your Cart')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.shopping_cart_outlined, size: 70, color: AppTheme.textMuted),
              const SizedBox(height: 16),
              const Text(
                'Your cart is empty',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Add items from catalog to start 10-min delivery!',
                style: TextStyle(color: AppTheme.textMuted),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.darkSlate,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => Navigator.pop(context),
                child: const Text('Start Shopping'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Order & Checkout'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Delivery Address Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.brandLavenderLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.location_on, color: AppTheme.brandLavenderDark),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Delivering to Doorstep',
                          style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                        Text(
                          loc.address,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Free Delivery Progress Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: cart.deliveryFee == 0 ? const Color(0xFFECFDF5) : AppTheme.brandChampagneLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: cart.deliveryFee == 0 ? AppTheme.successEmerald : AppTheme.brandChampagne,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        cart.deliveryFee == 0 ? Icons.check_circle : Icons.delivery_dining,
                        color: cart.deliveryFee == 0 ? AppTheme.successEmerald : AppTheme.textPrimary,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        cart.deliveryFee == 0
                            ? 'Free Delivery unlocked! 🎉'
                            : 'Add items worth ₹${cart.freeDeliveryRemaining.toInt()} for FREE delivery',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: cart.deliveryFee == 0 ? AppTheme.successEmerald : AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: cart.freeDeliveryProgress,
                      backgroundColor: Colors.white,
                      color: cart.deliveryFee == 0 ? AppTheme.successEmerald : AppTheme.brandLavender,
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Items List
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Review Items',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                  const Divider(height: 20),
                  ...cart.items.entries.map((entry) {
                    final product = catalog.firstWhere((p) => p.id == entry.key);
                    final qty = entry.value;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              product.imageUrl,
                              width: 44,
                              height: 44,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product.title,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Text(
                                  '₹${product.price.toInt()} each',
                                  style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                ),
                              ],
                            ),
                          ),

                          // + - controls
                          Container(
                            decoration: BoxDecoration(
                              color: AppTheme.brandLavenderLight,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                InkWell(
                                  onTap: () => cart.removeItem(product.id),
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Icon(Icons.remove, size: 16, color: AppTheme.brandLavenderDark),
                                  ),
                                ),
                                Text(
                                  '$qty',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.brandLavenderDark,
                                  ),
                                ),
                                InkWell(
                                  onTap: () => cart.addItem(product),
                                  child: const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                    child: Icon(Icons.add, size: 16, color: AppTheme.brandLavenderDark),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Bill Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bill Details', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  const Divider(height: 20),
                  _buildBillRow('Item Total', '₹${cart.subtotal.toInt()}'),
                  _buildBillRow(
                    'Delivery Partner Fee',
                    cart.deliveryFee == 0 ? 'FREE' : '₹${cart.deliveryFee.toInt()}',
                    isGreen: cart.deliveryFee == 0,
                  ),
                  _buildBillRow('Handling Fee', '₹${cart.handlingFee.toInt()}'),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Text(
                        'To Pay',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                      ),
                      Text(
                        '₹${cart.grandTotal.toInt()}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 1-Tap Place Order Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.darkSlate,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                ),
                onPressed: _isCheckingOut ? null : _handlePlaceOrder,
                child: _isCheckingOut
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Place Order • Sub-12 Min SLA',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '(₹${cart.grandTotal.toInt()})',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFFB5AFF6)),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBillRow(String label, String value, {bool isGreen = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(label, style: const TextStyle(fontSize: 12.5, color: AppTheme.textSecondary)),
          Text(
            value,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.bold,
              color: isGreen ? AppTheme.successEmerald : AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
