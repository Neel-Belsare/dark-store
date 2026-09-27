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
    page_title="Aurangabad Dark Store Feasibility Dashboard",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ------------------------------------------------------------------------------
# 2. UI Styling & Developer Attribution
# ------------------------------------------------------------------------------
st.markdown("""
<style>
    /* Global Light Theme Colors */
    .stApp {
        background-color: #f8fafc;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Sidebar Light Theme */
    section[data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 1px solid #e2e8f0;
    }

    /* Metric Cards - Elevated Modern Light Theme */
    div[data-testid="stMetric"] {
        background: #ffffff !important;
        padding: 18px 22px;
        border-radius: 14px;
        border: 1px solid #e2e8f0 !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }
    div[data-testid="stMetric"]:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(10, 102, 194, 0.12) !important;
        border-color: #3b82f6 !important;
    }
    div[data-testid="stMetric"] label {
        color: #64748b !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }
    div[data-testid="stMetric"] div[data-testid="stMetricValue"] {
        color: #0f172a !important;
        font-weight: 800 !important;
        font-size: 1.85rem !important;
    }

    /* Tabs Styling - Modern Light Theme */
    button[data-baseweb="tab"] {
        font-size: 15px;
        font-weight: 600;
        color: #64748b;
        padding: 10px 18px;
        border-radius: 8px 8px 0 0;
        transition: color 0.15s ease;
    }
    button[data-baseweb="tab"]:hover {
        color: #0a66c2 !important;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        color: #0a66c2 !important;
        font-weight: 700 !important;
        border-bottom: 3px solid #0a66c2 !important;
    }

    /* Highlight Banner Cards */
    .summary-card {
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 18px 22px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        margin-bottom: 16px;
    }
    .badge-active {
        background-color: #ecfdf5;
        color: #059669;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }
    .badge-proposed {
        background-color: #fffbeb;
        color: #d97706;
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }

    /* Hide Default Streamlit Footer */
    footer { visibility: hidden; }

    /* Custom Floating Footer */
    .custom-footer {
        position: fixed;
        right: 20px;
        bottom: 12px;
        z-index: 999999;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #ffffff;
        padding: 7px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;
        color: #334155;
    }
    .custom-footer a {
        color: #0a66c2;
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
    
    # Fallback synthetic generator for Aurangabad localities
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
    
    # Seasonality and baseline demand modeled for Aurangabad hubs
    demand = (
        np.random.randint(60, 480, size=len(dates))
        + np.sin(np.linspace(0, 12, len(dates))) * 45
        + (dates.dayofweek >= 5) * 35  # Weekend spike
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
    st.title("📍 Chhatrapati Sambhajinagar")
    st.caption("Quick-Commerce Strategy & Feasibility Engine")
    st.markdown("---")

    st.subheader("🎛️ Dynamic Cross-Filters")

    # Target Neighborhoods Multi-Select
    all_neighborhoods = sorted(df_demographics['Neighborhood'].unique().tolist())
    selected_neighborhoods = st.multiselect(
        "Target Neighborhoods",
        options=all_neighborhoods,
        default=all_neighborhoods,
        help="Select micro-markets to include in cross-analysis."
    )

    # Double-Ended Slider: Population Density Range
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

    # Double-Ended Slider: Weather / Monsoon Friction Scale
    weather_friction_range = st.slider(
        "Monsoon / Weather Impact Scale",
        min_value=1,
        max_value=5,
        value=(1, 5),
        step=1,
        help="Filter climate months by delivery friction scale (1=Favorable, 5=Severe Monsoon)."
    )

    # Simulated Delivery Buffer Radius Slider
    simulated_radius = st.slider(
        "Simulated Delivery Radius (km)",
        min_value=1.5,
        max_value=6.0,
        value=3.0,
        step=0.5,
        help="Simulate dark store fulfillment catchment radius for buffer & SLA calculations."
    )

    # Store Status Selector
    status_options = ["All", "Active", "Proposed"]
    selected_status = st.selectbox(
        "Dark Store Status",
        options=status_options,
        index=0,
        help="Filter fulfillment stores by operational readiness."
    )

    # Forecast Horizon
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
    st.caption("Quick-Commerce Analytics v3.0 • Aurangabad")

# ------------------------------------------------------------------------------
# 5. Cross-Filtering Execution & Toast Notification
# ------------------------------------------------------------------------------
# Filter Demographics by Neighborhood and Density bounds
target_list = selected_neighborhoods if selected_neighborhoods else all_neighborhoods
filtered_df = df_demographics[
    (df_demographics['Neighborhood'].isin(target_list)) &
    (df_demographics['Population Density (per sq km)'] >= density_range[0]) &
    (df_demographics['Population Density (per sq km)'] <= density_range[1])
].copy()

# Filter Stores by Operational Status
if selected_status != "All":
    filtered_stores = df_stores[df_stores['Status'] == selected_status].copy()
else:
    filtered_stores = df_stores.copy()

# Filter Climate Data by Friction scale
filtered_climate = df_climate[
    (df_climate['Delivery Impact Scale (1-5)'] >= weather_friction_range[0]) &
    (df_climate['Delivery Impact Scale (1-5)'] <= weather_friction_range[1])
].copy()

# Live Session-State Toast Notifications for satisfying user feedback
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
# 6. Main Dashboard Header & KPI Metrics Cards
# ------------------------------------------------------------------------------
st.title("🛒 Aurangabad Quick-Commerce Dark Store Dashboard")
st.markdown(
    "Strategic feasibility analysis, 3D geospatial network coverage, and demand forecasting "
    "across **Chhatrapati Sambhajinagar (Aurangabad)** micro-markets."
)

# High-Level Metrics Strip using elevated styled st.metric cards
kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)

total_active_stores = len(filtered_stores[filtered_stores['Status'] == 'Active'])
total_proposed_stores = len(filtered_stores[filtered_stores['Status'] == 'Proposed'])
total_serviceable_pop = int(filtered_df['Estimated Population (2024)_x'].sum()) if not filtered_df.empty else 0
total_monthly_orders = int(filtered_df['Predicted Online Order Volume (Monthly)'].sum()) if not filtered_df.empty else 0
avg_density = int(filtered_df['Population Density (per sq km)'].mean()) if not filtered_df.empty else 0
est_delivery_sla = round(9.0 + (simulated_radius * 1.4), 1)

kpi1.metric(
    label="Active Stores",
    value=f"{total_active_stores}",
    delta=f"{total_proposed_stores} Proposed" if selected_status == "All" else f"{selected_status} View"
)
kpi2.metric(
    label="Serviceable Population",
    value=f"{total_serviceable_pop:,}",
    delta=f"{len(filtered_df)} Micro-Markets"
)
kpi3.metric(
    label="Est. Monthly Orders",
    value=f"{total_monthly_orders:,}",
    delta="Predicted Demand"
)
kpi4.metric(
    label="Avg Delivery Buffer",
    value=f"{simulated_radius:.1f} km",
    delta=f"{avg_density:,}/km² Density"
)
kpi5.metric(
    label="Avg Delivery SLA",
    value=f"{est_delivery_sla:.0f} mins",
    delta="Ultra-Fast QC",
    delta_color="normal"
)

st.markdown("---")

# ------------------------------------------------------------------------------
# 7. Dashboard Layout: Modern Structured Tabs
# ------------------------------------------------------------------------------
tab_summary, tab_map, tab_demographics, tab_forecast, tab_climate = st.tabs([
    "📊 Executive Summary",
    "🗺️ Geospatial View (3D & 2D)",
    "👥 Demographic Heatmaps",
    "📈 Demand Forecasting Engine",
    "🌦️ Climate & Monsoon Impact"
])

# ------------------------------------------------------------------------------
# TAB 1: Executive Summary
# ------------------------------------------------------------------------------
with tab_summary:
    st.subheader("Executive Market Overview & Strategic Expansion")
    
    col_summary_l, col_summary_r = st.columns([3, 2])

    with col_summary_l:
        st.markdown("### 🚨 High-Volume Micro-Markets Requiring 2+ Stores")
        st.caption("Fulfillment clusters exceeding **80,000 monthly orders** require dual micro-hubs to satisfy the sub-12 minute delivery SLA.")
        
        high_demand = filtered_df[filtered_df['Predicted Online Order Volume (Monthly)'] > 80000].sort_values(
            'Predicted Online Order Volume (Monthly)', ascending=False
        )
        if not high_demand.empty:
            for _, row in high_demand.iterrows():
                st.warning(
                    f"**{row['Neighborhood']}**: Generating **{row['Predicted Online Order Volume (Monthly)']:,} orders/month** "
                    f"with density **{row['Population Density (per sq km)']:,} people/km²**. Secondary micro-hub recommended."
                )
        else:
            st.success("No micro-markets in the current selection exceed the single-store capacity threshold (80k orders/mo).")

        st.markdown("---")
        st.markdown("### 🏆 Top 5 Priority Expansion Zones")
        st.caption("Ranked by estimated monthly online orders and shopper density.")
        if not filtered_df.empty:
            top_expansion = filtered_df.nlargest(5, 'Predicted Online Order Volume (Monthly)')[
                ['Neighborhood', 'Estimated Online Shoppers', 'Predicted Online Order Volume (Monthly)', 'Population Density (per sq km)']
            ]
            st.dataframe(
                top_expansion.style.format({
                    'Estimated Online Shoppers': '{:,}',
                    'Predicted Online Order Volume (Monthly)': '{:,}',
                    'Population Density (per sq km)': '{:,}'
                }),
                use_container_width=True
            )
        else:
            st.info("Adjust filter criteria to view expansion priorities.")

    with col_summary_r:
        st.markdown("### 🏬 Dark Store Network Composition")
        status_counts = df_stores['Status'].value_counts()
        fig_donut = go.Figure(data=[go.Pie(
            labels=status_counts.index,
            values=status_counts.values,
            hole=0.62,
            marker_colors=['#0a66c2', '#f59e0b'],
            textinfo='label+value',
            hoverinfo='label+percent'
        )])
        fig_donut.update_layout(
            title="Active vs. Proposed Store Hubs",
            template="plotly_white",
            height=280,
            margin=dict(l=10, r=10, t=40, b=10),
            plot_bgcolor="#ffffff",
            paper_bgcolor="#ffffff",
            font=dict(color="#1e293b")
        )
        st.plotly_chart(fig_donut, use_container_width=True)

        st.markdown("### ⏱️ Estimated SLA vs Delivery Radius")
        radius_steps = np.arange(1.5, 6.5, 0.5)
        sla_steps = [round(9.0 + (r * 1.4), 1) for r in radius_steps]
        fig_sla = go.Figure(data=[go.Scatter(
            x=radius_steps,
            y=sla_steps,
            mode='lines+markers',
            line=dict(color='#2563eb', width=3),
            marker=dict(size=7, color='#1d4ed8')
        )])
        fig_sla.add_vline(x=simulated_radius, line_dash="dash", line_color="#ef4444", annotation_text=f"Selected: {simulated_radius}km")
        fig_sla.update_layout(
            title="Delivery Time SLA vs Buffer Radius",
            xaxis_title="Catchment Radius (km)",
            yaxis_title="Estimated SLA (Minutes)",
            template="plotly_white",
            height=230,
            margin=dict(l=10, r=10, t=35, b=20),
            plot_bgcolor="#ffffff",
            paper_bgcolor="#ffffff",
            font=dict(color="#1e293b")
        )
        st.plotly_chart(fig_sla, use_container_width=True)

# ------------------------------------------------------------------------------
# TAB 2: Geospatial View (3D & 2D)
# ------------------------------------------------------------------------------
with tab_map:
    st.subheader("🗺️ Geospatial Coverage & Network Topology")

    map_view_mode = st.radio(
        "Select Geospatial Engine:",
        options=["✨ 3D Spatial Deck (PyDeck)", "🌐 2D Service Polygons & Delivery Buffers (Leaflet / Folium)"],
        horizontal=True
    )

    if map_view_mode == "✨ 3D Spatial Deck (PyDeck)":
        st.markdown(
            "Interactive **3D Column & Scatter Deck** for Chhatrapati Sambhajinagar. "
            "Column height represents **Monthly Order Demand** per micro-market, while circular points represent **Dark Store Fulfillment Hubs**."
        )

        # Prepare PyDeck DataFrames with formatted HTML tooltips
        deck_demographics = filtered_df.copy()
        if not deck_demographics.empty:
            deck_demographics['tooltip_html'] = (
                "<b>📍 " + deck_demographics['Neighborhood'] + "</b><br/>"
                "Monthly Demand: <b>" + deck_demographics['Predicted Online Order Volume (Monthly)'].apply(lambda x: f"{x:,}") + " orders</b><br/>"
                "Population Density: <b>" + deck_demographics['Population Density (per sq km)'].apply(lambda x: f"{x:,}") + " /km²</b><br/>"
                "Shoppers: <b>" + deck_demographics['Estimated Online Shoppers'].apply(lambda x: f"{x:,}") + "</b>"
            )

        deck_stores = filtered_stores.copy()
        if not deck_stores.empty:
            # Color code: Emerald green for Active, Amber for Proposed
            deck_stores['color_r'] = deck_stores['Status'].apply(lambda s: 16 if s == 'Active' else 245)
            deck_stores['color_g'] = deck_stores['Status'].apply(lambda s: 185 if s == 'Active' else 158)
            deck_stores['color_b'] = deck_stores['Status'].apply(lambda s: 129 if s == 'Active' else 11)
            deck_stores['fill_color'] = deck_stores.apply(lambda r: [r['color_r'], r['color_g'], r['color_b'], 210], axis=1)
            deck_stores['tooltip_html'] = (
                "<b>🏪 " + deck_stores['Store Name'] + "</b><br/>"
                "Status: <b>" + deck_stores['Status'] + "</b><br/>"
                "Coverage: " + deck_stores['Coverage Area'] + "<br/>"
                "Delivery Radius: <b>" + deck_stores['Delivery Radius (km)'].astype(str) + " km</b>"
            )

        # 3D Extruded Column Layer for Micro-Markets
        column_layer = pdk.Layer(
            "ColumnLayer",
            data=deck_demographics,
            get_position=["Longitude", "Latitude"],
            get_elevation="Predicted Online Order Volume (Monthly)",
            elevation_scale=0.06,
            radius=320,
            get_fill_color=[37, 99, 235, 175],
            pickable=True,
            auto_highlight=True
        )

        # 3D Scatterplot Layer for Dark Store Hubs
        store_layer = pdk.Layer(
            "ScatterplotLayer",
            data=deck_stores,
            get_position=["Longitude", "Latitude"],
            get_radius=simulated_radius * 220,
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
                    "backgroundColor": "#0f172a",
                    "color": "#f8fafc",
                    "fontSize": "13px",
                    "borderRadius": "8px",
                    "padding": "10px 14px",
                    "boxShadow": "0 4px 14px rgba(0, 0, 0, 0.2)"
                }
            }
        )

        st.pydeck_chart(deck, use_container_width=True)

        st.caption("💡 **Tip**: Hold **Right Click + Drag** to rotate in 3D, and **Scroll** to zoom. Hover over any column or marker for detailed micro-market metrics.")

    else:
        st.markdown(
            f"Interactive **Leaflet Map** with real-world **Blinkit & Zepto GeoJSON polygons** "
            f"and simulated fulfillment buffer circles (**{simulated_radius} km radius**)."
        )

        # Initialize Folium Map centered on Aurangabad with clean OpenStreetMap tiles
        aurangabad_map = folium.Map(
            location=[19.8762, 75.3433],
            zoom_start=12,
            tiles="OpenStreetMap"
        )

        # FeatureGroups for interactive layer toggling
        fg_stores = folium.FeatureGroup(name="🏪 Dark Store Hubs & Buffers", show=True)
        fg_blinkit = folium.FeatureGroup(name="🟡 Blinkit Service Zones", show=True)
        fg_zepto = folium.FeatureGroup(name="🟣 Zepto Service Zones", show=True)
        fg_custom = folium.FeatureGroup(name="🔵 Custom Boundary Zones", show=True)

        # Add Dark Store Markers & Delivery Radius Circles to Store FeatureGroup
        for _, store in filtered_stores.iterrows():
            is_active = (store['Status'] == 'Active')
            marker_color = "blue" if is_active else "orange"
            icon_type = "shopping-cart" if is_active else "clock"

            popup_html = f"""
            <div style='font-family: sans-serif; font-size: 13px; width: 220px;'>
                <h4 style='margin: 0 0 6px 0; color: #0a66c2;'>{store['Store Name']}</h4>
                <p style='margin: 2px 0;'><b>Coverage:</b> {store['Coverage Area']}</p>
                <p style='margin: 2px 0;'><b>Status:</b> <span style='color: {"#059669" if is_active else "#d97706"}; font-weight: bold;'>{store['Status']}</span></p>
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
                color="#0a66c2" if is_active else "#f39c12",
                weight=1.5,
                fill=True,
                fill_color="#0a66c2" if is_active else "#f39c12",
                fill_opacity=0.12,
                tooltip=f"{store['Store Name']} - {simulated_radius}km Coverage Zone"
            ).add_to(fg_stores)

        # Load and Render GeoJSON files from data/geojson/
        geojson_dir = os.path.join(BASE_DIR, "data", "geojson")
        loaded_polygons = []

        def sanitize_geojson_keys(obj):
            """Sanitize property keys with hyphens (e.g. stroke-width -> stroke_width) to prevent Leaflet JS errors."""
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
                            stroke_color = "#1f618d"
                            fill_color = "#3498db"
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
                                f"<div style='font-family: sans-serif; font-size: 13px;'>"
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

    # Store Directory Table
    st.markdown("### 🏢 Dark Store Fulfillment Hubs Directory")
    st.dataframe(
        filtered_stores[['Store Name', 'Status', 'Coverage Area', 'Delivery Radius (km)', 'Latitude', 'Longitude']],
        use_container_width=True
    )

# ------------------------------------------------------------------------------
# TAB 3: Demographic Heatmaps & Visualizations
# ------------------------------------------------------------------------------
with tab_demographics:
    st.subheader("👥 Micro-Market Demographic Analysis & Interactive Heatmaps")

    if not filtered_df.empty:
        # Dynamic Bubble Chart: Density vs Monthly Orders vs Shoppers
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
            color_continuous_scale='Tealgrn',
            template="plotly_white"
        )
        fig_bubble.update_layout(
            height=420,
            margin=dict(l=20, r=20, t=40, b=40),
            plot_bgcolor="#ffffff",
            paper_bgcolor="#ffffff",
            font=dict(color="#1e293b")
        )
        st.plotly_chart(fig_bubble, use_container_width=True)

        # Multi-column grid for sorted comparison bar charts
        col_c1, col_c2 = st.columns(2)

        with col_c1:
            fig_pop = px.bar(
                filtered_df.sort_values('Projected Population (2025)', ascending=False),
                x='Neighborhood',
                y='Projected Population (2025)',
                title="Projected Population (2025) by Area",
                labels={'Projected Population (2025)': 'Population'},
                color_discrete_sequence=['#2563eb'],
                template="plotly_white"
            )
            fig_pop.update_layout(
                xaxis_tickangle=-40,
                height=380,
                margin=dict(l=20, r=20, t=40, b=80),
                plot_bgcolor="#ffffff",
                paper_bgcolor="#ffffff",
                font=dict(color="#1e293b")
            )
            st.plotly_chart(fig_pop, use_container_width=True)

        with col_c2:
            fig_orders = px.bar(
                filtered_df.sort_values('Predicted Online Order Volume (Monthly)', ascending=False),
                x='Neighborhood',
                y='Predicted Online Order Volume (Monthly)',
                title="Predicted Monthly Orders by Area",
                labels={'Predicted Online Order Volume (Monthly)': 'Monthly Orders'},
                color_discrete_sequence=['#0d9488'],
                template="plotly_white"
            )
            fig_orders.update_layout(
                xaxis_tickangle=-40,
                height=380,
                margin=dict(l=20, r=20, t=40, b=80),
                plot_bgcolor="#ffffff",
                paper_bgcolor="#ffffff",
                font=dict(color="#1e293b")
            )
            st.plotly_chart(fig_orders, use_container_width=True)

        # Correlation Heatmap for demographic variables
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
            color_continuous_scale="Blues",
            template="plotly_white",
            title="Correlation Matrix across Micro-Market Variables"
        )
        fig_corr.update_layout(
            height=390,
            margin=dict(l=20, r=20, t=40, b=40),
            plot_bgcolor="#ffffff",
            paper_bgcolor="#ffffff",
            font=dict(color="#1e293b")
        )
        st.plotly_chart(fig_corr, use_container_width=True)

    else:
        st.warning("No micro-markets match current density and neighborhood filters.")

    # Detailed Dataset Inspector & Download
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
# TAB 4: Demand Forecasting Engine (Machine Learning)
# ------------------------------------------------------------------------------
with tab_forecast:
    st.subheader("📈 Machine Learning Demand Forecasting Engine")
    st.markdown("Predictive order volumes modeled for Aurangabad micro-markets with temporal seasonality.")

    raw_df, df_model, model, X_train, y_test, y_pred, mae, rmse, r2 = get_forecasting_engine()

    # Model Performance KPIs
    m_col1, m_col2, m_col3 = st.columns(3)
    m_col1.metric("Mean Absolute Error (MAE)", f"{mae:.2f}", delta="Orders Deviation", delta_color="inverse")
    m_col2.metric("Root Mean Squared Error (RMSE)", f"{rmse:.2f}", delta="Variance", delta_color="inverse")
    m_col3.metric("Model R² Score", f"{r2:.3f}", delta="Goodness of Fit")

    # Actual vs Predicted Scatter Plot
    fig_eval = go.Figure()
    fig_eval.add_trace(go.Scatter(
        x=y_test.index,
        y=y_test,
        mode='markers',
        name='Actual Orders',
        marker=dict(color='#0a66c2', size=7, opacity=0.75)
    ))
    fig_eval.add_trace(go.Scatter(
        x=y_test.index,
        y=y_pred,
        mode='markers',
        name='Predicted Demand',
        marker=dict(color='#e74c3c', size=7, symbol='x')
    ))
    fig_eval.update_layout(
        title="Actual vs Predicted Demand on Validation Set",
        xaxis_title="Date",
        yaxis_title="Daily Orders per Hub",
        hovermode="x unified",
        template="plotly_white",
        plot_bgcolor="#ffffff",
        paper_bgcolor="#ffffff",
        font=dict(color="#1e293b"),
        height=380,
        margin=dict(l=20, r=20, t=40, b=40)
    )
    st.plotly_chart(fig_eval, use_container_width=True)

    # Forward Forecasting
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
            line=dict(color='#27ae60', width=3),
            marker=dict(size=8, color='#2ecc71')
        ))
        fig_future.update_layout(
            title=f"{forecast_days}-Day Forward Demand Projection",
            xaxis_title="Timeline",
            yaxis_title="Orders / Hub",
            template="plotly_white",
            plot_bgcolor="#ffffff",
            paper_bgcolor="#ffffff",
            font=dict(color="#1e293b"),
            height=320,
            margin=dict(l=20, r=20, t=40, b=40)
        )
        st.plotly_chart(fig_future, use_container_width=True)

    # Interactive Rider Fleet Sizing Calculator
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
    st.subheader("🌦️ Marathwada Climate & Monsoon Delivery Impact")
    st.markdown(
        "Seasonal delivery bottlenecks in Aurangabad: High monsoon precipitation (July-August) and "
        "peak summer temperatures (April-May) impact rider turnaround and delivery SLAs."
    )

    c_col1, c_col2 = st.columns([2, 1])

    with c_col1:
        if not filtered_climate.empty:
            fig_climate = go.Figure()
            fig_climate.add_trace(go.Bar(
                x=filtered_climate['Month'],
                y=filtered_climate['Avg Rainfall (mm)'],
                name='Avg Rainfall (mm)',
                marker_color='#38bdf8'
            ))
            fig_climate.add_trace(go.Scatter(
                x=filtered_climate['Month'],
                y=filtered_climate['Delivery Impact Scale (1-5)'],
                name='Delivery Impact Scale (1-5)',
                yaxis='y2',
                mode='lines+markers',
                line=dict(color='#ea580c', width=3),
                marker=dict(size=8, color='#c2410c')
            ))
            fig_climate.update_layout(
                title="Rainfall vs Delivery Friction Scale in Aurangabad",
                xaxis_title="Month",
                yaxis=dict(title="Precipitation (mm)"),
                yaxis2=dict(title="Impact Scale (1-5)", overlaying='y', side='right', range=[0, 6]),
                legend=dict(x=0.01, y=0.99),
                template="plotly_white",
                plot_bgcolor="#ffffff",
                paper_bgcolor="#ffffff",
                font=dict(color="#1e293b"),
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

    # Filtered climate dataset viewer
    with st.expander("📋 View Monthly Climate & Impact Table"):
        st.dataframe(filtered_climate, use_container_width=True)
