import os
import json
import glob
import time
import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pydeck as pdk
import folium
from streamlit_folium import folium_static
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Supabase Cloud Database Client
try:
    import supabase_client
except ImportError:
    supabase_client = None

# Smart Inventory & Stockout Prediction Engine
try:
    import inventory_manager
except ImportError:
    inventory_manager = None

# ------------------------------------------------------------------------------
# 1. Page Configuration
# ------------------------------------------------------------------------------
st.set_page_config(
    page_title="Aurangabad Dark Store Command Center v3.0",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ------------------------------------------------------------------------------
# 2. UI Styling & Design System Injection (Command Center Theme)
# ------------------------------------------------------------------------------
st.markdown("""
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
    :root {
        --bg: #f4f6fb;
        --card: #ffffff;
        --line: #e4e8f1;
        --tx: #0f172a;
        --mut: #64748b;
        --acc: #6366f1;
        --acc2: #06b6d4;
        --warn: #f59e0b;
        --ok: #10b981;
        --glow: rgba(99, 102, 241, 0.12);
    }

    /* Global App Background & Typography */
    .stApp {
        background-color: var(--bg) !important;
        background-image: 
            radial-gradient(900px 400px at 10% -10%, var(--glow), transparent),
            radial-gradient(700px 400px at 100% 0, rgba(6, 182, 212, 0.12), transparent) !important;
        color: var(--tx) !important;
        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: var(--card) !important;
        border-right: 1px solid var(--line) !important;
    }

    /* Preserve Material Symbols Ligatures for Streamlit Collapse Arrow & Icons */
    [data-testid="stIconMaterial"],
    [data-testid="stSidebarCollapseButton"] span,
    [data-testid="stSidebarCollapseButton"] button,
    button[data-testid="baseButton-headerNoPadding"] span,
    .material-symbols-rounded,
    .material-symbols-outlined,
    .material-icons {
        font-family: 'Material Symbols Rounded', 'Material Symbols Outlined', 'Material Icons' !important;
        font-style: normal;
        text-transform: none;
        letter-spacing: normal;
        word-wrap: normal;
        white-space: nowrap;
        direction: ltr;
    }

    /* Header & Live Network Indicator */
    .header-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 24px;
        padding-top: 4px;
    }
    .header-box h1 {
        font-size: 28px;
        margin: 0;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--tx);
        line-height: 1.2;
    }
    .header-box h1 span {
        background: linear-gradient(90deg, var(--acc), var(--acc2));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
    }
    .header-box .sub {
        color: var(--mut);
        font-size: 14px;
        margin: 6px 0 0;
        font-weight: 400;
    }
    .live {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--ok);
        background: rgba(16, 185, 129, 0.12);
        padding: 7px 14px;
        border-radius: 99px;
        font-weight: 600;
        letter-spacing: 0.02em;
    }
    .live i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ok);
        box-shadow: 0 0 0 0 var(--ok);
        animation: pulse-dot 1.8s infinite;
    }
    @keyframes pulse-dot {
        70% { box-shadow: 0 0 0 8px transparent; }
    }

    /* KPI Metrics Cards Grid */
    .kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 14px;
        margin: 20px 0 28px 0;
    }
    .card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 18px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.08);
    }
    .kpi {
        position: relative;
        overflow: hidden;
    }
    .kpi:before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 3px;
        width: 100%;
        background: linear-gradient(90deg, var(--acc), var(--acc2));
    }
    .kpi small {
        color: var(--mut);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 600;
        display: block;
    }
    .kpi b {
        display: block;
        font-size: 30px;
        margin: 6px 0 4px;
        letter-spacing: -0.02em;
        font-weight: 800;
        color: var(--tx);
        line-height: 1.1;
    }
    .kpi em {
        font-style: normal;
        font-size: 12px;
        font-weight: 600;
        color: var(--ok);
    }

    /* Tab Navigation (Command Center Style) */
    div[data-baseweb="tab-list"] {
        display: flex !important;
        gap: 6px !important;
        overflow-x: auto !important;
        background: var(--card) !important;
        border: 1px solid var(--line) !important;
        padding: 6px !important;
        border-radius: 14px !important;
        margin-bottom: 24px !important;
    }
    div[data-baseweb="tab-highlight"] {
        display: none !important;
    }
    button[data-baseweb="tab"] {
        border: 0 !important;
        background: none !important;
        color: var(--mut) !important;
        font: 600 13px 'Inter', sans-serif !important;
        padding: 10px 16px !important;
        border-radius: 10px !important;
        white-space: nowrap !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
    }
    button[data-baseweb="tab"]:hover {
        color: var(--acc) !important;
        background: var(--glow) !important;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        background: linear-gradient(135deg, var(--acc), #8b5cf6) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25) !important;
    }

    /* Executive Summary Grid & Alert Rows */
    .grid {
        display: grid;
        grid-template-columns: 1.25fr 1fr;
        gap: 16px;
    }
    @media (max-width: 860px) {
        .grid { grid-template-columns: 1fr; }
    }
    h2.card-title {
        font-size: 16px;
        margin: 0 0 4px;
        font-weight: 700;
        color: var(--tx);
    }
    .hint {
        color: var(--mut);
        font-size: 12.5px;
        margin: 0 0 14px;
        font-weight: 400;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--line);
        margin-bottom: 8px;
        background: #ffffff;
    }
    .row .n {
        flex: 1;
        min-width: 0;
    }
    .row strong {
        font-size: 14px;
        color: var(--tx);
        display: block;
    }
    .row span {
        display: block;
        color: var(--mut);
        font-size: 12px;
        margin-top: 2px;
    }
    .bar {
        height: 6px;
        border-radius: 9px;
        background: var(--line);
        margin-top: 8px;
        overflow: hidden;
    }
    .bar i {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, var(--warn), #ef4444);
        border-radius: 9px;
    }
    .tag {
        font-size: 11px;
        font-weight: 700;
        color: var(--warn);
        background: rgba(245, 158, 11, 0.14);
        padding: 5px 9px;
        border-radius: 99px;
        white-space: nowrap;
    }

    /* Donut Box Layout */
    .donutbox {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        padding: 6px 0;
    }
    .leg div {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        margin: 6px 0;
        color: var(--mut);
        font-weight: 500;
    }
    .leg i {
        width: 10px;
        height: 10px;
        border-radius: 3px;
    }

    /* Custom Table with Rank Badges */
    .tbl {
        overflow-x: auto;
    }
    table.custom-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13.5px;
        min-width: 520px;
    }
    table.custom-table th {
        color: var(--mut);
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        text-align: left;
        padding: 10px;
        border-bottom: 1px solid var(--line);
    }
    table.custom-table td {
        padding: 13px 10px;
        border-bottom: 1px solid var(--line);
        color: var(--tx);
        font-weight: 500;
    }
    table.custom-table td.r, table.custom-table th.r {
        text-align: right;
    }
    .rk {
        display: inline-grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: var(--glow);
        color: var(--acc);
        font-weight: 800;
        font-size: 12px;
        margin-right: 10px;
    }
    tr:first-child .rk, table.custom-table tr:first-child td .rk {
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: #fff;
    }

    /* Hide Default Footer */
    footer { visibility: hidden; }

    /* Custom Floating Attribution Footer */
    .custom-footer {
        position: fixed;
        right: 20px;
        bottom: 14px;
        z-index: 999999;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        background: var(--card);
        padding: 8px 16px;
        border-radius: 99px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--line);
        color: var(--mut);
    }
    .custom-footer a {
        color: var(--acc);
        text-decoration: none;
        font-weight: 600;
    }
    .custom-footer a:hover {
        text-decoration: underline;
    }
</style>
<div class="custom-footer">
    Made by <a href="https://www.linkedin.com/in/neel-belsare-719b9a314/" target="_blank">Neel Belsare</a> & <a href="https://www.linkedin.com/in/mansi-gaike-821260316" target="_blank">Mansi Gaike</a>
</div>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 3. Cached Data Ingestion & Synthesis Functions
# ------------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@st.cache_data
def load_demographics_data():
    """Load Aurangabad neighborhood demographic and order prediction data with fallback generation."""
    data_path = os.path.join(BASE_DIR, "data", "processed", "Merged_Aurangabad_Dark_Store_Data.csv")
    if os.path.exists(data_path):
        return pd.read_csv(data_path)
    
    neighborhoods = [
        {'Neighborhood': 'CIDCO (N-1 to N-12)', 'Latitude': 19.8735, 'Longitude': 75.3621, 'Estimated Population (2024)_x': 185000, 'Population Density (per sq km)': 14200, 'Growth Rate (%)': 4.2, 'Internet Penetration Rate (%)': 84.5, 'E-Commerce Activity Index (1-10)': 9},
        {'Neighborhood': 'Garkheda', 'Latitude': 19.8596, 'Longitude': 75.3512, 'Estimated Population (2024)_x': 142000, 'Population Density (per sq km)': 12500, 'Growth Rate (%)': 4.8, 'Internet Penetration Rate (%)': 82.0, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Nirala Bazar', 'Latitude': 19.8821, 'Longitude': 75.3245, 'Estimated Population (2024)_x': 78000, 'Population Density (per sq km)': 19500, 'Growth Rate (%)': 2.1, 'Internet Penetration Rate (%)': 86.5, 'E-Commerce Activity Index (1-10)': 9},
        {'Neighborhood': 'Waluj MIDC', 'Latitude': 19.8327, 'Longitude': 75.2285, 'Estimated Population (2024)_x': 165000, 'Population Density (per sq km)': 8200, 'Growth Rate (%)': 5.2, 'Internet Penetration Rate (%)': 72.0, 'E-Commerce Activity Index (1-10)': 7},
        {'Neighborhood': 'Chikalthana MIDC', 'Latitude': 19.8752, 'Longitude': 75.3951, 'Estimated Population (2024)_x': 95000, 'Population Density (per sq km)': 7800, 'Growth Rate (%)': 4.5, 'Internet Penetration Rate (%)': 78.5, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Beed Bypass', 'Latitude': 19.8450, 'Longitude': 75.3410, 'Estimated Population (2024)_x': 128000, 'Population Density (per sq km)': 9400, 'Growth Rate (%)': 6.1, 'Internet Penetration Rate (%)': 80.5, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Osmanpura', 'Latitude': 19.8680, 'Longitude': 75.3230, 'Estimated Population (2024)_x': 82000, 'Population Density (per sq km)': 15800, 'Growth Rate (%)': 2.4, 'Internet Penetration Rate (%)': 85.0, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Seven Hills / Jalna Rd', 'Latitude': 19.8722, 'Longitude': 75.3540, 'Estimated Population (2024)_x': 91000, 'Population Density (per sq km)': 16200, 'Growth Rate (%)': 3.1, 'Internet Penetration Rate (%)': 83.0, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Kranti Chowk', 'Latitude': 19.8745, 'Longitude': 75.3280, 'Estimated Population (2024)_x': 74000, 'Population Density (per sq km)': 21000, 'Growth Rate (%)': 1.8, 'Internet Penetration Rate (%)': 84.0, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Cannaught / Town Centre', 'Latitude': 19.8810, 'Longitude': 75.3660, 'Estimated Population (2024)_x': 88000, 'Population Density (per sq km)': 13600, 'Growth Rate (%)': 3.8, 'Internet Penetration Rate (%)': 88.0, 'E-Commerce Activity Index (1-10)': 9},
        {'Neighborhood': 'HUDCO', 'Latitude': 19.9050, 'Longitude': 75.3480, 'Estimated Population (2024)_x': 135000, 'Population Density (per sq km)': 11800, 'Growth Rate (%)': 3.5, 'Internet Penetration Rate (%)': 76.0, 'E-Commerce Activity Index (1-10)': 7},
        {'Neighborhood': 'Railway Station / Vedant Nagar', 'Latitude': 19.8580, 'Longitude': 75.3190, 'Estimated Population (2024)_x': 69000, 'Population Density (per sq km)': 14500, 'Growth Rate (%)': 2.2, 'Internet Penetration Rate (%)': 79.0, 'E-Commerce Activity Index (1-10)': 7},
        {'Neighborhood': 'Ulkanagari', 'Latitude': 19.8615, 'Longitude': 75.3420, 'Estimated Population (2024)_x': 58000, 'Population Density (per sq km)': 13100, 'Growth Rate (%)': 3.4, 'Internet Penetration Rate (%)': 85.5, 'E-Commerce Activity Index (1-10)': 8},
        {'Neighborhood': 'Begumpura / University', 'Latitude': 19.9010, 'Longitude': 75.3120, 'Estimated Population (2024)_x': 62000, 'Population Density (per sq km)': 9100, 'Growth Rate (%)': 2.8, 'Internet Penetration Rate (%)': 81.0, 'E-Commerce Activity Index (1-10)': 7},
        {'Neighborhood': 'Shendra MIDC / AURIC', 'Latitude': 19.8850, 'Longitude': 75.4850, 'Estimated Population (2024)_x': 45000, 'Population Density (per sq km)': 3200, 'Growth Rate (%)': 8.5, 'Internet Penetration Rate (%)': 75.0, 'E-Commerce Activity Index (1-10)': 7},
        {'Neighborhood': 'Harsul', 'Latitude': 19.9230, 'Longitude': 75.3520, 'Estimated Population (2024)_x': 86000, 'Population Density (per sq km)': 8900, 'Growth Rate (%)': 4.1, 'Internet Penetration Rate (%)': 71.0, 'E-Commerce Activity Index (1-10)': 6},
        {'Neighborhood': 'Shahgunj', 'Latitude': 19.8860, 'Longitude': 75.3340, 'Estimated Population (2024)_x': 92000, 'Population Density (per sq km)': 24000, 'Growth Rate (%)': 1.6, 'Internet Penetration Rate (%)': 74.0, 'E-Commerce Activity Index (1-10)': 7},
        {'Neighborhood': 'Mukundwadi', 'Latitude': 19.8710, 'Longitude': 75.3780, 'Estimated Population (2024)_x': 110000, 'Population Density (per sq km)': 13800, 'Growth Rate (%)': 4.0, 'Internet Penetration Rate (%)': 75.0, 'E-Commerce Activity Index (1-10)': 7}
    ]
    df = pd.DataFrame(neighborhoods)
    df['Projected Population (2025)'] = (df['Estimated Population (2024)_x'] * (1 + df['Growth Rate (%)'] / 100)).astype(int)
    df['Estimated Online Shoppers'] = (df['Estimated Population (2024)_x'] * (df['Internet Penetration Rate (%)'] / 100)).astype(int)
    df['Predicted Online Order Volume (Monthly)'] = (df['Estimated Online Shoppers'] * (df['E-Commerce Activity Index (1-10)'] / 10) * 1.15).astype(int)
    return df

@st.cache_data
def load_dark_stores_data():
    """Load Aurangabad dark store locations, delivery radius, and operational status."""
    stores_path = os.path.join(BASE_DIR, "data", "processed", "aurangabad_dark_stores.csv")
    if os.path.exists(stores_path):
        return pd.read_csv(stores_path)
    
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

@st.cache_data
def load_climate_impact_data():
    """Load Aurangabad climate data and delivery impact scales."""
    climate_path = os.path.join(BASE_DIR, "data", "processed", "Aurangabad_Climate_Delivery_Impact.csv")
    if os.path.exists(climate_path):
        return pd.read_csv(climate_path)
    
    climate = [
        {'Month': 'January', 'Avg High Temp (°C)': 29.8, 'Avg Low Temp (°C)': 12.2, 'Avg Rainfall (mm)': 2.1, 'Delivery Impact Scale (1-5)': 1},
        {'Month': 'February', 'Avg High Temp (°C)': 32.7, 'Avg Low Temp (°C)': 14.8, 'Avg Rainfall (mm)': 1.8, 'Delivery Impact Scale (1-5)': 1},
        {'Month': 'March', 'Avg High Temp (°C)': 36.9, 'Avg Low Temp (°C)': 19.4, 'Avg Rainfall (mm)': 4.5, 'Delivery Impact Scale (1-5)': 2},
        {'Month': 'April', 'Avg High Temp (°C)': 39.8, 'Avg Low Temp (°C)': 23.6, 'Avg Rainfall (mm)': 8.2, 'Delivery Impact Scale (1-5)': 3},
        {'Month': 'May', 'Avg High Temp (°C)': 40.5, 'Avg Low Temp (°C)': 25.1, 'Avg Rainfall (mm)': 22.0, 'Delivery Impact Scale (1-5)': 3},
        {'Month': 'June', 'Avg High Temp (°C)': 34.2, 'Avg Low Temp (°C)': 23.5, 'Avg Rainfall (mm)': 142.5, 'Delivery Impact Scale (1-5)': 4},
        {'Month': 'July', 'Avg High Temp (°C)': 30.1, 'Avg Low Temp (°C)': 22.1, 'Avg Rainfall (mm)': 185.0, 'Delivery Impact Scale (1-5)': 5},
        {'Month': 'August', 'Avg High Temp (°C)': 29.0, 'Avg Low Temp (°C)': 21.4, 'Avg Rainfall (mm)': 160.0, 'Delivery Impact Scale (1-5)': 4},
        {'Month': 'September', 'Avg High Temp (°C)': 30.5, 'Avg Low Temp (°C)': 21.0, 'Avg Rainfall (mm)': 135.0, 'Delivery Impact Scale (1-5)': 4},
        {'Month': 'October', 'Avg High Temp (°C)': 32.1, 'Avg Low Temp (°C)': 18.5, 'Avg Rainfall (mm)': 55.0, 'Delivery Impact Scale (1-5)': 2},
        {'Month': 'November', 'Avg High Temp (°C)': 30.2, 'Avg Low Temp (°C)': 14.5, 'Avg Rainfall (mm)': 12.0, 'Delivery Impact Scale (1-5)': 1},
        {'Month': 'December', 'Avg High Temp (°C)': 29.1, 'Avg Low Temp (°C)': 12.0, 'Avg Rainfall (mm)': 3.0, 'Delivery Impact Scale (1-5)': 1}
    ]
    return pd.DataFrame(climate)

@st.cache_data
def get_forecasting_engine():
    """Train linear regression demand forecasting model on Aurangabad key localities."""
    np.random.seed(42)
    dates = pd.date_range(start='2024-01-01', periods=365, freq='D')
    
    demand = (
        np.random.randint(60, 480, size=len(dates))
        + np.sin(np.linspace(0, 12, len(dates))) * 45
        + (dates.dayofweek >= 5) * 35
    )
    localities = np.random.choice(
        ['CIDCO', 'Garkheda', 'Nirala Bazar', 'Waluj', 'Chikalthana', 'Beed Bypass', 'Osmanpura'],
        len(dates)
    )
    df_raw = pd.DataFrame({'Date': dates, 'Locality': localities, 'Demand': demand})

    df_encoded = df_raw.copy()
    df_encoded['DayOfYear'] = df_encoded['Date'].dt.dayofyear
    df_encoded['IsWeekend'] = (df_encoded['Date'].dt.dayofweek >= 5).astype(int)
    df_encoded = pd.get_dummies(df_encoded, columns=['Locality'], drop_first=True)
    df_encoded.set_index('Date', inplace=True)

    X = df_encoded.drop(columns=['Demand'])
    y = df_encoded['Demand']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))
    r2 = r2_score(y_test, y_pred)

    return df_raw, df_encoded, model, X_train, y_test, y_pred, mae, rmse, r2

# Load initial datasets
df_demographics = load_demographics_data()
df_stores = load_dark_stores_data()
df_climate = load_climate_impact_data()

# ------------------------------------------------------------------------------
# Geospatial Routing & Order Simulation Engine (Haversine Logic)
# ------------------------------------------------------------------------------
def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate great circle distance between two coordinates in kilometers."""
    R = 6371.0
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
    return 2 * R * np.arcsin(np.sqrt(a))

def generate_mock_customer_order(df_stores):
    """Generate a random customer coordinate within the delivery catchment radius of an active store."""
    active_stores = df_stores[df_stores['Status'] == 'Active'].copy()
    if active_stores.empty:
        active_stores = df_stores.copy()
    
    seed_store = active_stores.sample(1).iloc[0]
    max_r = max(1.2, float(seed_store['Delivery Radius (km)']) * 0.85)
    r = float(np.random.uniform(0.35, max_r))
    theta = float(np.random.uniform(0, 2 * np.pi))
    dlat = (r * np.cos(theta)) / 111.32
    dlon = (r * np.sin(theta)) / (111.32 * np.cos(np.radians(seed_store['Latitude'])))
    
    cust_lat = float(seed_store['Latitude'] + dlat)
    cust_lon = float(seed_store['Longitude'] + dlon)
    
    active_stores['Dist_to_Customer'] = active_stores.apply(
        lambda s: haversine_distance(cust_lat, cust_lon, s['Latitude'], s['Longitude']),
        axis=1
    )
    assigned_store = active_stores.sort_values('Dist_to_Customer').iloc[0]
    distance_km = float(assigned_store['Dist_to_Customer'])
    eta_mins = int(round(3.5 + distance_km * 2.8))
    
    mock_items = [
        "Amul Taaza Homogenised Toned Milk 500ml (x2)",
        "Aashirvaad Shudh Chakki Atta 5kg",
        "Fortune Sunlite Refined Sunflower Oil 1L",
        "Amul Pasteurized Salted Butter 100g",
        "Lay's India's Magic Masala Potato Chips 50g",
        "Coca-Cola Zero Sugar 750ml",
        "Britannia 100% Whole Wheat Bread 400g",
        "Tata Salt Vacuum Evaporated Iodized 1kg",
        "Cadbury Dairy Milk Silk Chocolate 150g",
        "Epigamia Greek Yogurt Natural 90g"
    ]
    num_items = int(np.random.randint(2, 5))
    selected_items = np.random.choice(mock_items, size=num_items, replace=False).tolist()
    order_val = int(np.random.randint(180, 850))
    order_id = f"CSN-{np.random.randint(1000, 9999)}"
    rider_names = [
        "Rahul S. (Rider #18)",
        "Vikram M. (Rider #07)",
        "Amit P. (Rider #23)",
        "Sachin K. (Rider #12)",
        "Gaurav D. (Rider #31)"
    ]
    assigned_rider = str(np.random.choice(rider_names))
    
    return {
        "order_id": order_id,
        "cust_lat": cust_lat,
        "cust_lon": cust_lon,
        "assigned_store": assigned_store['Store Name'],
        "store_lat": float(assigned_store['Latitude']),
        "store_lon": float(assigned_store['Longitude']),
        "coverage_area": assigned_store['Coverage Area'],
        "distance_km": distance_km,
        "eta_mins": eta_mins,
        "items": selected_items,
        "order_val": order_val,
        "rider": assigned_rider,
        "timestamp": pd.Timestamp.now().strftime("%H:%M:%S")
    }

def check_for_external_order():
    """Check if an incoming mobile order was submitted via Supabase Cloud or FastAPI bridge."""
    # 1. Try Supabase cloud database first
    if supabase_client and supabase_client.is_supabase_enabled():
        try:
            active_cloud_order = supabase_client.get_active_order()
            if active_cloud_order:
                return active_cloud_order
        except Exception:
            pass

    # 2. Local file fallback
    order_file = os.path.join(BASE_DIR, "latest_order.json")
    if os.path.exists(order_file):
        try:
            with open(order_file, "r") as f:
                data = json.load(f)
                if data.get("active") is False or data.get("status") == "completed":
                    return None
                return data
        except Exception:
            return None
    return None

def render_animated_delivery_tracking_map(cur_ord, df_stores):
    """
    Renders an interactive multi-route delivery tracking map:
    1. First draws ALL candidate routes from dark store to customer in distinct colors.
    2. Dynamically evaluates and selects the SHORTEST route.
    3. Dims alternative routes, illuminates the shortest route in glowing emerald green,
       and dispatches the courier along that optimal path.
    """
    other_stores = []
    if df_stores is not None and not df_stores.empty:
        for _, row in df_stores.iterrows():
            if str(row.get('Store Name')) != str(cur_ord['assigned_store']):
                other_stores.append({
                    "name": str(row.get('Store Name')),
                    "lat": float(row.get('Latitude')),
                    "lon": float(row.get('Longitude'))
                })
    other_stores_json = json.dumps(other_stores)
    rider_short = cur_ord['rider'].split(' ')[0]
    
    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        html, body, #map {{ width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
        
        .hub-marker {{
            width: 38px;
            height: 38px;
            background: rgba(16, 185, 129, 0.25);
            border: 2.5px solid #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 0 18px rgba(16, 185, 129, 0.7);
            animation: pulse-hub 2s infinite;
        }}
        .cust-marker {{
            width: 38px;
            height: 38px;
            background: rgba(6, 182, 212, 0.25);
            border: 2.5px solid #06b6d4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 0 18px rgba(6, 182, 212, 0.7);
            animation: pulse-cust 2s infinite;
        }}
        .rider-marker {{
            width: 44px;
            height: 44px;
            background: #0f172a;
            border: 2.5px solid #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 0 22px rgba(16, 185, 129, 0.95);
            position: relative;
        }}
        .rider-label {{
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: #0f172a;
            color: #34d399;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 99px;
            border: 1px solid #10b981;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }}
        
        @keyframes pulse-hub {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.12); }}
        }}
        @keyframes pulse-cust {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.12); }}
        }}

        /* Multi-Route Top Evaluation Banner */
        .route-eval-banner {{
            position: absolute;
            top: 14px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            padding: 8px 18px;
            border-radius: 99px;
            font-size: 12px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            transition: all 0.4s ease;
        }}
        .evaluating {{
            background: rgba(15, 23, 42, 0.92);
            border: 1.5px solid #f59e0b;
            color: #fbbf24;
        }}
        .selected {{
            background: rgba(6, 78, 59, 0.95);
            border: 1.5px solid #10b981;
            color: #34d399;
        }}
        .eval-dot {{
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse-hub 1s infinite;
        }}

        /* Route Distance Tag Tooltips */
        .route-tag {{
            background: rgba(15, 23, 42, 0.88);
            border: 1px solid rgba(255,255,255,0.25);
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            white-space: nowrap;
        }}

        /* Bottom HUD Card */
        .hud-card {{
            position: absolute;
            bottom: 16px;
            left: 16px;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.94);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(51, 65, 85, 0.8);
            border-radius: 16px;
            padding: 14px 18px;
            color: #f1f5f9;
            width: 340px;
            box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        }}
        .hud-title {{
            font-size: 10px;
            font-weight: 800;
            color: #34d399;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .hud-dot {{
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse-hub 1.5s infinite;
        }}
        .hud-rider {{
            font-size: 14px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 3px;
        }}
        
        /* Candidate Route Selector Pills */
        .route-pills-row {{
            display: flex;
            gap: 6px;
            margin-top: 8px;
        }}
        .route-pill {{
            flex: 1;
            padding: 5px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.15);
            background: #1e293b;
            color: #94a3b8;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .route-pill.active {{
            background: rgba(16, 185, 129, 0.2);
            border-color: #10b981;
            color: #34d399;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }}

        .hud-metrics {{
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-top: 1px solid rgba(51, 65, 85, 0.6);
            border-bottom: 1px solid rgba(51, 65, 85, 0.6);
        }}
        .hud-metric-label {{
            font-size: 10px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .hud-metric-val {{
            font-size: 15px;
            font-weight: 800;
            color: #38bdf8;
            margin-top: 2px;
        }}
        .hud-bar-bg {{
            width: 100%;
            height: 6px;
            background: #1e293b;
            border-radius: 99px;
            overflow: hidden;
            margin: 6px 0;
        }}
        .hud-bar-fill {{
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #10b981, #06b6d4);
            border-radius: 99px;
            transition: width 0.1s linear;
        }}
        .hud-controls {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
        }}
        .hud-btn {{
            background: #1e293b;
            border: 1px solid #334155;
            color: #e2e8f0;
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .hud-btn:hover {{
            background: #334155;
            color: #ffffff;
        }}
        .hud-btn-primary {{
            background: #10b981;
            border: none;
            color: #022c22;
            font-weight: 800;
        }}
        .hud-btn-primary:hover {{
            background: #34d399;
        }}
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <!-- Multi-Route Analysis Status Banner -->
      <div id="eval-banner" class="route-eval-banner evaluating">
        <span class="eval-dot"></span>
        <span id="eval-banner-text">🔍 Analyzing 3 Candidate Routes from Hub to Customer...</span>
      </div>

      <div class="hud-card">
        <div class="hud-title">
          <span class="hud-dot"></span>
          <span>Autonomous Dispatch • Order #{cur_ord['order_id']}</span>
        </div>
        <div class="hud-rider">🛵 {cur_ord['rider']}</div>
        
        <!-- Interactive Candidate Routes Selector -->
        <div class="route-pills-row">
          <div class="route-pill active" id="pill-r1" onclick="selectRoute(0)">
            <span id="pill-text-r1">Route 1 (Shortest)</span>
          </div>
          <div class="route-pill" id="pill-r2" onclick="selectRoute(1)">
            <span id="pill-text-r2">Route 2</span>
          </div>
          <div class="route-pill" id="pill-r3" onclick="selectRoute(2)">
            <span id="pill-text-r3">Route 3</span>
          </div>
        </div>

        <div class="hud-metrics">
          <div>
            <div class="hud-metric-label">Optimized SLA</div>
            <div class="hud-metric-val" id="eta-val" style="color: #34d399;">{cur_ord['eta_mins']} mins</div>
          </div>
          <div style="text-align: right;">
            <div class="hud-metric-label">Distance (Shortest)</div>
            <div class="hud-metric-val" id="dist-val">{cur_ord['distance_km']:.2f} km</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 600;">
          <span>Hub Dispatched</span>
          <span id="pct-val" style="color: #34d399; font-weight: 700;">0%</span>
          <span>Customer Doorstep</span>
        </div>
        <div class="hud-bar-bg">
          <div class="hud-bar-fill" id="progress-bar"></div>
        </div>

        <div class="hud-controls">
          <button class="hud-btn" id="pause-btn" onclick="togglePause()">⏸️ Pause</button>
          <button class="hud-btn hud-btn-primary" onclick="restartTrip()">🔄 Re-evaluate Routes</button>
        </div>
      </div>

      <script>
        var storeLat = {cur_ord['store_lat']};
        var storeLon = {cur_ord['store_lon']};
        var custLat = {cur_ord['cust_lat']};
        var custLon = {cur_ord['cust_lon']};
        var otherStores = {other_stores_json};

        var map = L.map('map', {{
          zoomControl: false
        }}).setView([(storeLat + custLat) / 2, (storeLon + custLon) / 2], 14);

        L.control.zoom({{ position: 'topright' }}).addTo(map);

        L.tileLayer('https://{{s}}.basemaps.cartocdn.com/rastertiles/voyager/{{z}}/{{x}}/{{y}}{{r}}.png', {{
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd'
        }}).addTo(map);

        otherStores.forEach(function(s) {{
          L.circleMarker([s.lat, s.lon], {{
            radius: 7,
            fillColor: '#94a3b8',
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.6
          }}).addTo(map).bindPopup('<b>Dark Store:</b> ' + s.name);
        }});

        var hubIcon = L.divIcon({{
          className: '',
          html: '<div class="hub-marker">🏬</div>',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        }});
        L.marker([storeLat, storeLon], {{ icon: hubIcon }})
          .addTo(map)
          .bindPopup('<b>Assigned Dark Store</b><br>{cur_ord['assigned_store']}');

        var custIcon = L.divIcon({{
          className: '',
          html: '<div class="cust-marker">🏠</div>',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        }});
        L.marker([custLat, custLon], {{ icon: custIcon }})
          .addTo(map)
          .bindPopup('<b>Customer Destination</b><br>Order #{cur_ord['order_id']}');

        var bounds = L.latLngBounds([[storeLat, storeLon], [custLat, custLon]]);
        map.fitBounds(bounds, {{ padding: [70, 70] }});

        var riderIcon = L.divIcon({{
          className: '',
          html: '<div class="rider-marker"><span class="rider-label">{rider_short}</span>🛵</div>',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        }});
        var riderMarker = L.marker([storeLat, storeLon], {{ icon: riderIcon, zIndexOffset: 1000 }}).addTo(map);

        // Candidate Routes storage
        var candidateRoutes = [];
        var polylines = [];
        var tagMarkers = [];
        var selectedRouteIndex = 0;
        var activeRouteCoords = [];
        var traveledPolyline = null;

        function calculateDistance(pts) {{
          var total = 0;
          for (var i = 0; i < pts.length - 1; i++) {{
            total += L.latLng(pts[i]).distanceTo(L.latLng(pts[i + 1]));
          }}
          return total;
        }}

        // Generate 3 realistic candidate paths connecting Hub to Customer
        function buildCandidateRoutes(primaryPts) {{
          var dLat = custLat - storeLat;
          var dLon = custLon - storeLon;

          // Route 1: Direct Primary Road
          var r1 = primaryPts;

          // Route 2: Secondary Bypass Corridor (bows outward along perpendicular vector)
          var r2 = [
            [storeLat, storeLon],
            [storeLat + dLat * 0.25 - dLon * 0.28, storeLon + dLon * 0.25 + dLat * 0.28],
            [storeLat + dLat * 0.55 - dLon * 0.35, storeLon + dLon * 0.55 + dLat * 0.35],
            [storeLat + dLat * 0.85 - dLon * 0.18, storeLon + dLon * 0.85 + dLat * 0.18],
            [custLat, custLon]
          ];

          // Route 3: Inner Grid / Residential Streets (steps sharply through intersections)
          var r3 = [
            [storeLat, storeLon],
            [storeLat + dLat * 0.20 + dLon * 0.25, storeLon + dLon * 0.05],
            [storeLat + dLat * 0.40 + dLon * 0.32, storeLon + dLon * 0.45],
            [storeLat + dLat * 0.70 + dLon * 0.22, storeLon + dLon * 0.55],
            [storeLat + dLat * 0.88 + dLon * 0.12, storeLon + dLon * 0.88],
            [custLat, custLon]
          ];

          var dist1 = calculateDistance(r1);
          var dist2 = calculateDistance(r2);
          var dist3 = calculateDistance(r3);

          return [
            {{ name: 'Route 1 (Arterial)', coords: r1, distMeters: dist1, distKm: (dist1/1000).toFixed(2), color: '#06b6d4' }},
            {{ name: 'Route 2 (Bypass)', coords: r2, distMeters: dist2, distKm: (dist2/1000).toFixed(2), color: '#f59e0b' }},
            {{ name: 'Route 3 (Inner Grid)', coords: r3, distMeters: dist3, distKm: (dist3/1000).toFixed(2), color: '#8b5cf6' }}
          ];
        }}

        async function fetchAndEvaluateRoutes() {{
          var primaryCoords = [];
          var url = 'https://router.project-osrm.org/route/v1/driving/' + storeLon + ',' + storeLat + ';' + custLon + ',' + custLat + '?overview=full&geometries=geojson';
          try {{
            var controller = new AbortController();
            var timeoutId = setTimeout(function() {{ controller.abort(); }}, 1800);
            var resp = await fetch(url, {{ signal: controller.signal }});
            clearTimeout(timeoutId);
            var data = await resp.json();
            if (data.routes && data.routes.length > 0 && data.routes[0].geometry.coordinates.length > 1) {{
              primaryCoords = data.routes[0].geometry.coordinates.map(function(pt) {{ return [pt[1], pt[0]]; }});
            }} else {{
              throw new Error('Fallback required');
            }}
          }} catch (e) {{
            var midLat = (storeLat + custLat) / 2;
            var midLon = (storeLon + custLon) / 2;
            primaryCoords = [
              [storeLat, storeLon],
              [storeLat + (custLat - storeLat) * 0.3, storeLon + (custLon - storeLon) * 0.1],
              [midLat, midLon],
              [storeLat + (custLat - storeLat) * 0.8, storeLon + (custLon - storeLon) * 0.9],
              [custLat, custLon]
            ];
          }}

          candidateRoutes = buildCandidateRoutes(primaryCoords);

          // Find strictly shortest route
          var minIdx = 0;
          var minDist = candidateRoutes[0].distMeters;
          for (var i = 1; i < candidateRoutes.length; i++) {{
            if (candidateRoutes[i].distMeters < minDist) {{
              minDist = candidateRoutes[i].distMeters;
              minIdx = i;
            }}
          }}
          selectedRouteIndex = minIdx;
          activeRouteCoords = candidateRoutes[minIdx].coords;

          // Update HUD Pills
          document.getElementById('pill-text-r1').innerText = candidateRoutes[0].distKm + ' km' + (minIdx === 0 ? ' (Shortest)' : '');
          document.getElementById('pill-text-r2').innerText = candidateRoutes[1].distKm + ' km' + (minIdx === 1 ? ' (Shortest)' : '');
          document.getElementById('pill-text-r3').innerText = candidateRoutes[2].distKm + ' km' + (minIdx === 2 ? ' (Shortest)' : '');

          // =================================================================
          // STAGE 1: Draw ALL 3 candidate routes simultaneously
          // =================================================================
          polylines.forEach(function(p) {{ map.removeLayer(p); }});
          tagMarkers.forEach(function(m) {{ map.removeLayer(m); }});
          polylines = [];
          tagMarkers = [];

          candidateRoutes.forEach(function(route, idx) {{
            var poly = L.polyline(route.coords, {{
              color: route.color,
              weight: 4.5,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round'
            }}).addTo(map);
            polylines.push(poly);

            // Add distance label pill near route midpoint
            var midPt = route.coords[Math.floor(route.coords.length / 2)];
            var tagIcon = L.divIcon({{
              className: '',
              html: '<div class="route-tag" style="border-color:' + route.color + '">🛣️ ' + route.name + ': ' + route.distKm + ' km</div>',
              iconSize: [120, 24],
              iconAnchor: [60, 12]
            }});
            var marker = L.marker(midPt, {{ icon: tagIcon }}).addTo(map);
            tagMarkers.push(marker);
          }});

          var banner = document.getElementById('eval-banner');
          var bannerText = document.getElementById('eval-banner-text');
          banner.className = 'route-eval-banner evaluating';
          bannerText.innerText = '🔍 Analyzing 3 Candidate Routes from Hub to Customer...';

          // =================================================================
          // STAGE 2: After 2.6s, select and highlight SHORTEST route
          // =================================================================
          setTimeout(function() {{
            lockShortestRoute(minIdx);
          }}, 2600);
        }}

        function lockShortestRoute(idx) {{
          selectedRouteIndex = idx;
          var winningRoute = candidateRoutes[idx];
          activeRouteCoords = winningRoute.coords;

          // Update Banner
          var banner = document.getElementById('eval-banner');
          var bannerText = document.getElementById('eval-banner-text');
          banner.className = 'route-eval-banner selected';
          var savedKm = (Math.max.apply(null, candidateRoutes.map(function(r) {{ return r.distKm; }})) - winningRoute.distKm).toFixed(2);
          bannerText.innerText = '✅ Shortest Route Selected: ' + winningRoute.name + ' (' + winningRoute.distKm + ' km) • Dispatched!';

          // Highlight winning route, dim the others
          polylines.forEach(function(p, i) {{
            if (i === idx) {{
              p.setStyle({{
                color: '#10b981',
                weight: 6.5,
                opacity: 1.0,
                dashArray: null
              }});
              p.bringToFront();
            }} else {{
              p.setStyle({{
                color: '#64748b',
                weight: 2.5,
                opacity: 0.22,
                dashArray: '5, 8'
              }});
            }}
          }});

          // Update active pill
          for (var i = 0; i < 3; i++) {{
            var pill = document.getElementById('pill-r' + (i + 1));
            if (i === idx) {{
              pill.className = 'route-pill active';
            }} else {{
              pill.className = 'route-pill';
            }}
          }}

          document.getElementById('dist-val').innerText = winningRoute.distKm + ' km';

          // Create Traveled Polyline & start rider traversal
          if (traveledPolyline) map.removeLayer(traveledPolyline);
          traveledPolyline = L.polyline([], {{
            color: '#10b981',
            weight: 7,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }}).addTo(map);

          startAnimation();
        }}

        function selectRoute(idx) {{
          lockShortestRoute(idx);
        }}

        function calculateCumulativeDistances(pts) {{
          var dists = [0];
          var total = 0;
          for (var i = 0; i < pts.length - 1; i++) {{
            var d = L.latLng(pts[i]).distanceTo(L.latLng(pts[i + 1]));
            total += d;
            dists.push(total);
          }}
          return {{ dists: dists, total: total }};
        }}

        function getPointAtProgress(pts, dists, total, p) {{
          var targetDist = p * total;
          for (var i = 0; i < dists.length - 1; i++) {{
            if (targetDist >= dists[i] && targetDist <= dists[i + 1]) {{
              var segLen = dists[i + 1] - dists[i];
              var segProgress = segLen > 0 ? (targetDist - dists[i]) / segLen : 0;
              var lat = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * segProgress;
              var lon = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * segProgress;
              var traveledPts = pts.slice(0, i + 1);
              traveledPts.push([lat, lon]);
              return {{ lat: lat, lon: lon, traveledPts: traveledPts }};
            }}
          }}
          return {{ lat: pts[pts.length - 1][0], lon: pts[pts.length - 1][1], traveledPts: pts }};
        }}

        var DURATION_MS = 12000;
        var animFrameId = null;
        var startTime = null;
        var isPaused = false;
        var pausedProgress = 0;
        var currentProgress = 0;

        function animate(timestamp) {{
          if (isPaused) {{
            animFrameId = requestAnimationFrame(animate);
            return;
          }}

          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          currentProgress = Math.min(1, pausedProgress + elapsed / DURATION_MS);

          var distData = calculateCumulativeDistances(activeRouteCoords);
          var ptData = getPointAtProgress(activeRouteCoords, distData.dists, distData.total, currentProgress);

          riderMarker.setLatLng([ptData.lat, ptData.lon]);
          if (traveledPolyline) traveledPolyline.setLatLngs(ptData.traveledPts);

          var activeDistKm = parseFloat(candidateRoutes[selectedRouteIndex].distKm);
          var remDist = Math.max(0, (1 - currentProgress) * activeDistKm).toFixed(2);
          document.getElementById('dist-val').innerText = remDist + ' km';
          
          var pct = Math.round(currentProgress * 100);
          document.getElementById('pct-val').innerText = pct + '%';
          document.getElementById('progress-bar').style.width = Math.max(4, pct) + '%';

          var etaVal = document.getElementById('eta-val');
          if (currentProgress >= 0.98) {{
            etaVal.innerText = 'Arrived! 🎉';
            etaVal.style.color = '#38bdf8';
          }} else if (currentProgress > 0.8) {{
            etaVal.innerText = '< 1 min (At Gate)';
            etaVal.style.color = '#34d399';
          }} else if (currentProgress > 0.5) {{
            etaVal.innerText = '2 mins (Nearby)';
          }} else {{
            etaVal.innerText = Math.max(1, Math.ceil((1 - currentProgress) * 6)) + ' mins';
          }}

          if (currentProgress < 1) {{
            animFrameId = requestAnimationFrame(animate);
          }}
        }}

        function startAnimation() {{
          if (animFrameId) cancelAnimationFrame(animFrameId);
          startTime = null;
          pausedProgress = 0;
          isPaused = false;
          currentProgress = 0;
          document.getElementById('pause-btn').innerText = '⏸️ Pause';
          animFrameId = requestAnimationFrame(animate);
        }}

        function restartTrip() {{
          fetchAndEvaluateRoutes();
        }}

        function togglePause() {{
          if (currentProgress >= 1) {{
            restartTrip();
            return;
          }}
          isPaused = !isPaused;
          var pauseBtn = document.getElementById('pause-btn');
          if (isPaused) {{
            pausedProgress = currentProgress;
            pauseBtn.innerText = '▶️ Resume';
          }} else {{
            startTime = null;
            pauseBtn.innerText = '⏸️ Pause';
          }}
        }}

        fetchAndEvaluateRoutes();
      </script>
    </body>
    </html>
    """
    components.html(html_code, height=600)


# Check if an external mobile order arrived via FastAPI
external_order = check_for_external_order()
if external_order:
    ext_id = external_order.get("order_id")
    if ext_id and st.session_state.get("last_synced_order_id") != ext_id:
        st.session_state["active_order"] = external_order
        st.session_state["last_synced_order_id"] = ext_id
        st.session_state["just_simulated"] = True
elif external_order is None and st.session_state.get("last_synced_order_id"):
    # Mobile app completed/reset the order
    st.session_state["active_order"] = None
    st.session_state["last_synced_order_id"] = None
    st.session_state["just_simulated"] = False

# Session state initialization for live order simulation
if "active_order" not in st.session_state:
    st.session_state["active_order"] = None
if "just_simulated" not in st.session_state:
    st.session_state["just_simulated"] = False

# ------------------------------------------------------------------------------
# 4. Sidebar: Dynamic Cross-Filtering & Session State Reactivity
# ------------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 📍 Chhatrapati Sambhajinagar")
    st.caption("Dark Store Command Center Settings")
    st.markdown("---")

    st.subheader("🎛️ Dynamic Cross-Filters")

    all_neighborhoods = sorted(df_demographics['Neighborhood'].unique().tolist())
    selected_neighborhoods = st.multiselect(
        "Target Neighborhoods",
        options=all_neighborhoods,
        default=all_neighborhoods,
        help="Select micro-markets to include in cross-analysis."
    )

    min_density = int(df_demographics['Population Density (per sq km)'].min())
    max_density = int(df_demographics['Population Density (per sq km)'].max())
    density_range = st.slider(
        "Population Density Range (/km²)",
        min_value=min_density,
        max_value=max_density,
        value=(min_density, max_density),
        step=500,
        help="Filter micro-markets within specific population density boundaries."
    )

    weather_friction_range = st.slider(
        "Monsoon / Weather Impact Scale",
        min_value=1,
        max_value=5,
        value=(1, 5),
        step=1,
        help="Filter climate months by delivery friction scale (1=Favorable, 5=Severe Monsoon)."
    )

    simulated_radius = st.slider(
        "Simulated Delivery Radius (km)",
        min_value=1.5,
        max_value=6.0,
        value=3.0,
        step=0.5,
        help="Simulate dark store fulfillment catchment radius for buffer & SLA calculations."
    )

    status_options = ["All", "Active", "Proposed"]
    selected_status = st.selectbox(
        "Dark Store Status",
        options=status_options,
        index=0,
        help="Filter fulfillment stores by operational readiness."
    )

    forecast_days = st.slider(
        "Demand Forecast Horizon (Days)",
        min_value=3,
        max_value=30,
        value=7,
        step=1,
        help="Number of forward projection days modeled by the ML engine."
    )

    st.markdown("---")
    st.markdown("### 👨‍💻 Developers & Contributors")
    st.markdown("**Neel Belsare**")
    st.markdown("[🔗 LinkedIn](https://www.linkedin.com/in/neel-belsare-719b9a314/) • [GitHub](https://github.com/NeelBelsare)")
    st.markdown("**Mansi Gaike**")
    st.markdown("[🔗 LinkedIn](https://www.linkedin.com/in/mansi-gaike-821260316) • [GitHub](https://github.com/gaikemansi03-sketch)")
    st.caption("Quick-Commerce Analytics v3.0 • Command Center")

    st.markdown("---")
    st.markdown("### ⚡ Live Dispatch Telemetry")
    active_ord = st.session_state.get("active_order")
    if active_ord:
        if st.session_state.get("just_simulated", False):
            with st.status("🚀 Routing Quick-Commerce Order...", expanded=True) as status_box:
                st.write(f"🛒 Order **#{active_ord['order_id']}** placed ({len(active_ord['items'])} items)")
                time.sleep(0.2)
                st.write(f"📍 Customer GPS locked (`{active_ord['cust_lat']:.4f}, {active_ord['cust_lon']:.4f}`)")
                time.sleep(0.2)
                st.write(f"🧠 Assigned: **{active_ord['assigned_store']}** ({active_ord['distance_km']:.2f} km)")
                time.sleep(0.2)
                st.write("📦 Order picked & packed at hub")
                time.sleep(0.2)
                st.write(f"🛵 Dispatched with **{active_ord['rider']}**")
                status_box.update(label=f"✅ Out for Delivery (ETA: {active_ord['eta_mins']} mins)", state="complete", expanded=False)
            st.session_state["just_simulated"] = False

        st.markdown(f"""
        <div class="card" style="padding: 14px; border-left: 3px solid var(--ok); margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: var(--mut); font-weight: 700;">Active Delivery</span>
                <span class="live" style="padding: 3px 8px; font-size: 11px;"><i></i>In Transit</span>
            </div>
            <div style="font-size: 16px; font-weight: 800; color: var(--tx); margin: 6px 0 2px;">Order #{active_ord['order_id']}</div>
            <div style="font-size: 12px; color: var(--mut); margin-bottom: 6px;">Placed at {active_ord['timestamp']} · ₹{active_ord['order_val']}</div>
            <div style="font-size: 12.5px; color: var(--tx); margin-bottom: 3px;"><b>Hub:</b> {active_ord['assigned_store']}</div>
            <div style="font-size: 12.5px; color: var(--tx); margin-bottom: 8px;"><b>Rider:</b> {active_ord['rider']}</div>
            <div style="display: flex; justify-content: space-between; padding-top: 6px; border-top: 1px solid var(--line); font-size: 12px;">
                <span>Distance: <b style="color: var(--acc);">{active_ord['distance_km']:.2f} km</b></span>
                <span>ETA: <b style="color: var(--ok);">{active_ord['eta_mins']} mins</b></span>
            </div>
        </div>
        """, unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 5. Cross-Filtering Execution & Toast Notification
# ------------------------------------------------------------------------------
target_list = selected_neighborhoods if selected_neighborhoods else all_neighborhoods
filtered_df = df_demographics[
    (df_demographics['Neighborhood'].isin(target_list)) &
    (df_demographics['Population Density (per sq km)'] >= density_range[0]) &
    (df_demographics['Population Density (per sq km)'] <= density_range[1])
].copy()

if selected_status != "All":
    filtered_stores = df_stores[df_stores['Status'] == selected_status].copy()
else:
    filtered_stores = df_stores.copy()

filtered_climate = df_climate[
    (df_climate['Delivery Impact Scale (1-5)'] >= weather_friction_range[0]) &
    (df_climate['Delivery Impact Scale (1-5)'] <= weather_friction_range[1])
].copy()

# Live Session-State Toast Notifications
current_state_key = (
    tuple(sorted(target_list)),
    density_range,
    weather_friction_range,
    simulated_radius,
    selected_status,
    forecast_days
)

if "prev_filter_state" in st.session_state and st.session_state["prev_filter_state"] != current_state_key:
    st.toast(f"⚡ Live updated: {len(filtered_df)} micro-markets & {len(filtered_stores)} store hubs", icon="🎯")
st.session_state["prev_filter_state"] = current_state_key

# ------------------------------------------------------------------------------
# 6. Main Dashboard Header & KPI Metrics Cards (Command Center Design)
# ------------------------------------------------------------------------------
st.markdown("""
<div class="header-box">
  <div>
    <h1>🛒 Aurangabad <span>Dark Store Command Center</span></h1>
    <p class="sub">Feasibility analysis, network coverage and demand forecasting across Chhatrapati Sambhajinagar micro-markets.</p>
  </div>
  <div class="live"><i></i>Live network</div>
</div>
""", unsafe_allow_html=True)

# Metrics calculation
total_active_stores = len(df_stores[df_stores['Status'] == 'Active'])
total_proposed_stores = len(df_stores[df_stores['Status'] == 'Proposed'])
total_serviceable_pop = int(filtered_df['Estimated Population (2024)_x'].sum()) if not filtered_df.empty else 0
total_monthly_orders = int(filtered_df['Predicted Online Order Volume (Monthly)'].sum()) if not filtered_df.empty else 0
avg_density = int(filtered_df['Population Density (per sq km)'].mean()) if not filtered_df.empty else 0
est_delivery_sla = round(9.0 + (simulated_radius * 1.4), 1)

# Render Custom HTML KPI Cards with exact user styling
kpis_html = f"""
<section class="kpis">
  <div class="card kpi"><small>Active stores</small><b>{total_active_stores}</b><em>+{total_proposed_stores} proposed</em></div>
  <div class="card kpi"><small>Serviceable population</small><b>{total_serviceable_pop:,}</b><em>{len(filtered_df)} micro-markets</em></div>
  <div class="card kpi"><small>Est. monthly orders</small><b>{total_monthly_orders:,}</b><em>Predicted demand</em></div>
  <div class="card kpi"><small>Avg delivery buffer</small><b>{simulated_radius:.1f} km</b><em>{avg_density:,}/km² density</em></div>
  <div class="card kpi"><small>Avg delivery SLA</small><b>{est_delivery_sla:.0f} mins</b><em>Ultra-fast QC</em></div>
</section>
"""
st.markdown(kpis_html, unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# 7. Dashboard Layout: Modern Structured Tabs
# ------------------------------------------------------------------------------
tab_summary, tab_sim, tab_map, tab_demographics, tab_forecast, tab_climate, tab_inventory = st.tabs([
    "📊 Executive Summary",
    "⚡ Live Order Simulation",
    "🗺️ Geospatial View",
    "👥 Demographic Heatmaps",
    "📈 Demand Forecasting",
    "🌦️ Climate & Monsoon",
    "📦 Smart Inventory & Stockouts"
])

# ------------------------------------------------------------------------------
# TAB 1: Executive Summary
# ------------------------------------------------------------------------------
with tab_summary:
    col_l, col_r = st.columns([1.25, 1])

    with col_l:
        st.markdown("""
        <div class="card" style="margin-bottom: 16px;">
            <h2 class="card-title">🚨 High-volume micro-markets needing 2+ stores</h2>
            <p class="hint">Clusters above 80,000 monthly orders need dual hubs to hold a sub-12 minute SLA.</p>
        """, unsafe_allow_html=True)

        high_demand_df = filtered_df[filtered_df['Predicted Online Order Volume (Monthly)'] > 80000].sort_values(
            'Predicted Online Order Volume (Monthly)', ascending=False
        )

        if not high_demand_df.empty:
            max_orders_val = high_demand_df['Predicted Online Order Volume (Monthly)'].max()
            rows_html = ""
            for _, row in high_demand_df.iterrows():
                orders_val = int(row['Predicted Online Order Volume (Monthly)'])
                density_val = int(row['Population Density (per sq km)'])
                pct = int((orders_val / max_orders_val) * 100) if max_orders_val > 0 else 50
                rows_html += f"""
                <div class="row">
                  <div class="n">
                    <strong>{row['Neighborhood']}</strong>
                    <span>{orders_val:,} orders/mo · {density_val:,} people/km²</span>
                    <div class="bar"><i style="width:{pct}%"></i></div>
                  </div>
                  <span class="tag">Add hub</span>
                </div>
                """
            st.markdown(rows_html + "</div>", unsafe_allow_html=True)
        else:
            st.markdown("""
                <div style="padding: 12px 0; color: var(--ok); font-size: 13.5px; font-weight: 500;">
                    ✅ All micro-markets in current selection operate within single-store capacity limits.
                </div>
            </div>
            """, unsafe_allow_html=True)

    with col_r:
        # Donut Chart SVG Card
        active_count = len(df_stores[df_stores['Status'] == 'Active'])
        proposed_count = len(df_stores[df_stores['Status'] == 'Proposed'])
        total_count = active_count + proposed_count
        dash_active = round((active_count / total_count) * 99.9, 1) if total_count > 0 else 91.6
        dash_gap = round(99.9 - dash_active, 1)

        donut_html = f"""
        <div class="card" style="margin-bottom: 16px;">
          <h2 class="card-title">🏬 Network composition</h2>
          <p class="hint">Active vs. proposed store hubs</p>
          <div class="donutbox">
            <svg width="170" height="170" viewBox="0 0 42 42" role="img" aria-label="Donut: {active_count} active, {proposed_count} proposed">
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="#f59e0b" stroke-width="5"/>
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="#6366f1" stroke-width="5" stroke-dasharray="{dash_active} {dash_gap}" stroke-linecap="round" transform="rotate(-90 21 21)"/>
              <text x="21" y="22" text-anchor="middle" font-size="8" font-weight="800" style="fill:var(--tx);font-family:Inter,sans-serif">{total_count}</text>
              <text x="21" y="27.5" text-anchor="middle" font-size="3" style="fill:var(--mut);font-family:Inter,sans-serif">total hubs</text>
            </svg>
            <div class="leg">
              <div><i style="background:#6366f1"></i>Active · {active_count}</div>
              <div><i style="background:#f59e0b"></i>Proposed · {proposed_count}</div>
            </div>
          </div>
        </div>
        """
        st.markdown(donut_html, unsafe_allow_html=True)

        # SLA vs Delivery Radius Card
        st.markdown("""
        <div class="card">
          <h2 class="card-title">⏱️ SLA vs delivery radius</h2>
          <p class="hint">Estimated delivery time by catchment radius</p>
        """, unsafe_allow_html=True)

        radius_steps = np.arange(1.5, 6.5, 0.5)
        sla_steps = [round(9.0 + (r * 1.4), 1) for r in radius_steps]
        
        fig_sla = go.Figure()
        fig_sla.add_trace(go.Scatter(
            x=radius_steps,
            y=sla_steps,
            mode='lines',
            line=dict(color='#818cf8', width=3),
            fill='tozeroy',
            fillcolor='rgba(99, 102, 241, 0.12)',
            hoverinfo='x+y',
            name='Delivery SLA'
        ))
        fig_sla.add_vline(
            x=simulated_radius,
            line_dash="dash",
            line_color="#f59e0b",
            annotation_text=f"Selected: {simulated_radius}km · {est_delivery_sla:.0f} min",
            annotation_font=dict(color="#f59e0b", size=11, family="Inter")
        )
        fig_sla.add_trace(go.Scatter(
            x=[simulated_radius],
            y=[est_delivery_sla],
            mode='markers',
            marker=dict(size=10, color='#f59e0b'),
            showlegend=False
        ))
        fig_sla.update_layout(
            template="plotly_white",
            height=180,
            margin=dict(l=10, r=10, t=20, b=25),
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            xaxis=dict(title=dict(text="Radius (km)", font=dict(family="Inter", size=11, color="#64748b")), tickfont=dict(family="Inter", size=10, color="#64748b")),
            yaxis=dict(title=dict(text="Minutes", font=dict(family="Inter", size=11, color="#64748b")), tickfont=dict(family="Inter", size=10, color="#64748b")),
            font=dict(family="Inter", color="#0f172a")
        )
        st.plotly_chart(fig_sla, use_container_width=True)
        st.markdown("</div>", unsafe_allow_html=True)

    # Top 5 Priority Expansion Zones Table
    st.markdown("""
    <div class="card" style="margin-top: 16px;">
      <h2 class="card-title">🏆 Top 5 priority expansion zones</h2>
      <p class="hint">Ranked by estimated monthly online orders and shopper density.</p>
      <div class="tbl">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Neighborhood</th>
              <th class="r">Online shoppers</th>
              <th class="r">Orders / month</th>
              <th class="r">Density /km²</th>
            </tr>
          </thead>
          <tbody>
    """, unsafe_allow_html=True)

    if not filtered_df.empty:
        top_exp = filtered_df.nlargest(5, 'Predicted Online Order Volume (Monthly)')
        table_rows = ""
        for idx, (_, row) in enumerate(top_exp.iterrows(), start=1):
            shoppers = f"{int(row['Estimated Online Shoppers']):,}"
            orders = f"{int(row['Predicted Online Order Volume (Monthly)']):,}"
            density = f"{int(row['Population Density (per sq km)']):,}"
            table_rows += f"""
            <tr>
              <td><span class="rk">{idx}</span>{row['Neighborhood']}</td>
              <td class="r">{shoppers}</td>
              <td class="r">{orders}</td>
              <td class="r">{density}</td>
            </tr>
            """
        st.markdown(table_rows + "</tbody></table></div></div>", unsafe_allow_html=True)
    else:
        st.markdown("<tr><td colspan='4'>No micro-markets meet current filter criteria.</td></tr></tbody></table></div></div>", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# TAB 2: Live Order Simulation & Geospatial Dispatch
# ------------------------------------------------------------------------------
with tab_sim:
    st.markdown("""
    <div class="card" style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <h2 class="card-title">⚡ Live Quick-Commerce Order Simulation & Dispatch</h2>
          <p class="hint" style="margin: 4px 0 0 0;">Simulate real-time customer orders in Aurangabad, assign to the nearest dark store via Haversine routing, and monitor live delivery telemetry.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <span class="live"><i></i>Telemetry Active</span>
        </div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    col_action1, col_action2, col_action3, col_spacer = st.columns([1.5, 1.4, 1.2, 1.5])
    with col_action1:
        if st.button("🚀 Simulate New Customer Order", type="primary", use_container_width=True):
            st.session_state["active_order"] = generate_mock_customer_order(df_stores)
            st.session_state["just_simulated"] = True
            st.rerun()

    with col_action2:
        if st.button("📱 Sync Live Mobile Order", use_container_width=True):
            ext_ord = check_for_external_order()
            if ext_ord:
                st.session_state["active_order"] = ext_ord
                st.session_state["just_simulated"] = True
                st.toast(f"✅ Loaded Mobile Order #{ext_ord['order_id']}", icon="📱")
            else:
                st.info("No mobile orders detected yet. Place an order via mobile app or call POST /api/order.")
            st.rerun()

    with col_action3:
        if st.button("🔄 Done / Reset", use_container_width=True):
            # 1. Reset in Supabase cloud database
            if supabase_client and supabase_client.is_supabase_enabled():
                try:
                    supabase_client.reset_active_orders()
                except Exception:
                    pass

            # 2. Reset in local file fallback
            order_file = os.path.join(BASE_DIR, "latest_order.json")
            try:
                with open(order_file, "w") as f:
                    json.dump({"active": False, "status": "completed", "reset_at": pd.Timestamp.now().isoformat()}, f, indent=2)
            except Exception:
                pass
            st.session_state["active_order"] = None
            st.session_state["last_synced_order_id"] = None
            st.session_state["just_simulated"] = False
            st.rerun()

    cur_ord = st.session_state.get("active_order")
    if cur_ord:
        # Order Source Badge
        order_src = cur_ord.get("source", "Synthetic Simulation")
        is_mobile = "Mobile" in order_src
        badge_bg = "rgba(16, 185, 129, 0.12)" if is_mobile else "rgba(99, 102, 241, 0.12)"
        badge_tx = "#10b981" if is_mobile else "#6366f1"
        badge_border = "rgba(16, 185, 129, 0.3)" if is_mobile else "rgba(99, 102, 241, 0.25)"
        
        st.markdown(f"""
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 99px; background: {badge_bg}; color: {badge_tx}; border: 1px solid {badge_border};">
                {'📱 Live GPS Order from Mobile App (Expo Blinkit)' if is_mobile else '🧪 Synthetic Order Simulation Engine'} • #{cur_ord['order_id']}
            </span>
            <span style="font-size: 11.5px; color: var(--mut); background: var(--card); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--line);">
                FastAPI Bridge: <code style="color: var(--acc);">POST /api/order</code> (Port 8000)
            </span>
        </div>
        """, unsafe_allow_html=True)

        # Order KPIs
        st.markdown(f"""
        <div class="kpis" style="margin: 10px 0 20px 0;">
          <div class="card kpi"><small>Assigned Dark Store</small><b style="font-size: 19px; line-height: 1.2;">{cur_ord['assigned_store']}</b><em>Nearest hub match</em></div>
          <div class="card kpi"><small>Road Distance</small><b>{cur_ord['distance_km']:.2f} km</b><em>Haversine direct</em></div>
          <div class="card kpi"><small>Estimated SLA</small><b>{cur_ord['eta_mins']} mins</b><em>Sub-15m promise</em></div>
          <div class="card kpi"><small>Assigned Fleet</small><b style="font-size: 19px; line-height: 1.2;">{cur_ord['rider'].split(' ')[0]}</b><em>{cur_ord['rider'].split(' ')[-1]}</em></div>
        </div>
        """, unsafe_allow_html=True)

        # Dispatch Telemetry Visualizer
        col_viz_h1, col_viz_h2 = st.columns([1.6, 1.4])
        with col_viz_h1:
            st.markdown("### 🗺️ Live Dispatch Telemetry Visualizer")
        with col_viz_h2:
            viz_mode = st.radio(
                "Map Engine:",
                ["🛵 Live Animated Rider & Route", "🌐 3D PyDeck Vector Arc"],
                horizontal=True,
                label_visibility="collapsed",
                key="telemetry_viz_mode"
            )

        if viz_mode == "🛵 Live Animated Rider & Route":
            render_animated_delivery_tracking_map(cur_ord, df_stores)
            st.caption("🛵 **Live Rider GPS Tracking**: Real-time road navigation from assigned hub to customer with simulated telemetry.")
        else:
            # 1. Assigned Dark Store Highlight Layer (Outer glow ring + center pin)
            store_glow = pd.DataFrame([{
                "Latitude": cur_ord['store_lat'],
                "Longitude": cur_ord['store_lon'],
                "tooltip_html": f"<b>Assigned Hub:</b> {cur_ord['assigned_store']}<br/><b>Coverage:</b> {cur_ord['coverage_area']}"
            }])
            assigned_glow_layer = pdk.Layer(
                "ScatterplotLayer",
                data=store_glow,
                get_position=["Longitude", "Latitude"],
                get_radius=580,
                get_fill_color=[16, 185, 129, 60],
                get_line_color=[16, 185, 129, 255],
                stroked=True,
                filled=True,
                line_width_min_pixels=3,
                pickable=True
            )
            assigned_pin_layer = pdk.Layer(
                "ScatterplotLayer",
                data=store_glow,
                get_position=["Longitude", "Latitude"],
                get_radius=200,
                get_fill_color=[16, 185, 129, 255],
                get_line_color=[255, 255, 255, 255],
                stroked=True,
                filled=True,
                line_width_min_pixels=2.5,
                pickable=True
            )

            # 2. Other Dark Stores (Muted grey to keep visual focus on active order)
            other_stores = df_stores[df_stores['Store Name'] != cur_ord['assigned_store']].copy()
            other_stores['tooltip_html'] = "<b>Hub:</b> " + other_stores['Store Name'].astype(str) + "<br/><b>Status:</b> " + other_stores['Status'].astype(str)
            other_stores_layer = pdk.Layer(
                "ScatterplotLayer",
                data=other_stores,
                get_position=["Longitude", "Latitude"],
                get_radius=170,
                get_fill_color=[148, 163, 184, 160],
                get_line_color=[255, 255, 255, 200],
                stroked=True,
                filled=True,
                line_width_min_pixels=1.5,
                pickable=True
            )

            # 3. Customer Location Ping (Concentric pulse rings + Cyan center)
            cust_df = pd.DataFrame([{
                "Latitude": cur_ord['cust_lat'],
                "Longitude": cur_ord['cust_lon'],
                "tooltip_html": f"<b>📍 Customer Location</b><br/>Order #{cur_ord['order_id']}<br/>ETA: {cur_ord['eta_mins']} mins"
            }])
            cust_pulse_layer = pdk.Layer(
                "ScatterplotLayer",
                data=cust_df,
                get_position=["Longitude", "Latitude"],
                get_radius=380,
                get_fill_color=[6, 182, 212, 50],
                get_line_color=[6, 182, 212, 255],
                stroked=True,
                filled=True,
                line_width_min_pixels=2.5,
                pickable=True
            )
            cust_pin_layer = pdk.Layer(
                "ScatterplotLayer",
                data=cust_df,
                get_position=["Longitude", "Latitude"],
                get_radius=110,
                get_fill_color=[6, 182, 212, 255],
                get_line_color=[255, 255, 255, 255],
                stroked=True,
                filled=True,
                line_width_min_pixels=2,
                pickable=True
            )

            # 4. Animated 3D Curved Arc Layer (Assigned Store -> Customer)
            arc_df = pd.DataFrame([{
                "from_lon": cur_ord['store_lon'],
                "from_lat": cur_ord['store_lat'],
                "to_lon": cur_ord['cust_lon'],
                "to_lat": cur_ord['cust_lat'],
                "tooltip_html": f"<b>Delivery Flight Vector</b><br/>Distance: {cur_ord['distance_km']:.2f} km<br/>ETA: {cur_ord['eta_mins']} mins"
            }])
            arc_layer = pdk.Layer(
                "ArcLayer",
                data=arc_df,
                get_source_position=["from_lon", "from_lat"],
                get_target_position=["to_lon", "to_lat"],
                get_source_color=[16, 185, 129, 255],
                get_target_color=[6, 182, 212, 255],
                get_width=5,
                pickable=True
            )

            # 5. Delivery Line Layer (Ground Route Vector)
            line_layer = pdk.Layer(
                "LineLayer",
                data=arc_df,
                get_source_position=["from_lon", "from_lat"],
                get_target_position=["to_lon", "to_lat"],
                get_color=[99, 102, 241, 180],
                get_width=3,
                pickable=True
            )

            # 6. Moving Rider Marker
            rider_progress = 0.65
            rider_lat = (1 - rider_progress) * cur_ord['store_lat'] + rider_progress * cur_ord['cust_lat']
            rider_lon = (1 - rider_progress) * cur_ord['store_lon'] + rider_progress * cur_ord['cust_lon']
            rider_df = pd.DataFrame([{
                "Latitude": rider_lat,
                "Longitude": rider_lon,
                "tooltip_html": f"<b>🛵 {cur_ord['rider']}</b><br/>Status: In Transit (65% completed)<br/>Speed: ~28 km/h"
            }])
            rider_layer = pdk.Layer(
                "ScatterplotLayer",
                data=rider_df,
                get_position=["Longitude", "Latitude"],
                get_radius=160,
                get_fill_color=[245, 158, 11, 255],
                get_line_color=[255, 255, 255, 255],
                stroked=True,
                filled=True,
                line_width_min_pixels=2.5,
                pickable=True
            )

            sim_layers = [
                other_stores_layer,
                assigned_glow_layer,
                assigned_pin_layer,
                cust_pulse_layer,
                cust_pin_layer,
                line_layer,
                arc_layer,
                rider_layer
            ]

            mid_lat = (cur_ord['store_lat'] + cur_ord['cust_lat']) / 2.0
            mid_lon = (cur_ord['store_lon'] + cur_ord['cust_lon']) / 2.0

            sim_view_state = pdk.ViewState(
                latitude=mid_lat,
                longitude=mid_lon,
                zoom=13.2,
                pitch=35,
                bearing=15
            )

            sim_deck = pdk.Deck(
                layers=sim_layers,
                initial_view_state=sim_view_state,
                map_style=pdk.map_styles.CARTO_LIGHT,
                tooltip={
                    "html": "{tooltip_html}",
                    "style": {
                        "backgroundColor": "#0f1629",
                        "color": "#e8edf9",
                        "fontFamily": "Inter, sans-serif",
                        "fontSize": "13px",
                        "borderRadius": "10px",
                        "padding": "10px 14px",
                        "boxShadow": "0 8px 24px rgba(0, 0, 0, 0.25)",
                        "border": "1px solid #1e2a47"
                    }
                }
            )

            st.pydeck_chart(sim_deck, use_container_width=True)
            st.caption("🟢 **Assigned Hub** (Store) ── 3D Arc Vector ── 🟡 **Rider** In Transit ── 🔵 **Customer** GPS Target")

        col_man1, col_man2 = st.columns([1.1, 1.3])

        with col_man1:
            st.markdown("""
            <div class="card">
              <h2 class="card-title">📦 Customer Order Manifest</h2>
              <p class="hint">Items picked & packed at dark store fulfillment staging</p>
            """, unsafe_allow_html=True)

            items_pills = "".join([
                f'<div style="padding: 7px 12px; background: rgba(99, 102, 241, 0.08); border: 1px solid var(--line); border-radius: 8px; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--tx);">🛒 {it}</div>'
                for it in cur_ord['items']
            ])

            manifest_html = f"""
              <div style="margin-bottom: 12px;">{items_pills}</div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0 4px; border-top: 1px solid var(--line); font-size: 13px;">
                <span style="color: var(--mut);">Estimated Basket Value</span>
                <span style="font-weight: 700; color: var(--tx);">₹{cur_ord['order_val']}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--mut);">
                <span>Payment Mode</span>
                <span style="font-weight: 600; color: var(--ok);">UPI / Online Paid</span>
              </div>
            </div>
            """
            st.markdown(manifest_html, unsafe_allow_html=True)

        with col_man2:
            st.markdown("""
            <div class="card">
              <h2 class="card-title">🧠 Geospatial Proximity Matrix (Haversine)</h2>
              <p class="hint">Real-time distance ranking of all operational dark store hubs to customer coordinates</p>
            """, unsafe_allow_html=True)

            prox_df = df_stores[df_stores['Status'] == 'Active'].copy()
            prox_df['Distance_km'] = prox_df.apply(
                lambda row: haversine_distance(cur_ord['cust_lat'], cur_ord['cust_lon'], row['Latitude'], row['Longitude']),
                axis=1
            )
            prox_sorted = prox_df.sort_values('Distance_km').head(6)

            matrix_rows = ""
            for i, (_, s_row) in enumerate(prox_sorted.iterrows()):
                is_winner = (s_row['Store Name'] == cur_ord['assigned_store'])
                badge = '<span class="live" style="padding: 2px 8px; font-size: 11px;">🏆 Assigned</span>' if is_winner else '<span style="color: var(--mut); font-size: 11px;">Alternate</span>'
                dist_str = f"<b>{s_row['Distance_km']:.2f} km</b>" if is_winner else f"{s_row['Distance_km']:.2f} km"
                matrix_rows += f"""
                <tr>
                  <td>{s_row['Store Name']}</td>
                  <td class="r">{dist_str}</td>
                  <td class="r">{s_row['Delivery Radius (km)']} km</td>
                  <td class="r">{badge}</td>
                </tr>
                """

            matrix_table = f"""
            <div class="tbl">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Store Hub</th>
                    <th class="r">Distance</th>
                    <th class="r">Radius</th>
                    <th class="r">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix_rows}
                </tbody>
              </table>
            </div>
            </div>
            """
            st.markdown(matrix_table, unsafe_allow_html=True)

            # If warehouse pick plan exists, render warehouse Serpentine pick path
            if cur_ord.get("warehouse_pick_plan"):
                pick_plan = cur_ord["warehouse_pick_plan"]
                st.markdown("""
                <div class="card" style="margin-top: 14px;">
                  <h2 class="card-title">🏭 Warehouse Serpentine (S-Shape) Pick Sequence</h2>
                  <p class="hint">Physical item pick path optimized to minimize picker walking time (0 backtracks)</p>
                """, unsafe_allow_html=True)
                
                pick_rows = ""
                for step in pick_plan.get("pick_sequence", []):
                    pick_rows += f"""
                    <tr>
                      <td><span class="rk">{step.get('pick_step', 1)}</span><b>{step.get('item_name')}</b></td>
                      <td class="r"><code style="color: #10b981; font-weight: 700;">Aisle {step.get('aisle')}</code></td>
                      <td class="r">Shelf {step.get('shelf')} ({step.get('bin')})</td>
                      <td class="r"><span class="tag">{step.get('zone')}</span></td>
                    </tr>
                    """
                pick_table_html = f"""
                <div class="tbl">
                  <table class="custom-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th class="r">Aisle</th>
                        <th class="r">Location</th>
                        <th class="r">Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pick_rows}
                    </tbody>
                  </table>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: var(--mut);">
                  <span>Strategy: <b>{pick_plan.get('pick_path_strategy', 'Serpentine S-Shape')}</b></span>
                  <span>Est. Pick Time: <b>{pick_plan.get('estimated_pick_time_seconds', 75)}s</b></span>
                </div>
                </div>
                """
                st.markdown(pick_table_html, unsafe_allow_html=True)
    else:
        # Standby Mode Display
        st.markdown("""
        <div class="card" style="text-align: center; padding: 42px 20px; margin-top: 16px;">
            <div style="font-size: 46px; margin-bottom: 12px;">📡</div>
            <h2 class="card-title" style="font-size: 20px;">Dispatch Operations Center • Standby</h2>
            <p class="hint" style="max-width: 540px; margin: 8px auto 20px auto; font-size: 13.5px; line-height: 1.6;">
                All 12 Dark Store hubs in Chhatrapati Sambhajinagar are online and operational. Place an order on the mobile app (or click <b>🚀 Simulate New Customer Order</b> above) to trigger live candidate multi-route analysis, shortest path selection, and autonomous courier tracking.
            </p>
            <div style="display: inline-flex; gap: 12px; align-items: center; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 8px 18px; border-radius: 99px;">
                <span class="live"><i></i></span>
                <span style="font-size: 12px; font-weight: 700; color: #10b981;">Hub Fleet Ready • Listening for Mobile GPS Orders</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# TAB 3: Geospatial View
# ------------------------------------------------------------------------------
with tab_map:
    st.markdown("""
    <div class="card" style="margin-bottom: 16px;">
        <h2 class="card-title">🗺️ Dark Store Service Polygons & Delivery Catchment Radii</h2>
        <p class="hint">Real-world Blinkit and Zepto service boundary polygons mapped alongside dark store locations and fulfillment buffer circles.</p>
    </div>
    """, unsafe_allow_html=True)

    map_view_mode = st.radio(
        "Select Map Engine:",
        options=["🌐 Real-World Service Polygons & Delivery Buffers (Interactive Leaflet Map)", "✨ 3D Perspective Polygons & Radii (PyDeck)"],
        index=0,
        horizontal=True
    )

    if map_view_mode == "✨ 3D Perspective Polygons & Radii (PyDeck)":
        deck_stores = filtered_stores.copy()
        if not deck_stores.empty:
            deck_stores['hub_color'] = deck_stores['Status'].apply(lambda s: [16, 185, 129, 240] if s == 'Active' else [245, 158, 11, 240])
            deck_stores['buffer_color'] = deck_stores['Status'].apply(lambda s: [99, 102, 241, 40] if s == 'Active' else [245, 158, 11, 40])
            deck_stores['buffer_stroke'] = deck_stores['Status'].apply(lambda s: [99, 102, 241, 200] if s == 'Active' else [245, 158, 11, 200])
            deck_stores['tooltip_html'] = (
                "<b>🏪 " + deck_stores['Store Name'].astype(str) + "</b><br/>"
                "Status: <b>" + deck_stores['Status'].astype(str) + "</b><br/>"
                "Coverage: " + deck_stores['Coverage Area'].astype(str) + "<br/>"
                "Delivery Radius: <b>" + deck_stores['Delivery Radius (km)'].astype(str) + " km</b> (Buffer: " + str(simulated_radius) + " km)"
            )
        else:
            deck_stores['hub_color'] = []
            deck_stores['buffer_color'] = []
            deck_stores['buffer_stroke'] = []
            deck_stores['tooltip_html'] = ""

        # Catchment Delivery Radius Circles (Buffer Layer)
        buffer_layer = pdk.Layer(
            "ScatterplotLayer",
            data=deck_stores,
            get_position=["Longitude", "Latitude"],
            get_radius=int(simulated_radius * 1000),
            get_fill_color="buffer_color",
            get_line_color="buffer_stroke",
            stroked=True,
            filled=True,
            line_width_min_pixels=2,
            pickable=True,
            auto_highlight=True
        )

        # Dark Store Hub Center Marker Points
        hub_layer = pdk.Layer(
            "ScatterplotLayer",
            data=deck_stores,
            get_position=["Longitude", "Latitude"],
            get_radius=220,
            get_fill_color="hub_color",
            get_line_color=[255, 255, 255, 255],
            stroked=True,
            filled=True,
            line_width_min_pixels=2,
            pickable=True,
            auto_highlight=True
        )

        deck_layers = [buffer_layer, hub_layer]

        # Load GeoJSON Delivery Polygons into PyDeck
        geojson_dir = os.path.join(BASE_DIR, "data", "geojson")
        if os.path.exists(geojson_dir):
            geo_files = sorted(
                glob.glob(os.path.join(geojson_dir, "*.json")) +
                glob.glob(os.path.join(geojson_dir, "*.geojson"))
            )
            for g_path in geo_files:
                if os.path.getsize(g_path) > 0:
                    try:
                        with open(g_path, "r", encoding="utf-8") as f:
                            g_data = json.load(f)
                        fname = os.path.basename(g_path).lower()
                        if "blinkit" in fname:
                            fc = [244, 208, 63, 85]
                            sc = [183, 149, 11, 230]
                        elif "zepto" in fname:
                            fc = [142, 68, 173, 85]
                            sc = [81, 46, 95, 230]
                        else:
                            fc = [99, 102, 241, 85]
                            sc = [79, 70, 229, 230]
                        
                        deck_layers.append(pdk.Layer(
                            "GeoJsonLayer",
                            data=g_data,
                            filled=True,
                            stroked=True,
                            get_fill_color=fc,
                            get_line_color=sc,
                            line_width_min_pixels=2.5,
                            pickable=True
                        ))
                    except Exception:
                        pass

        view_state = pdk.ViewState(
            latitude=19.8762,
            longitude=75.3433,
            zoom=11.8,
            pitch=35,
            bearing=10
        )

        deck = pdk.Deck(
            layers=deck_layers,
            initial_view_state=view_state,
            map_style=pdk.map_styles.CARTO_LIGHT,
            tooltip={
                "html": "{tooltip_html}",
                "style": {
                    "backgroundColor": "#0f1629",
                    "color": "#e8edf9",
                    "fontFamily": "Inter, sans-serif",
                    "fontSize": "13px",
                    "borderRadius": "10px",
                    "padding": "10px 14px",
                    "boxShadow": "0 8px 24px rgba(0, 0, 0, 0.25)",
                    "border": "1px solid #1e2a47"
                }
            }
        )

        st.pydeck_chart(deck, use_container_width=True)
        st.caption("💡 **Tip**: Showing real-world Blinkit/Zepto delivery polygons and dark store fulfillment buffer circles (3.0 km radius). Hold **Right Click + Drag** to rotate in 3D, and **Scroll** to zoom.")

    else:
        st.markdown(
            f"Interactive **Leaflet Map** with real-world **Blinkit & Zepto GeoJSON polygons** "
            f"and simulated fulfillment buffer circles (**{simulated_radius} km radius**)."
        )

        aurangabad_map = folium.Map(
            location=[19.8762, 75.3433],
            zoom_start=12,
            tiles="OpenStreetMap"
        )

        fg_stores = folium.FeatureGroup(name="🏪 Dark Store Hubs & Buffers", show=True)
        fg_blinkit = folium.FeatureGroup(name="🟡 Blinkit Service Zones", show=True)
        fg_zepto = folium.FeatureGroup(name="🟣 Zepto Service Zones", show=True)
        fg_custom = folium.FeatureGroup(name="🔵 Custom Boundary Zones", show=True)

        for _, store in filtered_stores.iterrows():
            is_active = (store['Status'] == 'Active')
            marker_color = "blue" if is_active else "orange"
            icon_type = "shopping-cart" if is_active else "clock"

            popup_html = f"""
            <div style='font-family: Inter, sans-serif; font-size: 13px; width: 220px;'>
                <h4 style='margin: 0 0 6px 0; color: #6366f1;'>{store['Store Name']}</h4>
                <p style='margin: 2px 0;'><b>Coverage:</b> {store['Coverage Area']}</p>
                <p style='margin: 2px 0;'><b>Status:</b> <span style='color: {"#10b981" if is_active else "#f59e0b"}; font-weight: bold;'>{store['Status']}</span></p>
                <p style='margin: 2px 0;'><b>Delivery Radius:</b> {simulated_radius} km</p>
            </div>
            """

            folium.Marker(
                location=[store['Latitude'], store['Longitude']],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"{store['Store Name']} ({store['Status']})",
                icon=folium.Icon(color=marker_color, icon=icon_type, prefix="fa")
            ).add_to(fg_stores)

            folium.Circle(
                location=[store['Latitude'], store['Longitude']],
                radius=simulated_radius * 1000,
                color="#6366f1" if is_active else "#f59e0b",
                weight=1.5,
                fill=True,
                fill_color="#6366f1" if is_active else "#f59e0b",
                fill_opacity=0.12,
                tooltip=f"{store['Store Name']} - {simulated_radius}km Coverage Zone"
            ).add_to(fg_stores)

        geojson_dir = os.path.join(BASE_DIR, "data", "geojson")
        loaded_polygons = []

        def sanitize_geojson_keys(obj):
            if isinstance(obj, dict):
                if 'features' in obj and isinstance(obj['features'], list):
                    for feat in obj['features']:
                        if isinstance(feat, dict) and 'properties' in feat and isinstance(feat['properties'], dict):
                            feat['properties'] = {
                                str(k).replace('-', '_'): v
                                for k, v in feat['properties'].items()
                            }
                elif 'properties' in obj and isinstance(obj['properties'], dict):
                    obj['properties'] = {
                        str(k).replace('-', '_'): v
                        for k, v in obj['properties'].items()
                    }
            return obj

        if os.path.exists(geojson_dir):
            geo_files = sorted(
                glob.glob(os.path.join(geojson_dir, "*.json")) +
                glob.glob(os.path.join(geojson_dir, "*.geojson"))
            )
            for g_path in geo_files:
                if os.path.getsize(g_path) > 0:
                    try:
                        with open(g_path, "r", encoding="utf-8") as f:
                            geo_json_data = json.load(f)

                        geo_json_data = sanitize_geojson_keys(geo_json_data)
                        fname = os.path.basename(g_path).lower()
                        zone_label = (
                            os.path.basename(g_path)
                            .replace("_geo", "")
                            .replace(".geojson", "")
                            .replace(".json", "")
                            .replace("_", " ")
                            .title()
                        )

                        if "blinkit" in fname:
                            stroke_color = "#b7950b"
                            fill_color = "#f4d03f"
                            target_fg = fg_blinkit
                            brand = "Blinkit"
                        elif "zepto" in fname:
                            stroke_color = "#512e5f"
                            fill_color = "#8e44ad"
                            target_fg = fg_zepto
                            brand = "Zepto"
                        else:
                            stroke_color = "#6366f1"
                            fill_color = "#818cf8"
                            target_fg = fg_custom
                            brand = "Custom"

                        folium.GeoJson(
                            geo_json_data,
                            name=f"{brand}: {zone_label}",
                            style_function=lambda feature, sc=stroke_color, fc=fill_color: {
                                'color': sc,
                                'fillColor': fc,
                                'weight': 3,
                                'opacity': 0.9,
                                'fillOpacity': 0.30,
                            },
                            tooltip=f"<b>{brand} Delivery Polygon:</b> {zone_label}",
                            popup=folium.Popup(
                                f"<div style='font-family: Inter, sans-serif; font-size: 13px;'>"
                                f"<b style='color: {stroke_color};'>{brand} Real-World Service Zone</b><br>"
                                f"<b>Zone:</b> {zone_label}<br>"
                                f"<b>Source:</b> {os.path.basename(g_path)}</div>",
                                max_width=260
                            )
                        ).add_to(target_fg)
                        loaded_polygons.append({
                            "Brand": brand,
                            "Zone Name": zone_label,
                            "Filename": os.path.basename(g_path),
                            "Size (bytes)": os.path.getsize(g_path)
                        })
                    except Exception:
                        pass

        fg_stores.add_to(aurangabad_map)
        fg_blinkit.add_to(aurangabad_map)
        fg_zepto.add_to(aurangabad_map)
        if fg_custom._children:
            fg_custom.add_to(aurangabad_map)

        folium.LayerControl(position="topright", collapsed=False).add_to(aurangabad_map)
        folium_static(aurangabad_map, width=1050, height=520)

        if loaded_polygons:
            st.success(f"🗺️ **{len(loaded_polygons)} Real-World Delivery Polygons Loaded**: Rendering live boundaries from `data/geojson/`.")
            with st.expander("📋 Inspect Loaded GeoJSON Zones"):
                st.dataframe(pd.DataFrame(loaded_polygons), use_container_width=True)
        else:
            st.info("💡 Place GeoJSON boundary files in `data/geojson/` to overlay real-world service boundaries.")

    st.markdown("### 🏢 Dark Store Fulfillment Hubs Directory")
    st.dataframe(
        filtered_stores[['Store Name', 'Status', 'Coverage Area', 'Delivery Radius (km)', 'Latitude', 'Longitude']],
        use_container_width=True
    )

# ------------------------------------------------------------------------------
# TAB 3: Demographic Heatmaps
# ------------------------------------------------------------------------------
with tab_demographics:
    st.markdown("""
    <div class="card" style="margin-bottom: 16px;">
        <h2 class="card-title">👥 Micro-Market Demographic Analysis & Interactive Heatmaps</h2>
        <p class="hint">Multi-dimensional correlation between population density, internet adoption, and projected order demand.</p>
    </div>
    """, unsafe_allow_html=True)

    if not filtered_df.empty:
        fig_bubble = px.scatter(
            filtered_df,
            x='Population Density (per sq km)',
            y='Predicted Online Order Volume (Monthly)',
            size='Estimated Online Shoppers',
            color='E-Commerce Activity Index (1-10)',
            hover_name='Neighborhood',
            hover_data={
                'Projected Population (2025)': ':,',
                'Internet Penetration Rate (%)': ':.1f',
                'Growth Rate (%)': ':.1f'
            },
            title="Micro-Market Shopper Density vs. Predicted Monthly Demand",
            labels={
                'Population Density (per sq km)': 'Population Density (people/km²)',
                'Predicted Online Order Volume (Monthly)': 'Predicted Monthly Orders'
            },
            color_continuous_scale=[[0, '#06b6d4'], [0.5, '#6366f1'], [1, '#8b5cf6']],
            template="plotly_white"
        )
        fig_bubble.update_layout(
            height=420,
            margin=dict(l=20, r=20, t=40, b=40),
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Inter", color="#0f172a")
        )
        st.plotly_chart(fig_bubble, use_container_width=True)

        col_c1, col_c2 = st.columns(2)

        with col_c1:
            fig_pop = px.bar(
                filtered_df.sort_values('Projected Population (2025)', ascending=False),
                x='Neighborhood',
                y='Projected Population (2025)',
                title="Projected Population (2025) by Area",
                labels={'Projected Population (2025)': 'Population'},
                color_discrete_sequence=['#6366f1'],
                template="plotly_white"
            )
            fig_pop.update_layout(
                xaxis_tickangle=-40,
                height=380,
                margin=dict(l=20, r=20, t=40, b=80),
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(family="Inter", color="#0f172a")
            )
            st.plotly_chart(fig_pop, use_container_width=True)

        with col_c2:
            fig_orders = px.bar(
                filtered_df.sort_values('Predicted Online Order Volume (Monthly)', ascending=False),
                x='Neighborhood',
                y='Predicted Online Order Volume (Monthly)',
                title="Predicted Monthly Orders by Area",
                labels={'Predicted Online Order Volume (Monthly)': 'Monthly Orders'},
                color_discrete_sequence=['#06b6d4'],
                template="plotly_white"
            )
            fig_orders.update_layout(
                xaxis_tickangle=-40,
                height=380,
                margin=dict(l=20, r=20, t=40, b=80),
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(family="Inter", color="#0f172a")
            )
            st.plotly_chart(fig_orders, use_container_width=True)

        st.markdown("### 📊 Demographic Feature Correlation Matrix")
        numeric_cols = [
            'Population Density (per sq km)',
            'Growth Rate (%)',
            'Projected Population (2025)',
            'Internet Penetration Rate (%)',
            'Estimated Online Shoppers',
            'Predicted Online Order Volume (Monthly)'
        ]
        corr_matrix = filtered_df[numeric_cols].corr()
        fig_corr = px.imshow(
            corr_matrix,
            text_auto=".2f",
            color_continuous_scale=[[0, '#f4f6fb'], [0.5, '#818cf8'], [1, '#4f46e5']],
            template="plotly_white",
            title="Correlation Matrix across Micro-Market Variables"
        )
        fig_corr.update_layout(
            height=390,
            margin=dict(l=20, r=20, t=40, b=40),
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Inter", color="#0f172a")
        )
        st.plotly_chart(fig_corr, use_container_width=True)

    else:
        st.warning("No micro-markets match current density and neighborhood filters.")

    with st.expander("🔍 Inspect Full Market Dataset & Export"):
        st.dataframe(filtered_df, use_container_width=True)
        csv_data = filtered_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Filtered Data as CSV",
            data=csv_data,
            file_name="Aurangabad_Dark_Store_Data.csv",
            mime="text/csv"
        )

# ------------------------------------------------------------------------------
# TAB 4: Demand Forecasting Engine
# ------------------------------------------------------------------------------
with tab_forecast:
    st.markdown("""
    <div class="card" style="margin-bottom: 16px;">
        <h2 class="card-title">📈 Machine Learning Demand Forecasting Engine</h2>
        <p class="hint">Predictive order volumes modeled for Aurangabad micro-markets with temporal seasonality.</p>
    </div>
    """, unsafe_allow_html=True)

    raw_df, df_model, model, X_train, y_test, y_pred, mae, rmse, r2 = get_forecasting_engine()

    m_col1, m_col2, m_col3 = st.columns(3)
    m_col1.metric("Mean Absolute Error (MAE)", f"{mae:.2f}", delta="Orders Deviation", delta_color="inverse")
    m_col2.metric("Root Mean Squared Error (RMSE)", f"{rmse:.2f}", delta="Variance", delta_color="inverse")
    m_col3.metric("Model R² Score", f"{r2:.3f}", delta="Goodness of Fit")

    fig_eval = go.Figure()
    fig_eval.add_trace(go.Scatter(
        x=y_test.index,
        y=y_test,
        mode='markers',
        name='Actual Orders',
        marker=dict(color='#6366f1', size=7, opacity=0.75)
    ))
    fig_eval.add_trace(go.Scatter(
        x=y_test.index,
        y=y_pred,
        mode='markers',
        name='Predicted Demand',
        marker=dict(color='#f59e0b', size=7, symbol='x')
    ))
    fig_eval.update_layout(
        title="Actual vs Predicted Demand on Validation Set",
        xaxis_title="Date",
        yaxis_title="Daily Orders per Hub",
        hovermode="x unified",
        template="plotly_white",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter", color="#0f172a"),
        height=380,
        margin=dict(l=20, r=20, t=40, b=40)
    )
    st.plotly_chart(fig_eval, use_container_width=True)

    st.markdown(f"### 🔮 Forward Demand Forecast ({forecast_days} Days)")
    last_date = df_model.index.max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_days, freq='D')
    future_days = np.arange(df_model['DayOfYear'].max() + 1, df_model['DayOfYear'].max() + 1 + forecast_days)
    future_weekends = (future_dates.dayofweek >= 5).astype(int)

    future_X = pd.DataFrame({
        'DayOfYear': future_days,
        'IsWeekend': future_weekends
    })
    for col in X_train.columns:
        if col not in future_X.columns:
            future_X[col] = 0

    future_pred = model.predict(future_X)
    future_df = pd.DataFrame({
        'Date': future_dates.strftime('%Y-%m-%d (%a)'),
        'Predicted Daily Demand': np.round(future_pred, 1),
        'Expected Peak Riders Needed': np.ceil(future_pred / 25).astype(int)
    })

    col_forecast_table, col_forecast_chart = st.columns([1, 2])
    with col_forecast_table:
        st.dataframe(future_df, use_container_width=True)

    with col_forecast_chart:
        fig_future = go.Figure()
        fig_future.add_trace(go.Scatter(
            x=future_dates,
            y=future_pred,
            mode='lines+markers',
            name='Forecasted Demand',
            line=dict(color='#10b981', width=3),
            marker=dict(size=8, color='#059669')
        ))
        fig_future.update_layout(
            title=f"{forecast_days}-Day Forward Demand Projection",
            xaxis_title="Timeline",
            yaxis_title="Orders / Hub",
            template="plotly_white",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Inter", color="#0f172a"),
            height=320,
            margin=dict(l=20, r=20, t=40, b=40)
        )
        st.plotly_chart(fig_future, use_container_width=True)

    st.markdown("### 🛵 Delivery Fleet Sizing Calculator")
    calc_col1, calc_col2 = st.columns(2)
    with calc_col1:
        target_orders_per_rider = st.slider(
            "Target Orders per Rider / Shift",
            min_value=15,
            max_value=40,
            value=24,
            step=1,
            help="Average fulfillment deliveries completed per rider per work shift."
        )
    with calc_col2:
        avg_forecast = float(np.mean(future_pred))
        riders_req = int(np.ceil(avg_forecast / target_orders_per_rider))
        surge_buffer = int(np.ceil(riders_req * 1.25))
        st.info(
            f"• **Base Fleet Needed**: **{riders_req} active riders** per hub.\n\n"
            f"• **Weekend Peak / Surge Buffer**: **{surge_buffer} riders** (includes 25% contingency buffer)."
        )

# ------------------------------------------------------------------------------
# TAB 5: Climate & Monsoon Delivery Impact
# ------------------------------------------------------------------------------
with tab_climate:
    st.markdown("""
    <div class="card" style="margin-bottom: 16px;">
        <h2 class="card-title">🌦️ Marathwada Climate & Monsoon Delivery Impact</h2>
        <p class="hint">Seasonal delivery bottlenecks in Aurangabad: High monsoon precipitation (July-August) and peak summer temperatures (April-May).</p>
    </div>
    """, unsafe_allow_html=True)

    c_col1, c_col2 = st.columns([2, 1])

    with c_col1:
        if not filtered_climate.empty:
            fig_climate = go.Figure()
            fig_climate.add_trace(go.Bar(
                x=filtered_climate['Month'],
                y=filtered_climate['Avg Rainfall (mm)'],
                name='Avg Rainfall (mm)',
                marker_color='#06b6d4'
            ))
            fig_climate.add_trace(go.Scatter(
                x=filtered_climate['Month'],
                y=filtered_climate['Delivery Impact Scale (1-5)'],
                name='Delivery Impact Scale (1-5)',
                yaxis='y2',
                mode='lines+markers',
                line=dict(color='#f59e0b', width=3),
                marker=dict(size=8, color='#d97706')
            ))
            fig_climate.update_layout(
                title="Rainfall vs Delivery Friction Scale in Aurangabad",
                xaxis_title="Month",
                yaxis=dict(title="Precipitation (mm)"),
                yaxis2=dict(title="Impact Scale (1-5)", overlaying='y', side='right', range=[0, 6]),
                legend=dict(x=0.01, y=0.99),
                template="plotly_white",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(family="Inter", color="#0f172a"),
                height=380,
                margin=dict(l=20, r=20, t=40, b=40)
            )
            st.plotly_chart(fig_climate, use_container_width=True)
        else:
            st.warning("No months match current weather delivery friction filter range.")

    with c_col2:
        st.markdown("### 💡 Operational Strategic Insights")
        st.info(
            "• **Monsoon Flooding Buffer**: In July-August (~185mm rainfall), low-lying corridors (e.g. Chikalthana, Beed Bypass) "
            "experience +4.5 min SLA delays. Deploy wet-weather surge incentives."
        )
        st.warning(
            "• **Summer Heatwave Surge**: In April-May (temperatures ~40.5°C), afternoon dark store volume increases "
            "by 32% as consumers avoid retail outings. Boost cold-storage beverage inventory."
        )
        st.success(
            "• **Winter Optimal Window**: November-January provides peak delivery efficiency with zero weather bottlenecks."
        )

    with st.expander("📋 View Monthly Climate & Impact Table"):
        st.dataframe(filtered_climate, use_container_width=True)

# ------------------------------------------------------------------------------
# TAB 7: Smart Inventory & Stockout Alerts
# ------------------------------------------------------------------------------
with tab_inventory:
    st.markdown("""
    <div class="card" style="margin-bottom: 20px;">
        <h2 class="card-title">📦 Smart Inventory & Real-Time Stockout Detection</h2>
        <p class="hint">Live SKU tracking across all 12 Aurangabad dark stores, predictive buffer depletion alerts, and one-click inter-hub transfer rebalancing.</p>
    </div>
    """, unsafe_allow_html=True)

    if inventory_manager is None:
        st.error("Inventory management engine is currently unavailable.")
    else:
        inv_state = inventory_manager.load_inventory_state()
        alerts = inventory_manager.get_stockout_alerts()
        catalog = inventory_manager.CATALOG_SKUS
        stores = inventory_manager.AURANGABAD_STORES

        # 1. Top KPI Summary Cards
        critical_count = sum(1 for a in alerts if a["severity"] == "CRITICAL")
        warning_count = sum(1 for a in alerts if a["severity"] == "WARNING")
        total_units = sum(sum(stock.values()) for stock in inv_state.values())
        total_skus = len(catalog) * len(stores)

        col_kpi1, col_kpi2, col_kpi3, col_kpi4 = st.columns(4)
        with col_kpi1:
            st.metric(
                label="🏢 Monitored Dark Stores",
                value=f"{len(stores)} Hubs",
                delta="100% Online"
            )
        with col_kpi2:
            st.metric(
                label="📦 Total Stock in Network",
                value=f"{total_units:,} units",
                delta=f"{len(catalog)} Core SKUs"
            )
        with col_kpi3:
            st.metric(
                label="🚨 Critical Stockouts (<10 units)",
                value=critical_count,
                delta="Immediate Action" if critical_count > 0 else "All Clear",
                delta_color="inverse" if critical_count > 0 else "normal"
            )
        with col_kpi4:
            st.metric(
                label="⚠️ Low Stock Warnings",
                value=warning_count,
                delta="Replenishment Due" if warning_count > 0 else "Nominal",
                delta_color="inverse" if warning_count > 0 else "normal"
            )

        # 2. Stockout Alerts Warning Banners
        if alerts:
            st.markdown("### 🔔 Active Operational Inventory Alerts")
            for alert in alerts[:5]:  # Show top 5 urgent alerts
                if alert["severity"] == "CRITICAL":
                    st.error(
                        f"**{alert['message']}**\n\n"
                        f"• Category: {alert['category']} | Current Stock: **{alert['current_stock']}** units "
                        f"(Threshold: {alert['threshold']} units) | Suggested Reorder: **+{alert['suggested_reorder']} units**"
                    )
                else:
                    st.warning(
                        f"**{alert['message']}**\n\n"
                        f"• Category: {alert['category']} | Current Stock: **{alert['current_stock']}** units "
                        f"(Threshold: {alert['threshold']} units) | Suggested Reorder: **+{alert['suggested_reorder']} units**"
                    )
        else:
            st.success("✅ All 12 dark stores have healthy buffer inventory across all catalog SKUs.")

        st.markdown("---")

        # 3. Store-Specific Inventory Level Inspection & Visualization
        inv_col1, inv_col2 = st.columns([1.1, 1])

        with inv_col1:
            st.markdown("### 🏪 Store SKU Inventory Explorer")
            selected_store = st.selectbox(
                "Select Aurangabad Dark Store to Inspect:",
                stores,
                index=0
            )

            store_stock = inv_state.get(selected_store, {})
            table_rows = []
            for sku in catalog:
                qty = store_stock.get(sku["sku_id"], sku["default_stock"])
                status = "🟢 Healthy"
                if qty <= sku["critical_threshold"]:
                    status = "🚨 Critical Stockout"
                elif qty <= sku["low_stock_threshold"]:
                    status = "⚠️ Low Stock"

                table_rows.append({
                    "SKU Name": sku["name"],
                    "Category": sku["category"],
                    "Unit": sku["unit"],
                    "Stock Qty": qty,
                    "Health Status": status,
                    "Unit Price (₹)": sku["unit_price"],
                    "Total Val (₹)": round(qty * sku["unit_price"], 2)
                })

            store_df = pd.DataFrame(table_rows)
            st.dataframe(store_df, use_container_width=True, height=310)

        with inv_col2:
            st.markdown(f"### 📊 Inventory vs Thresholds ({selected_store})")
            fig_inv = go.Figure()
            sku_names_short = [sku["name"].split()[0] + " " + sku["name"].split()[1] for sku in catalog]
            current_stocks = [store_stock.get(sku["sku_id"], sku["default_stock"]) for sku in catalog]
            critical_bars = [sku["critical_threshold"] for sku in catalog]

            fig_inv.add_trace(go.Bar(
                x=sku_names_short,
                y=current_stocks,
                name="Current Stock",
                marker_color=["#ef4444" if q <= c else "#f59e0b" if q <= l else "#10b981"
                              for q, c, l in zip(current_stocks, [s["critical_threshold"] for s in catalog], [s["low_stock_threshold"] for s in catalog])]
            ))
            fig_inv.add_trace(go.Scatter(
                x=sku_names_short,
                y=critical_bars,
                name="Critical Threshold",
                mode="lines+markers",
                line=dict(color="#b91c1c", width=2, dash="dash")
            ))

            fig_inv.update_layout(
                xaxis_title="SKU",
                yaxis_title="Units in Stock",
                template="plotly_white",
                legend=dict(x=0.01, y=0.99),
                height=310,
                margin=dict(l=10, r=10, t=30, b=30)
            )
            st.plotly_chart(fig_inv, use_container_width=True)

        st.markdown("---")

        # 4. Inter-Hub Inventory Rebalance & Wholesaler Restock Simulator
        st.markdown("### 🔄 Autonomous Inter-Hub Stock Replenishment Simulator")
        st.caption("When micro-market demand spikes, shift excess inventory between neighboring dark stores to avoid stockouts without waiting for central warehouse shipments.")

        col_trans1, col_trans2, col_trans3, col_trans4, col_trans5 = st.columns([1.5, 1.5, 1.5, 1, 1.2])

        with col_trans1:
            from_hub = st.selectbox(
                "Source Store (Surplus)",
                stores,
                index=0,
                key="source_hub"
            )

        with col_trans2:
            dest_stores = [s for s in stores if s != from_hub]
            to_hub = st.selectbox(
                "Destination Store (Deficit)",
                dest_stores,
                index=0,
                key="dest_hub"
            )

        with col_trans3:
            sku_options = {sku["sku_id"]: sku["name"] for sku in catalog}
            selected_sku_id = st.selectbox(
                "SKU to Transfer",
                list(sku_options.keys()),
                format_func=lambda x: sku_options[x],
                key="transfer_sku"
            )

        with col_trans4:
            transfer_qty = st.number_input("Qty Units", min_value=5, max_value=100, value=20, step=5)

        with col_trans5:
            st.write("")
            st.write("")
            if st.button("🚀 Transfer Stock", use_container_width=True):
                result = inventory_manager.transfer_inter_hub_stock(
                    from_hub, to_hub, selected_sku_id, transfer_qty
                )
                if result.get("success"):
                    st.success(result["message"])
                    time.sleep(1)
                    st.rerun()
                else:
                    st.error(result.get("error", "Transfer failed"))

        # 5. Direct Wholesaler Restock Card
        with st.expander("🏭 Restock Dark Store from Central FMCG Depot / Wholesaler"):
            r_col1, r_col2, r_col3, r_col4 = st.columns([2, 2, 1, 1])
            with r_col1:
                restock_store = st.selectbox("Dark Store to Restock", stores, key="restock_store_select")
            with r_col2:
                restock_sku = st.selectbox("SKU", list(sku_options.keys()), format_func=lambda x: sku_options[x], key="restock_sku_select")
            with r_col3:
                restock_qty = st.number_input("Add Units", min_value=10, max_value=500, value=50, step=10)
            with r_col4:
                st.write("")
                st.write("")
                if st.button("📥 Restock Depot", use_container_width=True):
                    res = inventory_manager.replenish_sku(restock_store, restock_sku, restock_qty)
                    if res.get("success"):
                        st.success(res["message"])
                        time.sleep(1)
                        st.rerun()
                    else:
                        st.error(res.get("error", "Restock failed"))
