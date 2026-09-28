"""
Supabase Cloud Database Client for Aurangabad Quick-Commerce Ecosystem
----------------------------------------------------------------------
Provides persistent cloud synchronization for live dark store dispatches,
orders, and telemetry with automatic zero-downtime offline fallback.
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
import pandas as pd

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(BASE_DIR, ".env"))
except ImportError:
    pass

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://wovfqutzuppauwretoiw.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

_client_instance: Optional[Client] = None
_connection_checked = False
_is_connected = False


def get_supabase_client() -> Optional[Client]:
    """Returns singleton Supabase client or None if unconfigured/unavailable."""
    global _client_instance, _connection_checked, _is_connected
    if not SUPABASE_AVAILABLE or not SUPABASE_URL or not SUPABASE_KEY:
        return None

    if _client_instance is None:
        try:
            _client_instance = create_client(SUPABASE_URL, SUPABASE_KEY)
            _is_connected = True
        except Exception as e:
            print(f"[Supabase Warning] Failed to initialize client: {e}")
            _client_instance = None
            _is_connected = False

    return _client_instance


def is_supabase_enabled() -> bool:
    """Checks if Supabase is properly configured and reachable."""
    client = get_supabase_client()
    return client is not None


# ------------------------------------------------------------------------------
# Orders Pipeline Operations
# ------------------------------------------------------------------------------

def create_order(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Inserts a newly placed order into the Supabase 'orders' table
    and associated items into 'order_items'.
    """
    client = get_supabase_client()
    if not client:
        return None

    try:
        order_record = {
            "order_id": payload.get("order_id"),
            "status": "active",
            "customer_name": payload.get("customer_name", "Customer"),
            "customer_phone": payload.get("customer_phone", "+91 98765 43210"),
            "delivery_address": payload.get("delivery_address", "CIDCO, Aurangabad"),
            "cust_lat": float(payload.get("cust_lat", 19.8735)),
            "cust_lon": float(payload.get("cust_lon", 75.3621)),
            "assigned_store": str(payload.get("assigned_store", "CIDCO Hub")),
            "store_lat": float(payload.get("store_lat", 19.8735)),
            "store_lon": float(payload.get("store_lon", 75.3621)),
            "coverage_area": str(payload.get("coverage_area", "CIDCO")),
            "distance_km": float(payload.get("distance_km", 1.2)),
            "base_eta_mins": float(payload.get("base_eta_mins", 8.0)),
            "eta_mins": float(payload.get("eta_mins", 10.0)),
            "weather": str(payload.get("weather", "Clear")),
            "traffic": str(payload.get("traffic", "Moderate")),
            "order_val": float(payload.get("order_val", 320.0)),
            "rider": str(payload.get("rider", "Suresh Patil")),
            "delivery_notes": str(payload.get("delivery_notes", "Leave at door")),
            "substitution_preference": str(payload.get("substitution_preference", "similar")),
            "items": payload.get("items", []),
            "warehouse_pick_plan": payload.get("warehouse_pick_plan", {}),
            "source": str(payload.get("source", "Mobile App (GPS Live)")),
            "created_at": datetime.now().isoformat()
        }

        # 1. Insert order record
        res = client.table("orders").insert(order_record).execute()
        created_data = res.data[0] if res.data else order_record

        # 2. Insert line items if present
        raw_items = payload.get("items", [])
        if raw_items:
            item_records = []
            for item in raw_items:
                if isinstance(item, dict):
                    item_records.append({
                        "order_id": payload.get("order_id"),
                        "item_name": item.get("name", "Item"),
                        "quantity": int(item.get("quantity", 1)),
                        "unit_price": float(item.get("price", 0.0))
                    })
                elif isinstance(item, str):
                    item_records.append({
                        "order_id": payload.get("order_id"),
                        "item_name": item,
                        "quantity": 1,
                        "unit_price": 0.0
                    })
            if item_records:
                try:
                    client.table("order_items").insert(item_records).execute()
                except Exception as item_err:
                    print(f"[Supabase Warning] Could not insert order_items: {item_err}")

        return created_data
    except Exception as e:
        print(f"[Supabase Error] Failed to insert order: {e}")
        return None


def get_active_order() -> Optional[Dict[str, Any]]:
    """
    Retrieves the current single active order from Supabase.
    Returns None if no active order is in flight.
    """
    client = get_supabase_client()
    if not client:
        return None

    try:
        res = client.table("orders") \
            .select("*") \
            .eq("status", "active") \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        if res.data and len(res.data) > 0:
            row = res.data[0]
            # Format row to match the exact schema expected by Streamlit & API
            return {
                "active": True,
                "status": "active",
                "order_id": row.get("order_id"),
                "cust_lat": row.get("cust_lat"),
                "cust_lon": row.get("cust_lon"),
                "customer_name": row.get("customer_name"),
                "customer_phone": row.get("customer_phone"),
                "delivery_address": row.get("delivery_address"),
                "delivery_notes": row.get("delivery_notes"),
                "substitution_preference": row.get("substitution_preference"),
                "assigned_store": row.get("assigned_store"),
                "store_lat": row.get("store_lat"),
                "store_lon": row.get("store_lon"),
                "coverage_area": row.get("coverage_area"),
                "distance_km": row.get("distance_km"),
                "base_eta_mins": row.get("base_eta_mins"),
                "eta_mins": row.get("eta_mins"),
                "weather": row.get("weather"),
                "traffic": row.get("traffic"),
                "items": row.get("items") or [],
                "order_val": row.get("order_val"),
                "rider": row.get("rider"),
                "timestamp": row.get("created_at", datetime.now().isoformat()),
                "source": row.get("source", "Mobile App (GPS Live)"),
                "warehouse_pick_plan": row.get("warehouse_pick_plan") or {}
            }
        return None
    except Exception as e:
        print(f"[Supabase Error] Failed to fetch active order: {e}")
        return None


def reset_active_orders() -> bool:
    """
    Marks all currently active orders in Supabase as completed.
    Called when 'Done / Reset' is triggered.
    """
    client = get_supabase_client()
    if not client:
        return False

    try:
        now_str = datetime.now().isoformat()
        client.table("orders") \
            .update({"status": "completed", "completed_at": now_str}) \
            .eq("status", "active") \
            .execute()
        return True
    except Exception as e:
        print(f"[Supabase Error] Failed to reset active orders: {e}")
        return False


def get_order_history(limit: int = 15) -> List[Dict[str, Any]]:
    """Fetches recent order history from Supabase."""
    client = get_supabase_client()
    if not client:
        return []

    try:
        res = client.table("orders") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase Error] Failed to fetch order history: {e}")
        return []


def get_dark_stores() -> Optional[pd.DataFrame]:
    """Fetches the 12 Aurangabad dark stores from Supabase table."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        res = client.table("dark_stores").select("*").execute()
        if res.data and len(res.data) > 0:
            df = pd.DataFrame(res.data)
            # Normalize column names to match local CSV expectations
            column_mapping = {
                "store_name": "Store Name",
                "coverage_area": "Coverage Area",
                "latitude": "Latitude",
                "longitude": "Longitude",
                "delivery_radius_km": "Delivery Radius (km)",
                "status": "Status"
            }
            return df.rename(columns=column_mapping)
        return None
    except Exception as e:
        print(f"[Supabase Error] Failed to fetch dark stores: {e}")
        return None
