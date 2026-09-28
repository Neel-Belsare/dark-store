import os
import json
import glob
import streamlit as st
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

# ------------------------------------------------------------------------------
# 1. Page Configuration
# ------------------------------------------------------------------------------
st.set_page_config(
    page_title="Aurangabad Dark Store Command Center",
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
    section[data-testid="stSidebar"] * {
        font-family: 'Inter', sans-serif !important;
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
    Made with ❤️ by <a href="https://www.linkedin.com/in/neel-belsare-719b9a314/" target="_blank">Neel Belsare</a>
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
    st.markdown("### 👨‍💻 Developer")
    st.markdown("**Neel Belsare**")
    st.markdown("[🔗 Connect on LinkedIn](https://www.linkedin.com/in/neel-belsare-719b9a314/)")
    st.caption("Quick-Commerce Analytics v3.0 • Command Center")

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
tab_summary, tab_map, tab_demographics, tab_forecast, tab_climate = st.tabs([
    "📊 Executive Summary",
    "🗺️ Geospatial View",
    "👥 Demographic Heatmaps",
    "📈 Demand Forecasting",
    "🌦️ Climate & Monsoon"
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
# TAB 2: Geospatial View
# ------------------------------------------------------------------------------
with tab_map:
    st.markdown("""
    <div class="card" style="margin-bottom: 16px;">
        <h2 class="card-title">🗺️ Geospatial Coverage & Network Topology</h2>
        <p class="hint">Toggle between 3D Spatial Deck (PyDeck) and 2D Real-World Service Boundaries (Leaflet).</p>
    </div>
    """, unsafe_allow_html=True)

    map_view_mode = st.radio(
        "Select Geospatial Engine:",
        options=["✨ 3D Spatial Deck (PyDeck)", "🌐 2D Service Polygons & Delivery Buffers (Leaflet / Folium)"],
        horizontal=True
    )

    if map_view_mode == "✨ 3D Spatial Deck (PyDeck)":
        deck_demographics = filtered_df.copy()
        if not deck_demographics.empty:
            deck_demographics['elevation_val'] = deck_demographics['Predicted Online Order Volume (Monthly)'].astype(float)
            deck_demographics['tooltip_html'] = (
                "<b>📍 " + deck_demographics['Neighborhood'].astype(str) + "</b><br/>"
                "Monthly Demand: <b>" + deck_demographics['Predicted Online Order Volume (Monthly)'].apply(lambda x: f"{x:,}") + " orders</b><br/>"
                "Population Density: <b>" + deck_demographics['Population Density (per sq km)'].apply(lambda x: f"{x:,}") + " /km²</b><br/>"
                "Shoppers: <b>" + deck_demographics['Estimated Online Shoppers'].apply(lambda x: f"{x:,}") + "</b>"
            )
        else:
            deck_demographics['elevation_val'] = 0.0
            deck_demographics['tooltip_html'] = ""

        deck_stores = filtered_stores.copy()
        if not deck_stores.empty:
            # Theme accents: Active = Emerald, Proposed = Amber
            deck_stores['color_r'] = deck_stores['Status'].apply(lambda s: 16 if s == 'Active' else 245)
            deck_stores['color_g'] = deck_stores['Status'].apply(lambda s: 185 if s == 'Active' else 158)
            deck_stores['color_b'] = deck_stores['Status'].apply(lambda s: 129 if s == 'Active' else 11)
            deck_stores['fill_color'] = deck_stores.apply(lambda r: [r['color_r'], r['color_g'], r['color_b'], 215], axis=1)
            deck_stores['tooltip_html'] = (
                "<b>🏪 " + deck_stores['Store Name'].astype(str) + "</b><br/>"
                "Status: <b>" + deck_stores['Status'].astype(str) + "</b><br/>"
                "Coverage: " + deck_stores['Coverage Area'].astype(str) + "<br/>"
                "Delivery Radius: <b>" + deck_stores['Delivery Radius (km)'].astype(str) + " km</b>"
            )
        else:
            deck_stores['fill_color'] = []
            deck_stores['tooltip_html'] = ""

        column_layer = pdk.Layer(
            "ColumnLayer",
            data=deck_demographics,
            get_position=["Longitude", "Latitude"],
            get_elevation="elevation_val",
            elevation_scale=0.06,
            radius=320,
            get_fill_color=[99, 102, 241, 185],
            pickable=True,
            auto_highlight=True
        )

        store_layer = pdk.Layer(
            "ScatterplotLayer",
            data=deck_stores,
            get_position=["Longitude", "Latitude"],
            get_radius=int(simulated_radius * 220),
            get_fill_color="fill_color",
            get_line_color=[255, 255, 255],
            line_width_min_pixels=2,
            pickable=True,
            auto_highlight=True
        )

        view_state = pdk.ViewState(
            latitude=19.8762,
            longitude=75.3433,
            zoom=11.6,
            pitch=45,
            bearing=15
        )

        deck = pdk.Deck(
            layers=[column_layer, store_layer],
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
        st.caption("💡 **Tip**: Hold **Right Click + Drag** to rotate in 3D, and **Scroll** to zoom. Hover over columns or store hubs for detailed metrics.")

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
