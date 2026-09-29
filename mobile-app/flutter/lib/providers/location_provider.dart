import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

class LocationProvider extends ChangeNotifier {
  String _address = 'CIDCO Sector N-2, Chhatrapati Sambhajinagar';
  double _latitude = 19.8762;
  double _longitude = 75.3433;
  bool _isGpsLocked = true;

  String get address => _address;
  double get latitude => _latitude;
  double get longitude => _longitude;
  bool get isGpsLocked => _isGpsLocked;

  Future<void> requestDeviceLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        _latitude = position.latitude;
        _longitude = position.longitude;
        _address = 'Current GPS: ${_latitude.toStringAsFixed(4)}, ${_longitude.toStringAsFixed(4)}';
        _isGpsLocked = true;
        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) {
        print('Location error: $e');
      }
    }
  }

  void setCustomLocation(String addressName, double lat, double lon) {
    _address = addressName;
    _latitude = lat;
    _longitude = lon;
    _isGpsLocked = true;
    notifyListeners();
  }
}
