export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  emoji: string;
  category: string;
}

export interface OrderItemPayload {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderPayload {
  latitude: number;
  longitude: number;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  items: OrderItemPayload[];
  order_value: number;
}

export interface DispatchedOrder {
  order_id: string;
  cust_lat: number;
  cust_lon: number;
  customer_name?: string;
  delivery_address?: string;
  assigned_store: string;
  store_lat: number;
  store_lon: number;
  coverage_area: string;
  distance_km: number;
  eta_mins: number;
  items: string[];
  order_val: number;
  rider: string;
  timestamp: string;
  source: string;
}

export interface OrderApiResponse {
  success: boolean;
  message: string;
  order: DispatchedOrder;
}

export interface MockLocationOption {
  label: string;
  sublabel: string;
  latitude: number;
  longitude: number;
}
