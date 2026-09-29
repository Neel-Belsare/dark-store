import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/rider_provider.dart';
import '../widgets/road_navigation_map.dart';

class RiderModeScreen extends StatelessWidget {
  const RiderModeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final rider = context.watch<RiderProvider>();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.two_wheeler, size: 20, color: AppTheme.brandLavender),
            SizedBox(width: 8),
            Text('Rider Partner HUD'),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.successEmerald.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.successEmerald),
            ),
            child: const Row(
              children: [
                CircleAvatar(radius: 3, backgroundColor: AppTheme.successEmerald),
                SizedBox(width: 5),
                Text(
                  'ONLINE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.successEmerald,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order ID & Hub Header Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Active Task #ORD-84920',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.store, size: 14, color: AppTheme.textMuted),
                          const SizedBox(width: 4),
                          const Text(
                            'CIDCO Dark Store Hub #04',
                            style: TextStyle(fontSize: 11.5, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppTheme.brandChampagne,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      '⚡ 11 Mins ETA',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 4-Stage Stepper
            _buildStepper(rider.status),
            const SizedBox(height: 16),

            // Live Road Map Box
            const Text(
              'Live Road Navigation (OSRM Street Network)',
              style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const SizedBox(
              height: 250,
              width: double.infinity,
              child: RoadNavigationMap(),
            ),
            const SizedBox(height: 16),

            // Customer Contact & Delivery Notes Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Customer Details', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Neel Belsare', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                          Text('CIDCO Sector N-2, Aurangabad', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                        ],
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.phone, color: AppTheme.brandLavenderDark),
                        style: IconButton.styleFrom(
                          backgroundColor: AppTheme.brandLavenderLight,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  const Text(
                    '📝 Delivery Note: Ring doorbell and leave packet at doorstep.',
                    style: TextStyle(fontSize: 11.5, color: AppTheme.textSecondary, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Stepper Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: rider.status == RiderStatus.delivered
                      ? AppTheme.successEmerald
                      : AppTheme.darkSlate,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () => rider.advanceStage(),
                child: Text(
                  _getButtonLabel(rider.status),
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepper(RiderStatus current) {
    final stages = [
      {'title': 'Accepted', 'status': RiderStatus.accepted},
      {'title': 'Pick & Pack', 'status': RiderStatus.picking},
      {'title': 'In Transit', 'status': RiderStatus.inTransit},
      {'title': 'Delivered', 'status': RiderStatus.delivered},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: stages.asMap().entries.map((entry) {
          final idx = entry.key;
          final item = entry.value;
          final isPastOrCurrent = current.index >= (item['status'] as RiderStatus).index;

          return Expanded(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: isPastOrCurrent ? AppTheme.brandLavender : AppTheme.surfaceMuted,
                  child: Icon(
                    isPastOrCurrent ? Icons.check : Icons.circle,
                    size: 12,
                    color: isPastOrCurrent ? Colors.white : AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item['title'] as String,
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: isPastOrCurrent ? FontWeight.bold : FontWeight.normal,
                    color: isPastOrCurrent ? AppTheme.textPrimary : AppTheme.textMuted,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  String _getButtonLabel(RiderStatus status) {
    switch (status) {
      case RiderStatus.accepted:
        return 'Start Picking at Hub ➔';
      case RiderStatus.picking:
        return 'Pack & Depart on Bike ➔';
      case RiderStatus.inTransit:
        return 'Mark Order as Delivered ✓';
      case RiderStatus.delivered:
        return 'Order Completed (Reset Demo)';
    }
  }
}
