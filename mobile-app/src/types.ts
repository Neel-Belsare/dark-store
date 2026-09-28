export type TabName = 'Home' | 'Cart' | 'Profile';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  emoji: string;
  category: string;
  mrp?: number;
  deliveryMins?: number;
  stock?: number;
  lowStockThreshold?: number;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  itemCount: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface MockLocationOption {
  label: string;
  sublabel: string;
  latitude: number;
  longitude: number;
}

export interface OrderItemPayload {
  name: string;
  quantity: number;
  price: number;
}

export type SubstitutionPreference = 'similar' | 'call_confirm' | 'do_not_substitute';

export interface OrderPayload {
  latitude: number;
  longitude: number;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_notes?: string;
  substitution_preference?: SubstitutionPreference;
  items: OrderItemPayload[];
  order_value: number;
}

export interface DispatchedOrder {
  order_id: string;
  cust_lat: number;
  cust_lon: number;
  customer_name?: string;
  delivery_address?: string;
  delivery_notes?: string;
  substitution_preference?: string;
  assigned_store: string;
  store_lat: number;
  store_lon: number;
  coverage_area: string;
  distance_km: number;
  base_eta_mins?: number;
  eta_mins: number;
  weather?: string;
  traffic?: string;
  items: string[];
  order_val: number;
  rider: string;
  timestamp: string;
  source: string;
  warehouse_pick_plan?: any;
  status?: string;
  active?: boolean;
}

export interface OrderApiResponse {
  success: boolean;
  message: string;
  order: DispatchedOrder;
}

export interface ServiceabilityResponse {
  is_serviceable: boolean;
  matched_zone?: string | null;
  nearest_hub?: string;
  distance_km?: number;
  match_type?: string;
  sla_promise?: string;
  message?: string;
}

export type FulfillmentMilestone = 'Order Placed' | 'Packed at Hub' | 'Dispatched' | 'Arriving' | 'Delivered';

export interface LiveRiderTelemetry {
  order_id: string;
  milestone: FulfillmentMilestone;
  milestone_index: number;
  progress_pct: number;
  rider_lat: number;
  rider_lon: number;
  speed_kmh: number;
  distance_remaining_km: number;
  eta_mins: number;
  timestamp: string;
}
