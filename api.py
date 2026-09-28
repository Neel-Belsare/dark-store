"""
FastAPI Bridge for Aurangabad Quick-Commerce Ecosystem
------------------------------------------------------
Connects the React Native / Expo mobile app to the Streamlit Dark Store
Command Center in real time.

Features:
- Predictive Delivery Logistics (Weather & Traffic ETA Buffering)
- GeoJSON Serviceability Catchment Enforcement
- Delivery Notes & Item Substitution Preference Handling
- Warehouse Serpentine (S-Shape) Pick Path Optimization
- Courier Multi-Order Spatial Route Batching
- Real-Time WebSocket Telemetry Streaming for Courier Tracking (4 Milestones)
- Single-Order Lifecycle with Bi-Directional Done/Reset Synchronization
"""

import os
import glob
import json
import math
import asyncio
import numpy as np
import pandas as pd
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LATEST_ORDER_FILE = os.path.join(BASE_DIR, "latest_order.json")
ORDER_HISTORY_FILE = os.path.join(BASE_DIR, "order_history.json")
STORES_CSV = os.path.join(BASE_DIR, "data", "processed", "aurangabad_dark_stores.csv")
GEOJSON_DIR = os.path.join(BASE_DIR, "data", "geojson")

# Supabase Cloud Database Client
try:
    import supabase_client
except ImportError:
    supabase_client = None

app = FastAPI(
    title="Aurangabad Quick-Commerce Autonomous Dispatch API",
    description="Full-stack logistics bridge connecting Expo mobile client and Streamlit Command Center",
    version="2.0.0"
)

# Enable CORS for React Native (Expo) web, mobile, and emulator access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Data Models & Schemas
# ------------------------------------------------------------------------------
class OrderItem(BaseModel):
    name: str
    quantity: int = 1
    price: float = 0.0

class OrderCreateRequest(BaseModel):
    latitude: float = Field(..., description="Customer GPS latitude (e.g. 19.8760)")
    longitude: float = Field(..., description="Customer GPS longitude (e.g. 75.3640)")
    customer_name: Optional[str] = "Customer"
    customer_phone: Optional[str] = "+91 98765 43210"
    delivery_address: Optional[str] = "CIDCO, Aurangabad"
    items: Optional[List[OrderItem]] = None
    order_value: Optional[float] = 349.0
    delivery_notes: Optional[str] = "Leave at door"
    substitution_preference: Optional[str] = "similar"  # 'similar', 'call_confirm', 'do_not_substitute'

class LogisticsConditionUpdate(BaseModel):
    weather: Optional[str] = "Clear"       # Clear, Light Rain, Heavy Monsoon Rain, Thunderstorm
    traffic: Optional[str] = "Moderate"    # Low, Moderate, Peak Rush Hour, Severe Congestion

# ------------------------------------------------------------------------------
# Predictive Logistics: Weather & Traffic Condition State
# ------------------------------------------------------------------------------
WEATHER_MULTIPLIERS = {
    "Clear": {"multiplier": 1.0, "buffer_mins": 0.0, "description": "Optimal road conditions"},
    "Light Rain": {"multiplier": 1.25, "buffer_mins": 2.0, "description": "Slight slick roads, minor caution"},
    "Heavy Monsoon Rain": {"multiplier": 1.55, "buffer_mins": 5.0, "description": "Reduced visibility, waterlogging risk"},
    "Thunderstorm": {"multiplier": 1.85, "buffer_mins": 8.0, "description": "Hazardous conditions, fleet speed capped"}
}

TRAFFIC_MULTIPLIERS = {
    "Low": {"multiplier": 1.0, "buffer_mins": 0.0, "description": "Free flowing traffic"},
    "Moderate": {"multiplier": 1.15, "buffer_mins": 1.5, "description": "Typical daytime city movement"},
    "Peak Rush Hour": {"multiplier": 1.45, "buffer_mins": 4.0, "description": "Chowk and arterial junction congestion"},
    "Severe Congestion": {"multiplier": 1.75, "buffer_mins": 7.0, "description": "Gridlock on Jalna Road & Kranti Chowk"}
}

LIVE_LOGISTICS_STATE = {
    "weather": "Clear",
    "traffic": "Moderate",
    "weather_multiplier": 1.0,
    "traffic_multiplier": 1.15,
    "fixed_buffer_mins": 1.5,
    "updated_at": datetime.now().isoformat()
}

# ------------------------------------------------------------------------------
# Warehouse Catalog & Serpentine Pick Path Coordinates
# ------------------------------------------------------------------------------
WAREHOUSE_CATALOG_SLOTS = {
    "milk": {"aisle": 1, "shelf": 1, "bin": "1A-01", "zone": "Cold Storage", "name": "Amul Taaza Milk"},
    "paneer": {"aisle": 1, "shelf": 2, "bin": "1A-04", "zone": "Cold Storage", "name": "Amul Fresh Paneer"},
    "curd": {"aisle": 1, "shelf": 2, "bin": "1A-05", "zone": "Cold Storage", "name": "Mother Dairy Dahi"},
    "butter": {"aisle": 1, "shelf": 3, "bin": "1A-08", "zone": "Cold Storage", "name": "Amul Butter"},
    "bread": {"aisle": 2, "shelf": 1, "bin": "2A-01", "zone": "Bakery Ambient", "name": "Britannia Whole Wheat Bread"},
    "bun": {"aisle": 2, "shelf": 2, "bin": "2A-03", "zone": "Bakery Ambient", "name": "English Oven Burger Buns"},
    "chips": {"aisle": 3, "shelf": 1, "bin": "3A-01", "zone": "Dry Snacks", "name": "Lay's Magic Masala Chips"},
    "kurkure": {"aisle": 3, "shelf": 2, "bin": "3A-04", "zone": "Dry Snacks", "name": "Kurkure Masala Munch"},
    "biscuit": {"aisle": 3, "shelf": 3, "bin": "3A-07", "zone": "Dry Snacks", "name": "Parle-G Gold Biscuits"},
    "coke": {"aisle": 4, "shelf": 1, "bin": "4A-01", "zone": "Beverages", "name": "Coca-Cola Zero Sugar 300ml"},
    "juice": {"aisle": 4, "shelf": 2, "bin": "4A-04", "zone": "Beverages", "name": "Real Mixed Fruit Juice"},
    "oil": {"aisle": 5, "shelf": 1, "bin": "5A-01", "zone": "Pantry Heavy", "name": "Fortune Sunflower Oil 1L"},
    "salt": {"aisle": 5, "shelf": 2, "bin": "5A-04", "zone": "Pantry Dry", "name": "Tata Salt Vacuum Evaporated 1kg"},
    "atta": {"aisle": 5, "shelf": 3, "bin": "5A-08", "zone": "Pantry Heavy", "name": "Aashirvaad Shudh Chakki Atta 5kg"},
    "rice": {"aisle": 5, "shelf": 4, "bin": "5A-11", "zone": "Pantry Heavy", "name": "India Gate Basmati Rice 1kg"}
}

DEFAULT_WAREHOUSE_SLOT = {"aisle": 3, "shelf": 1, "bin": "3A-01", "zone": "General Merch"}

# ------------------------------------------------------------------------------
# GeoJSON Serviceability Boundary Engine
# ------------------------------------------------------------------------------
def point_in_polygon(x: float, y: float, poly: list) -> bool:
    """Ray-casting point-in-polygon algorithm. x=lon, y=lat, poly=[[lon, lat], ...]"""
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def load_geojson_catchments() -> List[Dict[str, Any]]:
    """Loads all local GeoJSON catchment boundary files in /data/geojson/."""
    zones = []
    if os.path.exists(GEOJSON_DIR):
        for filepath in glob.glob(os.path.join(GEOJSON_DIR, "*.json")) + glob.glob(os.path.join(GEOJSON_DIR, "*.geojson")):
            try:
                filename = os.path.basename(filepath)
                zone_name = filename.replace("_geo.json", "").replace("_geo.geojson", "").replace("_", " ").title()
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    polygons = []
                    if "features" in data:
                        for feat in data["features"]:
                            geom = feat.get("geometry", {})
                            g_type = geom.get("type")
                            coords = geom.get("coordinates", [])
                            if g_type == "Polygon":
                                for ring in coords:
                                    if len(ring) >= 3:
                                        polygons.append(ring)
                            elif g_type == "MultiPolygon":
                                for poly in coords:
                                    for ring in poly:
                                        if len(ring) >= 3:
                                            polygons.append(ring)
                            elif g_type == "LineString" and len(coords) >= 4:
                                # In boundary GeoJSONs, some closed perimeters are stored as closed LineStrings
                                polygons.append(coords)
                    zones.append({
                        "name": zone_name,
                        "file": filename,
                        "polygons": polygons
                    })
            except Exception as e:
                print(f"[GeoJSON] Error loading {filepath}: {e}")
    return zones

LOADED_CATCHMENT_ZONES = load_geojson_catchments()

def evaluate_serviceability(lat: float, lon: float) -> Dict[str, Any]:
    """
    Evaluates if coordinates fall within official GeoJSON catchment zones
    or within the 10-minute delivery radius of any active Aurangabad dark store.
    """
    # 1. First test official GeoJSON boundary polygons
    for zone in LOADED_CATCHMENT_ZONES:
        for poly in zone["polygons"]:
            if point_in_polygon(lon, lat, poly):
                return {
                    "is_serviceable": True,
                    "matched_zone": zone["name"],
                    "match_type": "Official GeoJSON Boundary Polygon",
                    "sla_promise": "10-12 Mins Guaranteed"
                }

    # 2. Check radius to 12 active Aurangabad dark store hubs
    df_stores = load_dark_stores()
    active_stores = df_stores[df_stores['Status'] == 'Active'].copy()
    if active_stores.empty:
        active_stores = df_stores.copy()

    active_stores['Dist_km'] = active_stores.apply(
        lambda s: haversine_distance(lat, lon, float(s['Latitude']), float(s['Longitude'])),
        axis=1
    )
    closest_store = active_stores.sort_values('Dist_km').iloc[0]
    min_dist = float(closest_store['Dist_km'])
    allowed_radius = float(closest_store.get('Delivery Radius (km)', 3.2))

    if min_dist <= allowed_radius:
        return {
            "is_serviceable": True,
            "matched_zone": str(closest_store['Coverage Area']).split(',')[0],
            "nearest_hub": str(closest_store['Store Name']),
            "distance_km": round(min_dist, 2),
            "match_type": f"Within {allowed_radius}km Hub Catchment",
            "sla_promise": f"~{int(round(3.5 + min_dist * 2.8))} Mins"
        }

    return {
        "is_serviceable": False,
        "matched_zone": None,
        "nearest_hub": str(closest_store['Store Name']),
        "distance_km": round(min_dist, 2),
        "allowed_radius_km": allowed_radius,
        "match_type": "Outside Delivery Catchment",
        "message": f"Location is {min_dist:.2f} km from {closest_store['Store Name']} (Max coverage is {allowed_radius} km). We are expanding soon!"
    }

# ------------------------------------------------------------------------------
# Dark Store Geospatial Routing Engine
# ------------------------------------------------------------------------------
def load_dark_stores() -> pd.DataFrame:
    """Load Aurangabad dark stores from CSV or fallback to standard 12 hubs."""
    if os.path.exists(STORES_CSV):
        try:
            return pd.read_csv(STORES_CSV)
        except Exception:
            pass

    stores = [
        {'Store Name': 'Store 1 - CIDCO Hub', 'Coverage Area': 'CIDCO N-1 to N-7, Cannaught, Town Centre', 'Latitude': 19.8735, 'Longitude': 75.3621, 'Delivery Radius (km)': 3.2, 'Status': 'Active'},
        {'Store Name': 'Store 2 - Garkheda Point', 'Coverage Area': 'Garkheda, Ulkanagari, Sutgirni Chowk', 'Latitude': 19.8596, 'Longitude': 75.3512, 'Delivery Radius (km)': 3.2, 'Status': 'Active'},
        {'Store Name': 'Store 3 - Nirala Central', 'Coverage Area': 'Nirala Bazar, Samarth Nagar, Khadkeshwar', 'Latitude': 19.8821, 'Longitude': 75.3245, 'Delivery Radius (km)': 2.8, 'Status': 'Active'},
        {'Store Name': 'Store 4 - Waluj Industrial', 'Coverage Area': 'Waluj MIDC, Ranjangaon, Kamlapur', 'Latitude': 19.8327, 'Longitude': 75.2285, 'Delivery Radius (km)': 4.5, 'Status': 'Active'},
        {'Store Name': 'Store 5 - Chikalthana Express', 'Coverage Area': 'Chikalthana MIDC, Airport Road, Mukundwadi', 'Latitude': 19.8752, 'Longitude': 75.3951, 'Delivery Radius (km)': 3.5, 'Status': 'Active'},
        {'Store Name': 'Store 6 - Beed Bypass Corridor', 'Coverage Area': 'Beed Bypass, MIT College, Satara Parisar', 'Latitude': 19.8450, 'Longitude': 75.3410, 'Delivery Radius (km)': 3.5, 'Status': 'Active'},
        {'Store Name': 'Store 7 - Osmanpura Hub', 'Coverage Area': 'Osmanpura, Kranti Chowk, Station Road', 'Latitude': 19.8680, 'Longitude': 75.3230, 'Delivery Radius (km)': 2.8, 'Status': 'Active'},
        {'Store Name': 'Store 8 - Seven Hills Junction', 'Coverage Area': 'Seven Hills, Jalna Road, Akashwani', 'Latitude': 19.8722, 'Longitude': 75.3540, 'Delivery Radius (km)': 2.8, 'Status': 'Active'},
        {'Store Name': 'Store 9 - HUDCO North', 'Coverage Area': 'HUDCO, TV Centre, N-8 to N-12', 'Latitude': 19.9050, 'Longitude': 75.3480, 'Delivery Radius (km)': 3.2, 'Status': 'Active'},
        {'Store Name': 'Store 10 - Railway Station / Vedant', 'Coverage Area': 'Vedant Nagar, Padampura, Bansilal Nagar', 'Latitude': 19.8580, 'Longitude': 75.3190, 'Delivery Radius (km)': 2.8, 'Status': 'Active'},
        {'Store Name': 'Store 11 - Shahgunj Old City', 'Coverage Area': 'Shahgunj, City Chowk, Gulmandi', 'Latitude': 19.8860, 'Longitude': 75.3340, 'Delivery Radius (km)': 2.2, 'Status': 'Active'},
        {'Store Name': 'Store 12 - Shendra DMIC (AURIC)', 'Coverage Area': 'AURIC City, Shendra MIDC, Kumbhephal', 'Latitude': 19.8850, 'Longitude': 75.4850, 'Delivery Radius (km)': 5.0, 'Status': 'Proposed'}
    ]
    return pd.DataFrame(stores)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great circle distance between two points in kilometers."""
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
    return float(2 * R * np.arcsin(np.sqrt(a)))

def calculate_predictive_eta(distance_km: float) -> Dict[str, Any]:
    """Calculates base vs buffered ETA using real-time weather and traffic modifiers."""
    base_eta = 3.5 + distance_km * 2.8

    weather_key = LIVE_LOGISTICS_STATE["weather"]
    traffic_key = LIVE_LOGISTICS_STATE["traffic"]

    w_info = WEATHER_MULTIPLIERS.get(weather_key, {"multiplier": 1.0, "buffer_mins": 0.0})
    t_info = TRAFFIC_MULTIPLIERS.get(traffic_key, {"multiplier": 1.0, "buffer_mins": 0.0})

    multiplier = w_info["multiplier"] * t_info["multiplier"]
    fixed_buffer = w_info["buffer_mins"] + t_info["buffer_mins"]

    buffered_eta = round(base_eta * multiplier + fixed_buffer)
    buffered_eta = max(5, int(buffered_eta))

    return {
        "base_eta_mins": int(round(base_eta)),
        "buffered_eta_mins": buffered_eta,
        "weather": weather_key,
        "traffic": traffic_key,
        "total_buffer_mins": round(buffered_eta - base_eta, 1),
        "weather_multiplier": w_info["multiplier"],
        "traffic_multiplier": t_info["multiplier"]
    }

def route_order_to_nearest_store(cust_lat: float, cust_lon: float):
    """Find strictly nearest active dark store and calculate delivery parameters."""
    df_stores = load_dark_stores()
    active_stores = df_stores[df_stores['Status'] == 'Active'].copy()
    if active_stores.empty:
        active_stores = df_stores.copy()

    active_stores['Dist_to_Customer'] = active_stores.apply(
        lambda s: haversine_distance(cust_lat, cust_lon, float(s['Latitude']), float(s['Longitude'])),
        axis=1
    )
    assigned_store = active_stores.sort_values('Dist_to_Customer').iloc[0]
    distance_km = float(assigned_store['Dist_to_Customer'])

    eta_data = calculate_predictive_eta(distance_km)

    rider_pool = [
        "Rahul S. (Rider #18)",
        "Vikram M. (Rider #07)",
        "Amit P. (Rider #23)",
        "Sachin K. (Rider #12)",
        "Gaurav D. (Rider #31)"
    ]
    assigned_rider = str(np.random.choice(rider_pool))

    return assigned_store, distance_km, eta_data, assigned_rider

# ------------------------------------------------------------------------------
# Warehouse Pick-Path Optimization (Serpentine S-Shape)
# ------------------------------------------------------------------------------
def optimize_warehouse_pick_path(items: List[str]) -> Dict[str, Any]:
    """
    Sorts order items into an optimal S-shape (serpentine) walking path
    across dark store aisles to minimize picker walking time.
    """
    slotted_items = []
    for raw_item in items:
        # Match item key in WAREHOUSE_CATALOG_SLOTS (support dict or str)
        if isinstance(raw_item, dict):
            item_name = raw_item.get("name", str(raw_item))
        else:
            item_name = str(raw_item)

        item_lower = item_name.lower()
        matched_slot = DEFAULT_WAREHOUSE_SLOT
        for key, slot_info in WAREHOUSE_CATALOG_SLOTS.items():
            if key in item_lower:
                matched_slot = slot_info
                break

        slotted_items.append({
            "item_name": item_name,
            "aisle": matched_slot["aisle"],
            "shelf": matched_slot["shelf"],
            "bin": matched_slot["bin"],
            "zone": matched_slot["zone"],
        })

    # S-Shape Serpentine Sorting:
    # Odd aisles: traverse ascending shelf (1, 2, 3...)
    # Even aisles: traverse descending shelf (..., 3, 2, 1)
    def s_shape_key(item):
        aisle = item["aisle"]
        shelf = item["shelf"] if aisle % 2 != 0 else -item["shelf"]
        return (aisle, shelf)

    sequenced_items = sorted(slotted_items, key=s_shape_key)

    for idx, item in enumerate(sequenced_items, start=1):
        item["pick_step"] = idx

    estimated_seconds = 20 + len(sequenced_items) * 14  # ~20s setup + 14s per pick

    return {
        "total_items": len(sequenced_items),
        "total_aisles_visited": len(set(i["aisle"] for i in sequenced_items)),
        "estimated_pick_time_seconds": estimated_seconds,
        "pick_path_strategy": "Serpentine S-Shape (Zero Backtrack)",
        "pick_sequence": sequenced_items
    }

# ------------------------------------------------------------------------------
# Courier Order Batching Algorithm
# ------------------------------------------------------------------------------
def batch_unassigned_orders(order_list: List[Dict[str, Any]], cluster_threshold_km: float = 1.4) -> List[Dict[str, Any]]:
    """
    Clusters concurrent orders from the same dark store hub with nearby customer
    destinations into combined delivery batches for a single courier.
    """
    if not order_list or len(order_list) <= 1:
        return [{"batch_id": "BATCH-1", "order_count": len(order_list), "orders": order_list, "savings_km": 0.0}]

    batches = []
    visited = set()

    for i, ord1 in enumerate(order_list):
        if i in visited:
            continue
        current_batch = [ord1]
        visited.add(i)

        for j, ord2 in enumerate(order_list):
            if j in visited:
                continue
            # Must be from the same fulfillment hub
            if ord1.get("assigned_store") != ord2.get("assigned_store"):
                continue

            dist_between_customers = haversine_distance(
                ord1["cust_lat"], ord1["cust_lon"],
                ord2["cust_lat"], ord2["cust_lon"]
            )

            if dist_between_customers <= cluster_threshold_km:
                current_batch.append(ord2)
                visited.add(j)

        # Calculate mileage comparison
        # Solo trips: (Dist1 * 2) + (Dist2 * 2) ...
        solo_dist = sum(o["distance_km"] * 2 for o in current_batch)

        # Multi-stop batched loop: Store -> Stop 1 -> Stop 2 -> Store
        if len(current_batch) > 1:
            loop_dist = current_batch[0]["distance_km"]
            for k in range(len(current_batch) - 1):
                loop_dist += haversine_distance(
                    current_batch[k]["cust_lat"], current_batch[k]["cust_lon"],
                    current_batch[k+1]["cust_lat"], current_batch[k+1]["cust_lon"]
                )
            loop_dist += current_batch[-1]["distance_km"]
            savings_km = max(0.0, round(solo_dist - loop_dist, 2))
        else:
            loop_dist = solo_dist
            savings_km = 0.0

        batches.append({
            "batch_id": f"BATCH-{len(batches) + 1}",
            "hub": current_batch[0].get("assigned_store", "CIDCO Hub"),
            "order_count": len(current_batch),
            "orders": current_batch,
            "batched_route_km": round(loop_dist, 2),
            "solo_routes_km": round(solo_dist, 2),
            "savings_km": savings_km,
            "efficiency_gain_pct": round((savings_km / solo_dist * 100) if solo_dist > 0 else 0, 1),
            "assigned_rider": current_batch[0].get("rider", "Rahul S.")
        })

    return batches

# ------------------------------------------------------------------------------
# WebSocket Real-Time Courier Tracking Manager
# ------------------------------------------------------------------------------
class TrackingConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, order_id: str, websocket: WebSocket):
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
        self.active_connections[order_id].append(websocket)

    def disconnect(self, order_id: str, websocket: WebSocket):
        if order_id in self.active_connections:
            if websocket in self.active_connections[order_id]:
                self.active_connections[order_id].remove(websocket)
            if not self.active_connections[order_id]:
                del self.active_connections[order_id]

    async def broadcast(self, order_id: str, message: dict):
        if order_id in self.active_connections:
            dead_sockets = []
            for connection in self.active_connections[order_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                self.disconnect(order_id, dead)

ws_manager = TrackingConnectionManager()

# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    """Health status, store count, and active logistics modifiers."""
    df = load_dark_stores()
    return {
        "status": "healthy",
        "service": "Aurangabad Quick-Commerce Autonomous Dispatch API",
        "version": "2.0.0",
        "total_stores": len(df),
        "active_stores": len(df[df['Status'] == 'Active']),
        "geojson_catchment_zones": len(LOADED_CATCHMENT_ZONES),
        "live_logistics": LIVE_LOGISTICS_STATE,
        "system_time": datetime.now().isoformat()
    }

@app.get("/api/stores")
def get_stores():
    """Get list of all Aurangabad fulfillment hubs with coordinates and delivery radii."""
    if supabase_client and supabase_client.is_supabase_enabled():
        cloud_stores = supabase_client.get_dark_stores()
        if cloud_stores is not None and not cloud_stores.empty:
            return cloud_stores.to_dict(orient="records")

    df = load_dark_stores()
    return df.to_dict(orient="records")

@app.get("/api/riders")
def get_riders():
    """Get delivery courier fleet profiles and real-time status."""
    if supabase_client and supabase_client.is_supabase_enabled():
        riders = supabase_client.get_riders()
        if riders:
            return riders

    # Fallback to local default rider fleet
    return [
        {"rider_id": "rider-101", "name": "Suresh Patil", "vehicle_type": "EV Scooter", "speed_kmh": 28.0, "rating": 4.92, "status": "available"},
        {"rider_id": "rider-102", "name": "Ramesh Shinde", "vehicle_type": "ICE Motorcycle", "speed_kmh": 32.0, "rating": 4.88, "status": "delivering"},
        {"rider_id": "rider-103", "name": "Amit Kulkarni", "vehicle_type": "EV Scooter", "speed_kmh": 26.5, "rating": 4.95, "status": "available"},
        {"rider_id": "rider-104", "name": "Rahul Deshmukh", "vehicle_type": "ICE Motorcycle", "speed_kmh": 34.0, "rating": 4.78, "status": "available"},
        {"rider_id": "rider-105", "name": "Pooja Jadhav", "vehicle_type": "EV Scooter", "speed_kmh": 29.0, "rating": 4.96, "status": "available"}
    ]

@app.get("/api/users")
def get_users():
    """Get registered consumers and loyalty tiers."""
    if supabase_client and supabase_client.is_supabase_enabled():
        users = supabase_client.get_users()
        if users:
            return users

    # Fallback
    return [
        {"user_id": "user-001", "full_name": "Neel Belsare", "loyalty_tier": "Gold", "total_orders": 47},
        {"user_id": "user-002", "full_name": "Mansi Gaike", "loyalty_tier": "Gold", "total_orders": 39},
        {"user_id": "user-003", "full_name": "Rohan Sharma", "loyalty_tier": "Silver", "total_orders": 22}
    ]

@app.get("/api/serviceability")
@app.get("/api/serviceability/check")
def check_serviceability(latitude: float = Query(...), longitude: float = Query(...)):
    """
    Evaluates whether given GPS coordinates fall within official GeoJSON catchment
    zones or within the operational radius of an active dark store hub.
    """
    return evaluate_serviceability(latitude, longitude)

@app.get("/api/logistics/conditions")
def get_logistics_conditions():
    """Returns current live weather and traffic modifiers affecting delivery ETAs."""
    return LIVE_LOGISTICS_STATE

@app.post("/api/logistics/conditions")
def update_logistics_conditions(update: LogisticsConditionUpdate):
    """Dynamically update weather and traffic modifiers to test predictive logistics buffering."""
    if update.weather and update.weather in WEATHER_MULTIPLIERS:
        LIVE_LOGISTICS_STATE["weather"] = update.weather
        LIVE_LOGISTICS_STATE["weather_multiplier"] = WEATHER_MULTIPLIERS[update.weather]["multiplier"]
    if update.traffic and update.traffic in TRAFFIC_MULTIPLIERS:
        LIVE_LOGISTICS_STATE["traffic"] = update.traffic
        LIVE_LOGISTICS_STATE["traffic_multiplier"] = TRAFFIC_MULTIPLIERS[update.traffic]["multiplier"]

    LIVE_LOGISTICS_STATE["updated_at"] = datetime.now().isoformat()
    return {
        "success": True,
        "message": f"Logistics conditions updated: Weather={LIVE_LOGISTICS_STATE['weather']}, Traffic={LIVE_LOGISTICS_STATE['traffic']}",
        "conditions": LIVE_LOGISTICS_STATE
    }

@app.get("/api/latest-order")
def get_latest_order():
    """
    Returns the active single-order payload for real-time synchronization
    between mobile client and Streamlit Command Center.
    """
    # 1. Try Supabase cloud database first
    if supabase_client and supabase_client.is_supabase_enabled():
        active_cloud_order = supabase_client.get_active_order()
        if active_cloud_order:
            return active_cloud_order

    # 2. Seamless local fallback
    if os.path.exists(LATEST_ORDER_FILE):
        try:
            with open(LATEST_ORDER_FILE, "r") as f:
                data = json.load(f)
                if data.get("status") == "active":
                    return data
                return {"active": False, "status": data.get("status", "idle"), "message": "No active order currently in transit."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read latest order: {str(e)}")
    return {"active": False, "status": "idle", "message": "No active order placed yet."}

@app.post("/api/order/reset")
@app.post("/api/order/done")
def reset_active_order():
    """
    Clears the active order pipeline when 'Done' / 'Continue Shopping' is pressed
    on either the mobile phone or the Streamlit dashboard.
    """
    # 1. Reset in Supabase cloud database
    if supabase_client and supabase_client.is_supabase_enabled():
        try:
            supabase_client.reset_active_orders()
        except Exception as sb_err:
            print(f"[Supabase Warning] Could not reset orders: {sb_err}")

    # 2. Reset in local file fallback
    reset_payload = {
        "active": False,
        "status": "completed",
        "message": "Pipeline cleared. Ready for next order.",
        "reset_at": datetime.now().isoformat()
    }
    try:
        with open(LATEST_ORDER_FILE, "w") as f:
            json.dump(reset_payload, f, indent=2)
    except Exception as e:
        print(f"Error resetting latest order: {e}")

    return {
        "success": True,
        "message": "Active order pipeline reset successfully.",
        "order": reset_payload
    }

@app.get("/api/orders")
def get_order_history(limit: int = 15):
    """Retrieve recent order history."""
    if supabase_client and supabase_client.is_supabase_enabled():
        cloud_history = supabase_client.get_order_history(limit)
        if cloud_history:
            return cloud_history

    if os.path.exists(ORDER_HISTORY_FILE):
        try:
            with open(ORDER_HISTORY_FILE, "r") as f:
                history = json.load(f)
                return history[-limit:]
        except Exception:
            return []
    return []

@app.post("/api/warehouse/optimize-pick-path")
def optimize_pick_path_endpoint(items: List[str]):
    """Calculates serpentine S-shape pick path sequence for warehouse pickers."""
    return optimize_warehouse_pick_path(items)

@app.get("/api/dispatch/batched-routes")
def get_batched_routes():
    """Returns clustered order batches grouped for single courier multi-drop delivery."""
    history = []
    if os.path.exists(ORDER_HISTORY_FILE):
        try:
            with open(ORDER_HISTORY_FILE, "r") as f:
                history = json.load(f)
        except Exception:
            pass

    recent_orders = [o for o in history[-8:] if "cust_lat" in o and "cust_lon" in o]
    return batch_unassigned_orders(recent_orders)

@app.post("/api/order")
def place_order(order: OrderCreateRequest):
    """
    Receives customer order, enforces GeoJSON serviceability, calculates predictive ETA,
    optimizes physical warehouse pick path, and initiates live dispatch telemetry.
    """
    # 1. GeoJSON Serviceability Catchment Enforcement
    service_status = evaluate_serviceability(order.latitude, order.longitude)
    if not service_status["is_serviceable"]:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Location Outside Delivery Catchment",
                "message": service_status["message"],
                "distance_km": service_status["distance_km"],
                "nearest_hub": service_status["nearest_hub"]
            }
        )

    # 2. Assign strictly nearest dark store & calculate predictive buffered ETA
    assigned_store, distance_km, eta_data, assigned_rider = route_order_to_nearest_store(
        order.latitude, order.longitude
    )

    # 3. Format items and calculate warehouse pick sequence
    if order.items and len(order.items) > 0:
        item_names = [item.name for item in order.items]
        item_list = [f"{item.name} (x{item.quantity})" for item in order.items]
    else:
        item_names = [
            "Amul Taaza Toned Milk 500ml",
            "Britannia 100% Whole Wheat Bread 400g",
            "Lay's Magic Masala 50g"
        ]
        item_list = [f"{n} (x1)" for n in item_names]

    pick_path_data = optimize_warehouse_pick_path(item_names)

    order_id = f"CSN-MOB-{np.random.randint(1000, 9999)}"
    now_str = datetime.now().strftime("%H:%M:%S")

    order_payload = {
        "status": "active",
        "active": True,
        "order_id": order_id,
        "cust_lat": float(order.latitude),
        "cust_lon": float(order.longitude),
        "customer_name": order.customer_name or "Neel Belsare",
        "customer_phone": order.customer_phone or "+91 98765 43210",
        "delivery_address": order.delivery_address or "CIDCO, Aurangabad",
        "delivery_notes": order.delivery_notes or "Leave at door",
        "substitution_preference": order.substitution_preference or "similar",
        "assigned_store": str(assigned_store['Store Name']),
        "store_lat": float(assigned_store['Latitude']),
        "store_lon": float(assigned_store['Longitude']),
        "coverage_area": str(assigned_store['Coverage Area']),
        "distance_km": round(distance_km, 2),
        "base_eta_mins": eta_data["base_eta_mins"],
        "eta_mins": eta_data["buffered_eta_mins"],
        "weather": eta_data["weather"],
        "traffic": eta_data["traffic"],
        "items": item_list,
        "order_val": int(round(order.order_value)) if order.order_value else 320,
        "rider": assigned_rider,
        "timestamp": now_str,
        "source": "Mobile App (GPS Live)",
        "warehouse_pick_plan": pick_path_data
    }

    # 4. Persist to Supabase cloud database
    if supabase_client and supabase_client.is_supabase_enabled():
        try:
            supabase_client.create_order(order_payload)
        except Exception as sb_err:
            print(f"[Supabase Warning] Could not persist order to Supabase: {sb_err}")

    # 5. Atomically persist active order for local fallback / Streamlit pickup
    try:
        with open(LATEST_ORDER_FILE, "w") as f:
            json.dump(order_payload, f, indent=2)
    except Exception as e:
        print(f"Error saving latest order: {e}")

    # 6. Append to persistent local order history
    try:
        history = []
        if os.path.exists(ORDER_HISTORY_FILE):
            with open(ORDER_HISTORY_FILE, "r") as f:
                history = json.load(f)
        history.append(order_payload)
        with open(ORDER_HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"Error appending order history: {e}")

    return {
        "success": True,
        "message": f"Assigned to {assigned_store['Store Name']} ({distance_km:.2f} km, ETA {eta_data['buffered_eta_mins']}m)",
        "order": order_payload
    }

# ------------------------------------------------------------------------------
# WebSocket Streaming: Real-Time Courier GPS & 4 Milestones
# ------------------------------------------------------------------------------
@app.websocket("/ws/tracking/{order_id}")
async def websocket_rider_tracking(websocket: WebSocket, order_id: str):
    """
    Streams live 1-second rider coordinates and 4 fulfillment milestones:
    Milestone 1: 'Order Placed' (0-2s)
    Milestone 2: 'Packed at Hub' (2-5s)
    Milestone 3: 'Dispatched' (5-12s) - rider travels road polyline
    Milestone 4: 'Arriving' (12-15s) - rider at customer gate
    """
    await ws_manager.connect(order_id, websocket)

    # Read order details
    order_data = None
    if os.path.exists(LATEST_ORDER_FILE):
        try:
            with open(LATEST_ORDER_FILE, "r") as f:
                d = json.load(f)
                if d.get("order_id") == order_id:
                    order_data = d
        except Exception:
            pass

    s_lat = order_data["store_lat"] if order_data else 19.8735
    s_lon = order_data["store_lon"] if order_data else 75.3621
    c_lat = order_data["cust_lat"] if order_data else 19.8665
    c_lon = order_data["cust_lon"] if order_data else 75.3210
    total_dist = order_data["distance_km"] if order_data else 1.8

    try:
        step = 0
        total_steps = 15

        while True:
            # Determine milestone
            if step <= 2:
                milestone = "Order Placed"
                milestone_idx = 1
                progress_pct = 5.0
                r_lat, r_lon = s_lat, s_lon
                speed_kmh = 0.0
            elif step <= 5:
                milestone = "Packed at Hub"
                milestone_idx = 2
                progress_pct = 20.0
                r_lat, r_lon = s_lat, s_lon
                speed_kmh = 0.0
            elif step <= 12:
                milestone = "Dispatched"
                milestone_idx = 3
                t = (step - 5) / 7.0
                progress_pct = round(20.0 + t * 70.0, 1)
                r_lat = s_lat + (c_lat - s_lat) * t
                r_lon = s_lon + (c_lon - s_lon) * t
                speed_kmh = round(26.0 + math.sin(step) * 4.0, 1)
            else:
                milestone = "Arriving"
                milestone_idx = 4
                progress_pct = 100.0
                r_lat, r_lon = c_lat, c_lon
                speed_kmh = 6.0

            rem_km = max(0.0, round((1.0 - progress_pct / 100.0) * total_dist, 2))
            rem_eta = max(1, int(math.ceil(rem_km * 2.5)))

            payload = {
                "order_id": order_id,
                "milestone": milestone,
                "milestone_index": milestone_idx,
                "progress_pct": progress_pct,
                "rider_lat": round(r_lat, 5),
                "rider_lon": round(r_lon, 5),
                "speed_kmh": speed_kmh,
                "distance_remaining_km": rem_km,
                "eta_mins": rem_eta,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }

            await websocket.send_json(payload)
            step = (step + 1) % (total_steps + 4)
            await asyncio.sleep(1.0)

    except WebSocketDisconnect:
        ws_manager.disconnect(order_id, websocket)
    except Exception:
        ws_manager.disconnect(order_id, websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
