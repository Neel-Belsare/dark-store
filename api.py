"""
FastAPI Bridge for Aurangabad Quick-Commerce Mobile App (Blinkit Clone)
----------------------------------------------------------------------
Connects the React Native / Expo mobile app to the Streamlit Dark Store
Command Center in real time.

Endpoints:
- POST /api/order         : Dispatches a customer order from mobile GPS coordinates
- GET  /api/latest-order  : Returns current active telemetry order
- GET  /api/orders        : Returns list of recent dispatched orders
- GET  /api/stores        : Returns list of dark stores and coverage details
- GET  /api/health        : Health check endpoint
"""

import os
import json
import numpy as np
import pandas as pd
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LATEST_ORDER_FILE = os.path.join(BASE_DIR, "latest_order.json")
ORDER_HISTORY_FILE = os.path.join(BASE_DIR, "order_history.json")
STORES_CSV = os.path.join(BASE_DIR, "data", "processed", "aurangabad_dark_stores.csv")

app = FastAPI(
    title="Aurangabad Dark Store Real-Time Dispatch API",
    description="Bridge connecting Blinkit-clone mobile app orders to Streamlit 3D Command Center",
    version="1.0.0"
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
    
    # Built-in fallback matching app.py dataset
    stores = [
        {'Store Name': 'Store 1 - CIDCO Hub', 'Coverage Area': 'CIDCO N-1 to N-7, Cannaught, Town Centre', 'Latitude': 19.8735, 'Longitude': 75.3621, 'Delivery Radius (km)': 3.0, 'Status': 'Active'},
        {'Store Name': 'Store 2 - Garkheda Point', 'Coverage Area': 'Garkheda, Ulkanagari, Sutgirni Chowk', 'Latitude': 19.8596, 'Longitude': 75.3512, 'Delivery Radius (km)': 3.2, 'Status': 'Active'},
        {'Store Name': 'Store 3 - Nirala Central', 'Coverage Area': 'Nirala Bazar, Samarth Nagar, Khadkeshwar', 'Latitude': 19.8821, 'Longitude': 75.3245, 'Delivery Radius (km)': 2.5, 'Status': 'Active'},
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
    eta_mins = int(round(3.5 + distance_km * 2.8))

    rider_pool = [
        "Rahul S. (Rider #18)",
        "Vikram M. (Rider #07)",
        "Amit P. (Rider #23)",
        "Sachin K. (Rider #12)",
        "Gaurav D. (Rider #31)"
    ]
    assigned_rider = str(np.random.choice(rider_pool))

    return assigned_store, distance_km, eta_mins, assigned_rider

# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    """Health status and store count."""
    df = load_dark_stores()
    return {
        "status": "healthy",
        "service": "Aurangabad Dark Store API Bridge",
        "total_stores": len(df),
        "active_stores": len(df[df['Status'] == 'Active']),
        "system_time": datetime.now().isoformat()
    }

@app.get("/api/stores")
def get_stores():
    """Get list of all Aurangabad fulfillment hubs."""
    df = load_dark_stores()
    return df.to_dict(orient="records")

@app.get("/api/latest-order")
def get_latest_order():
    """Get the most recent order payload synced with the Streamlit dashboard."""
    if os.path.exists(LATEST_ORDER_FILE):
        try:
            with open(LATEST_ORDER_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read latest order: {str(e)}")
    raise HTTPException(status_code=404, detail="No active order has been placed yet.")

@app.get("/api/orders")
def get_order_history(limit: int = 10):
    """Retrieve recent order history."""
    if os.path.exists(ORDER_HISTORY_FILE):
        try:
            with open(ORDER_HISTORY_FILE, "r") as f:
                history = json.load(f)
                return history[-limit:]
        except Exception:
            return []
    return []

@app.post("/api/order")
def place_order(order: OrderCreateRequest):
    """
    Receives mobile app order coordinates, routes to nearest dark store,
    and updates Streamlit's live telemetry queue.
    """
    if not (19.6 <= order.latitude <= 20.2 and 75.1 <= order.longitude <= 75.6):
        # Coordinates outside Aurangabad metropolitan boundary
        pass  # We still process but note it in distance

    assigned_store, distance_km, eta_mins, assigned_rider = route_order_to_nearest_store(
        order.latitude, order.longitude
    )

    # Format item names
    if order.items and len(order.items) > 0:
        item_list = [f"{item.name} (x{item.quantity})" for item in order.items]
    else:
        item_list = [
            "Amul Taaza Toned Milk 500ml",
            "Britannia 100% Whole Wheat Bread 400g",
            "Lay's Magic Masala 50g"
        ]

    order_id = f"CSN-MOB-{np.random.randint(1000, 9999)}"
    now_str = datetime.now().strftime("%H:%M:%S")

    order_payload = {
        "order_id": order_id,
        "cust_lat": float(order.latitude),
        "cust_lon": float(order.longitude),
        "customer_name": order.customer_name,
        "delivery_address": order.delivery_address,
        "assigned_store": str(assigned_store['Store Name']),
        "store_lat": float(assigned_store['Latitude']),
        "store_lon": float(assigned_store['Longitude']),
        "coverage_area": str(assigned_store['Coverage Area']),
        "distance_km": round(distance_km, 2),
        "eta_mins": eta_mins,
        "items": item_list,
        "order_val": int(round(order.order_value)) if order.order_value else 320,
        "rider": assigned_rider,
        "timestamp": now_str,
        "source": "Mobile App (GPS)"
    }

    # 1. Update latest order file for Streamlit live pickup
    try:
        with open(LATEST_ORDER_FILE, "w") as f:
            json.dump(order_payload, f, indent=2)
    except Exception as e:
        print(f"Error saving latest order: {e}")

    # 2. Append to order history
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
        "message": f"Order assigned to {assigned_store['Store Name']} ({distance_km:.2f} km)",
        "order": order_payload
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
