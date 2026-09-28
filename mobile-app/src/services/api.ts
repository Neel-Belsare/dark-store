import { getApiBaseUrl, API_ENDPOINTS } from '../config/apiConfig';
import {
  OrderApiResponse,
  OrderPayload,
  DispatchedOrder,
  ServiceabilityResponse,
} from '../types';
import {
  syncOrderToSupabase,
  resetSupabaseActiveOrders,
  fetchLatestOrderFromSupabase,
} from './supabase';

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
    delivery_address: customPayload?.delivery_address || 'CIDCO, Aurangabad',
    delivery_notes: customPayload?.delivery_notes || 'Leave at door',
    substitution_preference: customPayload?.substitution_preference || 'similar',
    items: customPayload?.items || [
      { name: 'Amul Taaza Toned Fresh Milk', quantity: 2, price: 27.0 },
      { name: 'Britannia 100% Whole Wheat Bread', quantity: 1, price: 45.0 },
    ],
    order_value: customPayload?.order_value || 99.0,
  };

  const endpointsToTry = [
    `${baseUrl}/api/order`,
    `${baseUrl}${API_ENDPOINTS.PLACE_ORDER}`,
  ];

  for (const url of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: OrderApiResponse = await response.json();
        // Sync to Supabase cloud database
        if (data.order) {
          syncOrderToSupabase(data.order);
        }
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 && errorData.detail) {
          throw new Error(errorData.detail.message || errorData.detail.error || 'Outside service area');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Outside service area')) {
        throw err;
      }
      // Continue to next endpoint or fallback
    }
  }

  console.warn(`[API] Backend at ${baseUrl} unreachable. Running local offline simulation.`);
  const localResult = simulateLocalDarkStoreDispatch(payload);
  // Sync local simulation to Supabase so remote dashboards receive it
  if (localResult.order) {
    syncOrderToSupabase(localResult.order);
  }
  return localResult;
}

/**
 * Checks if coordinates are within the official GeoJSON boundary service catchment.
 */
export async function checkServiceability(
  lat: number,
  lon: number
): Promise<ServiceabilityResponse> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `${baseUrl}/api/serviceability/check?latitude=${lat}&longitude=${lon}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline heuristic fallback
  }

  // Local fallback: within Aurangabad municipal bounds
  const inAurangabad = lat >= 19.82 && lat <= 19.92 && lon >= 75.28 && lon <= 75.42;
  return {
    is_serviceable: inAurangabad,
    matched_zone: inAurangabad ? 'Aurangabad Central Catchment' : null,
    nearest_hub: inAurangabad ? 'Store 1 - CIDCO Hub' : 'None',
    distance_km: inAurangabad ? 1.2 : 45.0,
    message: inAurangabad
      ? 'Serviceable under 10-minute delivery guarantee'
      : 'Currently outside our active dark store network in Aurangabad.',
  };
}

/**
 * Resets the active order pipeline so Streamlit and the mobile app return to standby.
 */
export async function resetLiveOrder(): Promise<boolean> {
  const baseUrl = getApiBaseUrl();
  // Always reset in Supabase cloud database
  await resetSupabaseActiveOrders();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${baseUrl}/api/order/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return true; // Supabase reset succeeded
  }
}

/**
 * Fetches the latest live order from the backend queue or Supabase.
 */
export async function getLatestOrder(): Promise<DispatchedOrder | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}${API_ENDPOINTS.LATEST_ORDER}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.active !== false && data.status !== 'completed') {
        return data;
      }
    }
  } catch {
    // Backend unreachable, proceed to Supabase fallback
  }

  // Fallback to Supabase Cloud query
  const cloudOrder = await fetchLatestOrderFromSupabase();
  if (cloudOrder) {
    return cloudOrder as DispatchedOrder;
  }

  return null;
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
    delivery_notes: payload.delivery_notes || 'Leave at door',
    substitution_preference: payload.substitution_preference || 'similar',
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
    status: 'active',
    active: true,
  };

  return {
    success: true,
    message: `Assigned to ${closest.name} (${distanceKm} km away)`,
    order,
  };
}
