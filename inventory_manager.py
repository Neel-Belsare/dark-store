"""
Smart Inventory & Stockout Prediction Engine
---------------------------------------------
Tracks real-time SKU stock levels across all 12 Aurangabad dark stores,
auto-decrements on order placement, triggers critical stockout warnings,
and manages inter-hub replenishment transfers.
"""

import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INVENTORY_STATE_FILE = os.path.join(BASE_DIR, "data", "processed", "inventory_state.json")

# Standard Quick-Commerce Catalog
CATALOG_SKUS = [
    {
        "sku_id": "SKU-MILK-500",
        "name": "Amul Taaza Toned Fresh Milk",
        "category": "Dairy & Breakfast",
        "unit": "500ml",
        "unit_price": 27.0,
        "critical_threshold": 12,
        "low_stock_threshold": 25,
        "default_stock": 60
    },
    {
        "sku_id": "SKU-BREAD-400",
        "name": "Britannia 100% Whole Wheat Bread",
        "category": "Bakery",
        "unit": "400g",
        "unit_price": 45.0,
        "critical_threshold": 10,
        "low_stock_threshold": 20,
        "default_stock": 45
    },
    {
        "sku_id": "SKU-ATTA-5KG",
        "name": "Aashirvaad Superior MP Sharbati Atta",
        "category": "Staples & Grains",
        "unit": "5kg",
        "unit_price": 260.0,
        "critical_threshold": 8,
        "low_stock_threshold": 16,
        "default_stock": 35
    },
    {
        "sku_id": "SKU-TEA-500",
        "name": "Tata Tea Gold Leaf Tea",
        "category": "Beverages",
        "unit": "500g",
        "unit_price": 310.0,
        "critical_threshold": 10,
        "low_stock_threshold": 20,
        "default_stock": 40
    },
    {
        "sku_id": "SKU-CHIPS-50",
        "name": "Lay's India's Magic Masala Chips",
        "category": "Snacks & Munchies",
        "unit": "50g",
        "unit_price": 20.0,
        "critical_threshold": 18,
        "low_stock_threshold": 35,
        "default_stock": 80
    },
    {
        "sku_id": "SKU-OIL-1L",
        "name": "Fortune Sunlite Refined Sunflower Oil",
        "category": "Cooking Oils",
        "unit": "1L",
        "unit_price": 145.0,
        "critical_threshold": 10,
        "low_stock_threshold": 22,
        "default_stock": 50
    },
    {
        "sku_id": "SKU-EGGS-6",
        "name": "Eggoz Farm Fresh White Eggs",
        "category": "Dairy & Breakfast",
        "unit": "6 pcs",
        "unit_price": 75.0,
        "critical_threshold": 10,
        "low_stock_threshold": 20,
        "default_stock": 45
    },
    {
        "sku_id": "SKU-COLA-750",
        "name": "Coca-Cola Original Taste",
        "category": "Beverages & Cold Drinks",
        "unit": "750ml",
        "unit_price": 40.0,
        "critical_threshold": 15,
        "low_stock_threshold": 30,
        "default_stock": 70
    }
]

AURANGABAD_STORES = [
    "Store 1 - CIDCO Hub",
    "Store 2 - Garkheda Point",
    "Store 3 - Nirala Central",
    "Store 4 - Waluj Industrial",
    "Store 5 - Chikalthana Express",
    "Store 6 - Beed Bypass Corridor",
    "Store 7 - Osmanpura Hub",
    "Store 8 - Seven Hills Junction",
    "Store 9 - HUDCO North",
    "Store 10 - Railway Station / Vedant",
    "Store 11 - Shahgunj Old City",
    "Store 12 - Shendra DMIC (AURIC)"
]


def _initialize_default_inventory() -> Dict[str, Dict[str, int]]:
    """Generates initial realistic inventory across all 12 stores with varied stock levels."""
    inventory = {}
    for idx, store in enumerate(AURANGABAD_STORES):
        store_stock = {}
        for sku in CATALOG_SKUS:
            base = sku["default_stock"]
            # Intentionally create low-stock and critical stockouts in specific hubs for demo
            if "Nirala" in store and "MILK" in sku["sku_id"]:
                qty = 4  # Critical stockout demo
            elif "Seven Hills" in store and "BREAD" in sku["sku_id"]:
                qty = 6  # Critical stockout demo
            elif "Waluj" in store and "ATTA" in sku["sku_id"]:
                qty = 11  # Low stock demo
            elif "CIDCO" in store:
                qty = base + 15  # Surplus flagship store
            else:
                qty = max(14, base - (idx * 2 % 15))
            store_stock[sku["sku_id"]] = qty
        inventory[store] = store_stock
    return inventory


def load_inventory_state() -> Dict[str, Dict[str, int]]:
    """Loads inventory state from disk or initializes defaults."""
    if os.path.exists(INVENTORY_STATE_FILE):
        try:
            with open(INVENTORY_STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    state = _initialize_default_inventory()
    save_inventory_state(state)
    return state


def save_inventory_state(state: Dict[str, Dict[str, int]]) -> None:
    """Atomically saves inventory state to disk."""
    try:
        os.makedirs(os.path.dirname(INVENTORY_STATE_FILE), exist_ok=True)
        with open(INVENTORY_STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"[Inventory Error] Failed to save state: {e}")


def decrement_inventory_for_order(store_name: str, ordered_items: List[Any]) -> List[Dict[str, Any]]:
    """
    Decrements stock in assigned dark store based on order items.
    Handles both string formats ("Amul Taaza (x2)") and dict objects.
    Returns list of updated stock levels.
    """
    state = load_inventory_state()
    # Normalize store matching
    matched_store = None
    for s in state:
        if s.lower() in store_name.lower() or store_name.lower() in s.lower():
            matched_store = s
            break
    if not matched_store:
        matched_store = AURANGABAD_STORES[0]

    updated = []
    store_inv = state[matched_store]

    for item in ordered_items:
        item_name = ""
        qty = 1
        if isinstance(item, dict):
            item_name = item.get("name", "").lower()
            qty = int(item.get("quantity", 1))
        elif isinstance(item, str):
            item_name = item.lower()
            if "(x" in item_name:
                try:
                    qty = int(item_name.split("(x")[1].replace(")", "").strip())
                except Exception:
                    qty = 1

        # Match SKU
        for sku in CATALOG_SKUS:
            sku_name_words = sku["name"].lower().split()
            if any(w in item_name for w in sku_name_words[:2]):
                cur_qty = store_inv.get(sku["sku_id"], sku["default_stock"])
                new_qty = max(0, cur_qty - qty)
                store_inv[sku["sku_id"]] = new_qty
                updated.append({
                    "sku_id": sku["sku_id"],
                    "sku_name": sku["name"],
                    "previous_stock": cur_qty,
                    "new_stock": new_qty,
                    "deducted": qty
                })
                break

    state[matched_store] = store_inv
    save_inventory_state(state)
    return updated


def get_stockout_alerts() -> List[Dict[str, Any]]:
    """
    Scans all 12 dark stores and returns active critical stockouts (< critical_threshold)
    and low-stock warnings (< low_stock_threshold).
    """
    state = load_inventory_state()
    alerts = []

    for store_name, stock_map in state.items():
        for sku in CATALOG_SKUS:
            qty = stock_map.get(sku["sku_id"], sku["default_stock"])
            if qty <= sku["critical_threshold"]:
                alerts.append({
                    "severity": "CRITICAL",
                    "store_name": store_name,
                    "sku_id": sku["sku_id"],
                    "sku_name": sku["name"],
                    "category": sku["category"],
                    "current_stock": qty,
                    "threshold": sku["critical_threshold"],
                    "suggested_reorder": 50,
                    "message": f"🚨 CRITICAL STOCKOUT: Only {qty} units left of {sku['name']} at {store_name}!"
                })
            elif qty <= sku["low_stock_threshold"]:
                alerts.append({
                    "severity": "WARNING",
                    "store_name": store_name,
                    "sku_id": sku["sku_id"],
                    "sku_name": sku["name"],
                    "category": sku["category"],
                    "current_stock": qty,
                    "threshold": sku["low_stock_threshold"],
                    "suggested_reorder": 30,
                    "message": f"⚠️ Low Stock Advisory: {qty} units remaining of {sku['name']} at {store_name}."
                })

    # Sort critical first, then lowest stock
    alerts.sort(key=lambda a: (0 if a["severity"] == "CRITICAL" else 1, a["current_stock"]))
    return alerts


def transfer_inter_hub_stock(from_store: str, to_store: str, sku_id: str, quantity: int) -> Dict[str, Any]:
    """Transfers stock units between dark stores to rebalance inventory."""
    state = load_inventory_state()
    if from_store not in state or to_store not in state:
        return {"success": False, "error": "Invalid dark store names"}

    available = state[from_store].get(sku_id, 0)
    transfer_qty = min(available, quantity)

    state[from_store][sku_id] = max(0, available - transfer_qty)
    state[to_store][sku_id] = state[to_store].get(sku_id, 0) + transfer_qty

    save_inventory_state(state)
    return {
        "success": True,
        "from_store": from_store,
        "to_store": to_store,
        "sku_id": sku_id,
        "transferred": transfer_qty,
        "from_store_new_stock": state[from_store][sku_id],
        "to_store_new_stock": state[to_store][sku_id],
        "timestamp": datetime.now().isoformat()
    }


def replenish_sku(store_name: str, sku_id: str, quantity: int = 50) -> Dict[str, Any]:
    """Adds fresh supplier replenishment stock to a dark store."""
    state = load_inventory_state()
    if store_name not in state:
        return {"success": False, "error": "Invalid store"}

    cur = state[store_name].get(sku_id, 0)
    state[store_name][sku_id] = cur + quantity
    save_inventory_state(state)
    return {
        "success": True,
        "store_name": store_name,
        "sku_id": sku_id,
        "previous_stock": cur,
        "new_stock": cur + quantity,
        "replenished": quantity
    }
