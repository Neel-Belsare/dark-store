import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:latlong2/latlong.dart';

enum RiderStatus {
  accepted,
  picking,
  inTransit,
  delivered,
}

class RiderProvider extends ChangeNotifier {
  RiderStatus _status = RiderStatus.accepted;
  int _activeRouteIndex = 0;
  Timer? _movementTimer;

  // Real road coordinates in Aurangabad (Jalna Road towards CIDCO)
  final List<LatLng> _routeCoordinates = const [
    LatLng(19.8741, 75.3522), // Store Hub #04
    LatLng(19.8745, 75.3508),
    LatLng(19.8750, 75.3485),
    LatLng(19.8755, 75.3460),
    LatLng(19.8760, 75.3445),
    LatLng(19.8762, 75.3433), // Customer Doorstep
  ];

  RiderStatus get status => _status;
  List<LatLng> get routeCoordinates => _routeCoordinates;
  
  LatLng get currentCourierPosition {
    if (_activeRouteIndex < _routeCoordinates.length) {
      return _routeCoordinates[_activeRouteIndex];
    }
    return _routeCoordinates.last;
  }

  double get courierBearing {
    if (_activeRouteIndex < _routeCoordinates.length - 1) {
      final p1 = _routeCoordinates[_activeRouteIndex];
      final p2 = _routeCoordinates[_activeRouteIndex + 1];
      // Simple approximate heading angle in degrees
      final dx = p2.longitude - p1.longitude;
      final dy = p2.latitude - p1.latitude;
      return (dx < 0 ? 270.0 : 90.0);
    }
    return 0.0;
  }

  void advanceStage() {
    if (_status == RiderStatus.accepted) {
      _status = RiderStatus.picking;
    } else if (_status == RiderStatus.picking) {
      _status = RiderStatus.inTransit;
      _startSimulatedMovement();
    } else if (_status == RiderStatus.inTransit) {
      _status = RiderStatus.delivered;
      _stopSimulatedMovement();
    } else {
      _status = RiderStatus.accepted;
      _activeRouteIndex = 0;
    }
    notifyListeners();
  }

  void _startSimulatedMovement() {
    _movementTimer?.cancel();
    _activeRouteIndex = 0;
    _movementTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_activeRouteIndex < _routeCoordinates.length - 1) {
        _activeRouteIndex++;
        notifyListeners();
      } else {
        _status = RiderStatus.delivered;
        timer.cancel();
        notifyListeners();
      }
    });
  }

  void _stopSimulatedMovement() {
    _movementTimer?.cancel();
    _activeRouteIndex = _routeCoordinates.length - 1;
    notifyListeners();
  }

  @override
  void dispose() {
    _movementTimer?.cancel();
    super.dispose();
  }
}
