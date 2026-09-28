import { Platform } from 'react-native';
import { OrderApiResponse, OrderPayload, DispatchedOrder } from '../types';

/**
 * FASTAPI SERVER CONFIGURATION
 * ----------------------------
 * Replace `YOUR_LOCAL_IP` with your machine's local Wi-Fi IP address (e.g., '192.168.1.15')
 * when running on a physical iPhone or Android device via Expo Go.
 *
 * For Emulators/Simulators:
 * - Android Emulator uses '10.0.2.2' to refer to your host PC localhost.
 * - iOS Simulator / Web uses 'localhost'.
 */
const LOCAL_IP_PLACEHOLDER = 'YOUR_LOCAL_IP'; // <-- Replace with your machine's LAN IP e.g. '192.168.1.5'

const SERVER_HOST = Platform.select({
  android: LOCAL_IP_PLACEHOLDER !== 'YOUR_LOCAL_IP' ? `http://${LOCAL_IP_PLACEHOLDER}:8000` : 'http://10.0.2.2:8000',
  ios: LOCAL_IP_PLACEHOLDER !== 'YOUR_LOCAL_IP' ? `http://${LOCAL_IP_PLACEHOLDER}:8000` : 'http://localhost:8000',
  default: LOCAL_IP_PLACEHOLDER !== 'YOUR_LOCAL_IP' ? `http://${LOCAL_IP_PLACEHOLDER}:8000` : 'http://localhost:8000',
});

export const API_BASE_URL = SERVER_HOST;

/**
 * Sends customer GPS coordinates to the local FastAPI router for nearest dark-store assignment.
 *
 * @param lat Customer GPS Latitude (e.g. 19.8760)
 * @param lon Customer GPS Longitude (e.g. 75.3640)
 * @param customPayload Optional additional order details (items, cart value, address)
 */
export async function placeLiveOrder(
  lat: number,
  lon: number,
  customPayload?: Partial<OrderPayload>
): Promise<OrderApiResponse> {
  const url = `${API_BASE_URL}/api/order`;

  const payload: OrderPayload = {
    latitude: lat,
    longitude: lon,
    customer_name: customPayload?.customer_name || 'Neel Belsare',
    customer_phone: customPayload?.customer_phone || '+91 98765 43210',
    delivery_address: customPayload?.delivery_address || 'Chhatrapati Sambhajinagar',
    items: customPayload?.items || [
      { name: 'Amul Taaza Toned Milk 500ml', quantity: 2, price: 27.0 },
      { name: 'Britannia 100% Whole Wheat Bread 400g', quantity: 1, price: 45.0 },
      { name: "Lay's India's Magic Masala 50g", quantity: 2, price: 20.0 },
    ],
    order_value: customPayload?.order_value || 139.0,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data: OrderApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.warn(`[API] Could not reach ${url} (${error.message}). Executing local dark-store assignment...`);
    
    // Offline / Local fallback simulation matching the Python Haversine algorithm
    return simulateLocalDarkStoreDispatch(payload);
  }
}

/**
 * Fetches the active live order from the FastAPI server queue
 */
export async function getLatestOrder(): Promise<DispatchedOrder | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/latest-order`);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Local Haversine routing fallback matching app.py dataset for offline development
 */
function simulateLocalDarkStoreDispatch(payload: OrderPayload): OrderApiResponse {
  const stores = [
    { name: 'Store 1 - CIDCO Hub', lat: 19.8735, lon: 75.3621, area: 'CIDCO N-1 to N-7, Cannaught' },
    { name: 'Store 7 - Osmanpura Hub', lat: 19.8680, lon: 75.3230, area: 'Osmanpura, Kranti Chowk' },
    { name: 'Store 3 - Nirala Central', lat: 19.8821, lon: 75.3245, area: 'Nirala Bazar, Khadkeshwar' },
    { name: 'Store 8 - Seven Hills Junction', lat: 19.8722, lon: 75.3540, area: 'Seven Hills, Jalna Road' },
    { name: 'Store 2 - Garkheda Point', lat: 19.8596, lon: 75.3512, area: 'Garkheda, Ulkanagari' },
  ];

  let closest = stores[0];
  let minDistanceKm = 999;

  for (const s of stores) {
    // Great circle calculation approximation
    const dlat = (payload.latitude - s.lat) * 111.32;
    const dlon = (payload.longitude - s.lon) * 111.32 * Math.cos((s.lat * Math.PI) / 180);
    const dist = Math.sqrt(dlat * dlat + dlon * dlon);
    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      closest = s;
    }
  }

  const distanceKm = Math.max(0.3, Number(minDistanceKm.toFixed(2)));
  const etaMins = Math.round(3.5 + distanceKm * 2.8);
  const orderId = `CSN-MOB-${Math.floor(1000 + Math.random() * 9000)}`;

  const order: DispatchedOrder = {
    order_id: orderId,
    cust_lat: payload.latitude,
    cust_lon: payload.longitude,
    customer_name: payload.customer_name,
    delivery_address: payload.delivery_address,
    assigned_store: closest.name,
    store_lat: closest.lat,
    store_lon: closest.lon,
    coverage_area: closest.area,
    distance_km: distanceKm,
    eta_mins: etaMins,
    items: payload.items.map((i) => `${i.name} (x${i.quantity})`),
    order_val: Math.round(payload.order_value),
    rider: 'Rahul S. (Rider #18)',
    timestamp: new Date().toLocaleTimeString(),
    source: 'Mobile App (GPS Local Fallback)',
  };

  return {
    success: true,
    message: `Order assigned to ${closest.name} (${distanceKm} km away)`,
    order,
  };
}
