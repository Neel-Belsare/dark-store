import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/rider_provider.dart';

class RoadNavigationMap extends StatelessWidget {
  const RoadNavigationMap({super.key});

  @override
  Widget build(BuildContext context) {
    final rider = context.watch<RiderProvider>();
    final courierPos = rider.currentCourierPosition;
    final route = rider.routeCoordinates;

    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: courierPos,
              initialZoom: 15.2,
            ),
            children: [
              // OpenStreetMap Tile Layer
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.darkstore.blinkit_clone',
              ),

              // Blue Road Route Polyline
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: route,
                    strokeWidth: 5.0,
                    color: const Color(0xFF38BDF8),
                  ),
                ],
              ),

              // Markers Layer
              MarkerLayer(
                markers: [
                  // 1. Dark Store Hub Marker
                  Marker(
                    point: route.first,
                    width: 38,
                    height: 38,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.successEmerald,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 4),
                        ],
                      ),
                      child: const Icon(Icons.store, color: Colors.white, size: 20),
                    ),
                  ),

                  // 2. Customer Doorstep Marker
                  Marker(
                    point: route.last,
                    width: 38,
                    height: 38,
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.dangerRed,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 4),
                        ],
                      ),
                      child: const Icon(Icons.home, color: Colors.white, size: 20),
                    ),
                  ),

                  // 3. Moving Courier Bike Marker with Bearing Rotation
                  Marker(
                    point: courierPos,
                    width: 44,
                    height: 44,
                    child: Transform.rotate(
                      angle: rider.courierBearing * (math.pi / 180.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.darkSlate,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.brandLavender, width: 2.5),
                          boxShadow: const [
                            BoxShadow(color: Colors.black38, blurRadius: 6),
                          ],
                        ),
                        child: const Icon(Icons.two_wheeler, color: Colors.white, size: 22),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Top Street Info Badge HUD
          Positioned(
            top: 12,
            left: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.darkSlate.withOpacity(0.92),
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [
                  BoxShadow(color: Colors.black26, blurRadius: 6),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.navigation, color: Color(0xFF38BDF8), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Turn right on Jalna Road in 150m • Speed: 24 km/h',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Text(
                    '1.2 km',
                    style: TextStyle(
                      color: Color(0xFF38BDF8),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
