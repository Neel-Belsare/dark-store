import { Platform } from 'react-native';
import { OrderPayload, OrderApiResponse, DispatchedOrder } from '../types';

// Default development API URL based on runtime platform
// For physical devices, replace with your machine's local Wi-Fi IP (e.g. http://192.168.1.15:8000)
const DEV_API_HOST = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

export const API_BASE_URL = DEV_API_HOST;

/**
 * Sends order coordinates and basket to the FastAPI bridge
 */
export async function submitOrder(payload: OrderPayload): Promise<OrderApiResponse> {
  const url = `${API_BASE_URL}/api/order`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

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
      throw new Error(`API returned status ${response.status}`);
    }

    const data: OrderApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.warn(`[API] Could not connect to ${url}. Using local fallback dispatcher. Error:`, error.message);
    
    // Offline / Local fallback simulation if FastAPI bridge is not running
    return generateOfflineMockOrder(payload);
  }
}

/**
 * Fetches the latest live order from the FastAPI bridge
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
 * Offline simulation helper matching app.py / api.py Haversine logic
 */
function generateOfflineMockOrder(payload: OrderPayload): OrderApiResponse {
  const stores = [
    { name: 'Store 1 - CIDCO Hub', lat: 19.8735, lon: 75.3621, area: 'CIDCO N-1 to N-7' },
    { name: 'Store 7 - Osmanpura Hub', lat: 19.8680, lon: 75.3230, area: 'Osmanpura, Kranti Chowk' },
    { name: 'Store 3 - Nirala Central', lat: 19.8821, lon: 75.3245, area: 'Nirala Bazar' },
    { name: 'Store 8 - Seven Hills Junction', lat: 19.8722, lon: 75.3540, area: 'Seven Hills, Jalna Road' },
  ];

  // Calculate approximate distance
  let nearest = stores[0];
  let minDistance = 999;
  for (const s of stores) {
    const dlat = (payload.latitude - s.lat) * 111.32;
    const dlon = (payload.longitude - s.lon) * 111.32 * Math.cos((s.lat * Math.PI) / 180);
    const dist = Math.sqrt(dlat * dlat + dlon * dlon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = s;
    }
  }

  const distanceKm = Math.max(0.4, Number(minDistance.toFixed(2)));
  const etaMins = Math.round(3.5 + distanceKm * 2.8);
  const orderId = `CSN-MOB-${Math.floor(1000 + Math.random() * 9000)}`;

  const order: DispatchedOrder = {
    order_id: orderId,
    cust_lat: payload.latitude,
    cust_lon: payload.longitude,
    customer_name: payload.customer_name || 'Customer',
    delivery_address: payload.delivery_address || 'Aurangabad',
    assigned_store: nearest.name,
    store_lat: nearest.lat,
    store_lon: nearest.lon,
    coverage_area: nearest.area,
    distance_km: distanceKm,
    eta_mins: etaMins,
    items: payload.items.map(i => `${i.name} (x${i.quantity})`),
    order_val: Math.round(payload.order_value),
    rider: 'Rahul S. (Rider #18)',
    timestamp: new Date().toLocaleTimeString(),
    source: 'Mobile App (Offline Simulation)',
  };

  return {
    success: true,
    message: `Order assigned to ${nearest.name} (${distanceKm} km away)`,
    order,
  };
}
