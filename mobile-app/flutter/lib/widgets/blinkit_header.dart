import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/location_provider.dart';

class BlinkitHeader extends StatelessWidget {
  final VoidCallback onToggleRiderMode;
  final bool isRiderModeActive;

  const BlinkitHeader({
    super.key,
    required this.onToggleRiderMode,
    this.isRiderModeActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final location = context.watch<LocationProvider>();

    return Container(
      color: AppTheme.surface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              // Fast Delivery Time Badge & Location
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppTheme.blinkitYellow,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.bolt, size: 16, color: AppTheme.textPrimary),
                          SizedBox(width: 2),
                          Text(
                            '10 MINS',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  location.address,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const Icon(Icons.keyboard_arrow_down, size: 18, color: AppTheme.textMuted),
                            ],
                          ),
                          const Text(
                            'Chhatrapati Sambhajinagar',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Rider Mode Switcher Button
              InkWell(
                onTap: onToggleRiderMode,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: isRiderModeActive ? AppTheme.darkSlate : AppTheme.brandLavenderLight,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isRiderModeActive ? AppTheme.darkSlate : AppTheme.brandLavender,
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.two_wheeler,
                        size: 15,
                        color: isRiderModeActive ? Colors.white : AppTheme.brandLavender,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isRiderModeActive ? 'Rider Mode' : 'Customer',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isRiderModeActive ? Colors.white : AppTheme.brandLavender,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.surfaceMuted,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: const Row(
              children: [
                Icon(Icons.search, size: 20, color: AppTheme.textMuted),
                SizedBox(width: 8),
                Text(
                  'Search "chips, cold milk, sodas..."',
                  style: TextStyle(fontSize: 13, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
