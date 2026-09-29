class OrderItem {
  final String id;
  final String title;
  final int quantity;
  final double price;

  OrderItem({
    required this.id,
    required this.title,
    required this.quantity,
    required this.price,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'quantity': quantity,
        'price': price,
        'line_total': quantity * price,
      };
}

class OrderModel {
  final String orderId;
  final String status;
  final String customerName;
  final String customerPhone;
  final String deliveryAddress;
  final double custLat;
  final double custLon;
  final String assignedStore;
  final double storeLat;
  final double storeLon;
  final double distanceKm;
  final int etaMins;
  final double orderVal;
  final String rider;
  final List<OrderItem> items;

  OrderModel({
    required this.orderId,
    this.status = 'active',
    this.customerName = 'Customer',
    this.customerPhone = '+91 98765 43210',
    this.deliveryAddress = 'CIDCO Sector N-2, Chhatrapati Sambhajinagar',
    required this.custLat,
    required this.custLon,
    required this.assignedStore,
    required this.storeLat,
    required this.storeLon,
    required this.distanceKm,
    required this.etaMins,
    required this.orderVal,
    required this.rider,
    required this.items,
  });

  Map<String, dynamic> toSupabasePayload() => {
        'order_id': orderId,
        'status': status,
        'customer_name': customerName,
        'customer_phone': customerPhone,
        'delivery_address': deliveryAddress,
        'cust_lat': custLat,
        'cust_lon': custLon,
        'assigned_store': assignedStore,
        'store_lat': storeLat,
        'store_lon': storeLon,
        'distance_km': distanceKm,
        'base_eta_mins': etaMins - 2,
        'eta_mins': etaMins,
        'weather': 'Clear',
        'traffic': 'Moderate',
        'order_val': orderVal,
        'rider': rider,
        'delivery_notes': 'Leave at door / Ring bell',
        'items': items.map((i) => i.toJson()).toList(),
        'source': 'Flutter Mobile App (v3.0.0 APK)',
      };
}
