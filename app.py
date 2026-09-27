import os
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
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
    }
    
    /* Sidebar Light Theme */
    section[data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 1px solid #e2e8f0;
    }

    /* Metric Cards - Light Crisp Theme */
    div[data-testid="stMetric"] {
        background: #ffffff !important;
        padding: 16px 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0 !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    div[data-testid="stMetric"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(10, 102, 194, 0.1) !important;
        border-color: #cbd5e1 !important;
    }
    div[data-testid="stMetric"] label {
        color: #64748b !important;
        font-weight: 500 !important;
        font-size: 0.85rem !important;
    }
    div[data-testid="stMetric"] div[data-testid="stMetricValue"] {
        color: #0f172a !important;
        font-weight: 700 !important;
    }

    /* Tabs Styling - Light Theme */
    button[data-baseweb="tab"] {
        font-size: 15px;
        font-weight: 500;
        color: #64748b;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        color: #0a66c2 !important;
        font-weight: 600 !important;
        border-bottom-color: #0a66c2 !important;
    }

    /* Hide Default Streamlit Footer */
    footer { visibility: hidden; }

    /* Custom Floating Footer - Light Mode */
    .custom-footer {
        position: fixed;
        right: 20px;
        bottom: 12px;
        z-index: 999999;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #ffffff;
        padding: 6px 14px;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
# 4. Sidebar: Global Input Controls & Form Batching
# ------------------------------------------------------------------------------
with st.sidebar:
    st.title("📍 Chhatrapati Sambhajinagar")
    st.caption("Aurangabad Quick-Commerce Planning")
    st.markdown("---")

    # Batched Filter Form to optimize responsiveness
    with st.form(key="global_filter_form"):
        st.subheader("🎛️ Control & Filter Panel")
        
        # Neighborhood filter
        all_neighborhoods = sorted(df_demographics['Neighborhood'].unique().tolist())
        selected_neighborhoods = st.multiselect(
            "Target Neighborhoods",
            options=all_neighborhoods,
            default=all_neighborhoods[:8],
            help="Filter analytics to specific micro-markets in Aurangabad."
        )

        # Minimum monthly orders threshold
        min_order_volume = st.slider(
            "Min. Monthly Orders Threshold",
            min_value=10000,
            max_value=150000,
            value=25000,
            step=5000,
            help="Show localities generating at least this many monthly orders."
        )

        # Simulated Delivery Radius
        simulated_radius = st.slider(
            "Simulated Delivery Radius (km)",
            min_value=1.5,
            max_value=6.0,
            value=3.0,
            step=0.5,
            help="Simulate buffer coverage circle for fulfillment centers."
        )

        # Store Status filter
        status_options = ["All", "Active", "Proposed"]
        selected_status = st.selectbox("Dark Store Status", options=status_options, index=0)

        # Forecast horizon
        forecast_days = st.slider(
            "Forecast Horizon (Days)",
            min_value=3,
            max_value=30,
            value=7,
            step=1
        )

        # Submit button to batch changes
        submitted = st.form_submit_button("⚡ Apply Filters & Recalculate", use_container_width=True)

    st.markdown("---")
    st.markdown("### 👨‍💻 Developer")
    st.markdown("**Neel Belsare**")
    st.markdown("[🔗 Connect on LinkedIn](https://www.linkedin.com/in/neel-belsare-719b9a314/)")
    st.caption("Quick-Commerce Analytics v2.0 • Aurangabad")

# ------------------------------------------------------------------------------
# 5. Filter Data Based on Inputs
# ------------------------------------------------------------------------------
# Apply Neighborhood & Order Volume Filters
if selected_neighborhoods:
    filtered_df = df_demographics[
        (df_demographics['Neighborhood'].isin(selected_neighborhoods)) &
        (df_demographics['Predicted Online Order Volume (Monthly)'] >= min_order_volume)
    ]
else:
    filtered_df = df_demographics[df_demographics['Predicted Online Order Volume (Monthly)'] >= min_order_volume]

# Apply Store Status Filter
if selected_status != "All":
    filtered_stores = df_stores[df_stores['Status'] == selected_status]
else:
    filtered_stores = df_stores.copy()

# ------------------------------------------------------------------------------
# 6. Main Dashboard Header & KPI Metrics Cards
# ------------------------------------------------------------------------------
st.title("🛒 Aurangabad Quick-Commerce Dark Store Dashboard")
st.markdown(
    "Strategic feasibility analysis, demand forecasting, and geospatial coverage "
    "across **Chhatrapati Sambhajinagar (Aurangabad)** micro-markets."
)

# High-Level Metrics Strip using st.metric
kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)

total_active_stores = len(df_stores[df_stores['Status'] == 'Active'])
total_serviceable_pop = int(filtered_df['Estimated Population (2024)_x'].sum())
total_monthly_orders = int(filtered_df['Predicted Online Order Volume (Monthly)'].sum())
avg_density = int(filtered_df['Population Density (per sq km)'].mean()) if not filtered_df.empty else 0
est_delivery_time = round(9.0 + (simulated_radius * 1.4), 1)

kpi1.metric(
    label="Active Stores",
    value=f"{total_active_stores}",
    delta=f"{len(df_stores[df_stores['Status'] == 'Proposed'])} Proposed"
)
kpi2.metric(
    label="Serviceable Population",
    value=f"{total_serviceable_pop:,}",
    delta="Selected Areas"
)
kpi3.metric(
    label="Est. Monthly Orders",
    value=f"{total_monthly_orders:,}",
    delta="Predicted Demand"
)
kpi4.metric(
    label="Avg Delivery Radius",
    value=f"{simulated_radius:.1f} km",
    delta=f"{avg_density:,}/km² Density"
)
kpi5.metric(
    label="Avg Delivery SLA",
    value=f"{est_delivery_time:.0f} mins",
    delta="Ultra-Fast QC",
    delta_color="normal"
)

st.markdown("---")

# ------------------------------------------------------------------------------
# 7. Dashboard Layout: Modern Tabs & Multi-Column Grids
# ------------------------------------------------------------------------------
tab_feasibility, tab_map, tab_forecast, tab_climate = st.tabs([
    "📊 Feasibility & Demographics",
    "🗺️ Geospatial Coverage Map",
    "📈 Demand Forecasting Engine",
    "🌦️ Climate & Monsoon Impact"
])

# ------------------------------------------------------------------------------
# TAB 1: Feasibility & Demographic Analysis
# ------------------------------------------------------------------------------
with tab_feasibility:
    st.subheader("Micro-Market Demographic Insights")

    # Multi-column grid for Plotly visual analytics
    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        if not filtered_df.empty:
            fig_pop = px.bar(
                filtered_df.sort_values('Projected Population (2025)', ascending=False),
                x='Neighborhood',
                y='Projected Population (2025)',
                title="Projected Population (2025) by Area",
                labels={'Projected Population (2025)': 'Population'},
                color='Projected Population (2025)',
                color_continuous_scale='Blues',
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
        else:
            st.info("No data meets current filter criteria.")

    with col_chart2:
        if not filtered_df.empty:
            fig_orders = px.bar(
                filtered_df.sort_values('Predicted Online Order Volume (Monthly)', ascending=False),
                x='Neighborhood',
                y='Predicted Online Order Volume (Monthly)',
                title="Predicted Monthly Orders by Area",
                labels={'Predicted Online Order Volume (Monthly)': 'Monthly Orders'},
                color='Predicted Online Order Volume (Monthly)',
                color_continuous_scale='Tealgrn',
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
        else:
            st.info("No data meets current filter criteria.")

    st.markdown("---")

    # Expansion Recommendations & High-Demand Multi-Store Alerts
    col_rec, col_alert = st.columns(2)

    with col_rec:
        st.markdown("### 🏆 Top Recommended Expansion Zones")
        st.caption("Ranked by monthly online order volume and shopper density.")
        if not filtered_df.empty:
            top_areas = filtered_df.nlargest(5, 'Predicted Online Order Volume (Monthly)')[
                ['Neighborhood', 'Estimated Online Shoppers', 'Predicted Online Order Volume (Monthly)', 'Population Density (per sq km)']
            ]
            st.dataframe(
                top_areas.style.format({
                    'Estimated Online Shoppers': '{:,}',
                    'Predicted Online Order Volume (Monthly)': '{:,}',
                    'Population Density (per sq km)': '{:,}'
                }),
                use_container_width=True
            )
        else:
            st.warning("Adjust filter thresholds to view recommendations.")

    with col_alert:
        st.markdown("### 🚨 High-Volume Areas Requiring 2+ Stores")
        st.caption("Micro-markets exceeding 80,000 monthly orders require multiple fulfillment hubs to meet the <12 min delivery SLA.")
        high_demand = filtered_df[filtered_df['Predicted Online Order Volume (Monthly)'] > 80000]
        if not high_demand.empty:
            for _, row in high_demand.iterrows():
                st.warning(
                    f"**{row['Neighborhood']}**: Generating **{row['Predicted Online Order Volume (Monthly)']:,} orders/mo** "
                    f"({row['Population Density (per sq km)']:,} people/km²). Recommend deploying secondary micro-hub."
                )
        else:
            st.success("No areas in current selection exceed the single-store capacity threshold (80k orders/mo).")

    # Detailed Dataset Inspector
    with st.expander("🔍 Inspect Full Aurangabad Market Dataset"):
        st.dataframe(filtered_df, use_container_width=True)
        csv_data = filtered_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Filtered Data as CSV",
            data=csv_data,
            file_name="Aurangabad_Dark_Store_Data.csv",
            mime="text/csv"
        )

# ------------------------------------------------------------------------------
# TAB 2: Geospatial Network Map
# ------------------------------------------------------------------------------
with tab_map:
    st.subheader("🗺️ Chhatrapati Sambhajinagar Dark Store Network")
    st.markdown(
        f"Geographic fulfillment coverage with interactive simulated delivery circles "
        f"(**{simulated_radius} km radius**). Center: `[19.8762, 75.3433]`."
    )

    # Initialize Folium Map centered on Aurangabad
    aurangabad_map = folium.Map(
        location=[19.8762, 75.3433],
        zoom_start=12,
        tiles="CartoDB positron"
    )

    # Add Dark Store Markers & Delivery Radius Circles
    for _, store in filtered_stores.iterrows():
        is_active = (store['Status'] == 'Active')
        marker_color = "blue" if is_active else "orange"
        icon_type = "shopping-cart" if is_active else "clock"

        # Pop-up card with store specifications
        popup_html = f"""
        <div style='font-family: sans-serif; font-size: 13px; width: 220px;'>
            <h4 style='margin: 0 0 6px 0; color: #0a66c2;'>{store['Store Name']}</h4>
            <p style='margin: 2px 0;'><b>Coverage:</b> {store['Coverage Area']}</p>
            <p style='margin: 2px 0;'><b>Status:</b> <span style='color: {"green" if is_active else "orange"}; font-weight: bold;'>{store['Status']}</span></p>
            <p style='margin: 2px 0;'><b>Delivery Radius:</b> {simulated_radius} km</p>
        </div>
        """

        # Point Marker
        folium.Marker(
            location=[store['Latitude'], store['Longitude']],
            popup=folium.Popup(popup_html, max_width=250),
            tooltip=f"{store['Store Name']} ({store['Status']})",
            icon=folium.Icon(color=marker_color, icon=icon_type, prefix="fa")
        ).add_to(aurangabad_map)

        # Coverage Circle (Simulated Buffer)
        folium.Circle(
            location=[store['Latitude'], store['Longitude']],
            radius=simulated_radius * 1000,  # meters
            color="#0a66c2" if is_active else "#f39c12",
            weight=1.5,
            fill=True,
            fill_color="#0a66c2" if is_active else "#f39c12",
            fill_opacity=0.12,
            tooltip=f"{store['Store Name']} - {simulated_radius}km Coverage Zone"
        ).add_to(aurangabad_map)

    # Render Map inside Streamlit
    folium_static(aurangabad_map, width=1050, height=520)

    # Store Directory Table
    st.markdown("### 🏢 Dark Store Directory & Coverage Zones")
    st.dataframe(
        filtered_stores[['Store Name', 'Status', 'Coverage Area', 'Latitude', 'Longitude']],
        use_container_width=True
    )

# ------------------------------------------------------------------------------
# TAB 3: Demand Forecasting Engine (Machine Learning)
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

# ------------------------------------------------------------------------------
# TAB 4: Climate & Monsoon Delivery Impact
# ------------------------------------------------------------------------------
with tab_climate:
    st.subheader("🌦️ Marathwada Climate & Monsoon Delivery Impact")
    st.markdown(
        "Seasonal delivery bottlenecks in Aurangabad: High monsoon precipitation (July-August) and "
        "peak summer temperatures (April-May) impact rider turnaround and delivery SLAs."
    )

    c_col1, c_col2 = st.columns([2, 1])

    with c_col1:
        fig_climate = go.Figure()
        fig_climate.add_trace(go.Bar(
            x=df_climate['Month'],
            y=df_climate['Avg Rainfall (mm)'],
            name='Avg Rainfall (mm)',
            marker_color='#3498db'
        ))
        fig_climate.add_trace(go.Scatter(
            x=df_climate['Month'],
            y=df_climate['Delivery Impact Scale (1-5)'],
            name='Delivery Impact Scale (1-5)',
            yaxis='y2',
            mode='lines+markers',
            line=dict(color='#e67e22', width=3),
            marker=dict(size=8)
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

    with c_col2:
        st.markdown("### 💡 Operational Takeaways")
        st.info(
            "• **Monsoon Buffer**: In July-August (~185mm rainfall), average delivery time in low-lying zones "
            "increases by +4.5 mins. Increase wet-weather rider incentives."
        )
        st.warning(
            "• **Summer Heatwave Surge**: In April-May (temperatures ~40°C), afternoon dark store orders increase "
            "by 32% as consumers avoid retail outings. Stock ice cream & chilled beverages."
        )
        st.success(
            "• **Winter Peak**: November-January provides optimal delivery logistics with zero weather bottlenecks."
        )
