import { getApiBaseUrl, API_ENDPOINTS } from '../config/apiConfig';
import { OrderApiResponse, OrderPayload, DispatchedOrder } from '../types';

/**
 * Dispatches an order to the local Python backend with device GPS coordinates
 * to determine and assign the strictly nearest dark store.
 */
export async function placeLiveOrder(
  lat: number,
  lon: number,
  customPayload?: Partial<OrderPayload>
): Promise<OrderApiResponse> {
  const baseUrl = getApiBaseUrl();
  const payload: OrderPayload = {
    latitude: lat,
    longitude: lon,
    customer_name: customPayload?.customer_name || 'Neel Belsare',
    customer_phone: customPayload?.customer_phone || '+91 98765 43210',
    delivery_address: customPayload?.delivery_address || 'Chhatrapati Sambhajinagar',
    items: customPayload?.items || [
      { name: 'Amul Taaza Toned Fresh Milk', quantity: 2, price: 27.0 },
      { name: 'Britannia 100% Whole Wheat Bread', quantity: 1, price: 45.0 },
    ],
    order_value: customPayload?.order_value || 99.0,
  };

  // Try configured /place_order and fallback to /api/order
  const endpointsToTry = [
    `${baseUrl}${API_ENDPOINTS.PLACE_ORDER}`,
    `${baseUrl}${API_ENDPOINTS.API_ORDER}`,
  ];

  for (const url of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: OrderApiResponse = await response.json();
        return data;
      }
    } catch (err: any) {
      // Continue to next endpoint or local fallback
    }
  }

  console.warn(`[API] Could not connect to backend at ${baseUrl}. Executing local dark store assignment.`);
  return simulateLocalDarkStoreDispatch(payload);
}

/**
 * Fetches the latest live order from the backend queue
 */
export async function getLatestOrder(): Promise<DispatchedOrder | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}${API_ENDPOINTS.LATEST_ORDER}`);
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
    source: 'Mobile App (Offline Simulation)',
  };

  return {
    success: true,
    message: `Assigned to ${closest.name} (${distanceKm} km away)`,
    order,
  };
}
