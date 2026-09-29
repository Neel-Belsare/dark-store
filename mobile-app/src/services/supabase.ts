/**
 * Supabase REST Service for Blinkit Quick-Commerce Client
 * --------------------------------------------------------
 * Direct, lightweight HTTP client connecting the mobile client
 * to Supabase PostgreSQL without heavy dependencies.
 */

const env = (typeof process !== 'undefined' && process.env) ? (process.env as Record<string, string | undefined>) : {};

const SUPABASE_URL =
  env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://wovfqutzuppauwretoiw.supabase.co';

const SUPABASE_ANON_KEY =
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdmZxdXR6dXBwYXV3cmV0b2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDk4OTIsImV4cCI6MjEwNjE4NTg5Mn0.djjjD0bnzwUo3ArsVKrlau43gRkCxPCyvAB1EPZOb7g';

const getHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

/**
 * Saves a dispatched order directly to Supabase orders table.
 */
export async function syncOrderToSupabase(order: any): Promise<boolean> {
  try {
    const payload = {
      order_id: order.order_id,
      status: 'active',
      customer_name: order.customer_name || 'Customer',
      customer_phone: order.customer_phone || '+91 98765 43210',
      delivery_address: order.delivery_address || 'CIDCO, Aurangabad',
      cust_lat: order.cust_lat,
      cust_lon: order.cust_lon,
      assigned_store: order.assigned_store,
      store_lat: order.store_lat,
      store_lon: order.store_lon,
      coverage_area: order.coverage_area,
      distance_km: order.distance_km,
      base_eta_mins: order.base_eta_mins,
      eta_mins: order.eta_mins,
      weather: order.weather || 'Clear',
      traffic: order.traffic || 'Moderate',
      order_val: order.order_val || 320,
      rider: order.rider,
      delivery_notes: order.delivery_notes || 'Leave at door',
      substitution_preference: order.substitution_preference || 'similar',
      items: order.items || [],
      warehouse_pick_plan: order.warehouse_pick_plan || {},
      source: 'Mobile App (Netlify Web/Expo)',
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.warn('[Supabase] Sync failed (falling back):', error);
    return false;
  }
}

/**
 * Resets active orders in Supabase to 'completed' status.
 */
export async function resetSupabaseActiveOrders(): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?status=eq.active`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'completed',
          completed_at: new Date().toISOString(),
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.warn('[Supabase] Reset failed:', error);
    return false;
  }
}

/**
 * Fetches the latest active order directly from Supabase.
 */
export async function fetchLatestOrderFromSupabase(): Promise<any | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?status=eq.active&order=created_at.desc&limit=1`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}
