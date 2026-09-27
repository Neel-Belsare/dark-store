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
from sklearn.metrics import mean_absolute_error, mean_squared_error

# ---------------------------------------------------------
# Page Configuration
# ---------------------------------------------------------
st.set_page_config(
    page_title="Dark Store Feasibility Analysis",
    page_icon="🛒",
    layout="wide"
)

# ---------------------------------------------------------
# Custom UI Styling & Developer Credits
# ---------------------------------------------------------
custom_style = """
<style>
footer {visibility: hidden;}
.custom-footer {
    position: fixed;
    right: 20px;
    bottom: 12px;
    z-index: 999999;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: rgba(255, 255, 255, 0.9);
    padding: 6px 14px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
}
@media (prefers-color-scheme: dark) {
    .custom-footer {
        background: rgba(28, 31, 38, 0.9);
        color: #f0f0f0;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
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
"""
st.markdown(custom_style, unsafe_allow_html=True)

# Sidebar with Developer info & Navigation
with st.sidebar:
    st.markdown("### 🛒 Navigation")
    st.info("Explore feasibility analysis, demand forecasting models, and geospatial distribution.")
    st.markdown("---")
    st.markdown("### 👨‍💻 Developer")
    st.markdown("**Neel Belsare**")
    st.markdown("[🔗 LinkedIn Profile](https://www.linkedin.com/in/neel-belsare-719b9a314/)")
    st.markdown("---")

# ---------------------------------------------------------
# Data Loading & Preparation
# ---------------------------------------------------------
@st.cache_data
def load_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "processed", "Merged_Pune_Dark_Store_Data.csv")
    if not os.path.exists(data_path):
        # Fallback if run from a different subfolder
        data_path = "data/processed/Merged_Pune_Dark_Store_Data.csv"
    return pd.read_csv(data_path)

@st.cache_data
def get_forecasting_data_and_model():
    np.random.seed(42)  # Consistent baseline across runs
    dates = pd.date_range(start='2023-01-01', periods=365, freq='D')
    demand = np.random.randint(50, 500, size=len(dates)) + np.sin(np.linspace(0, 10, len(dates))) * 50
    localities = np.random.choice(['Hinjewadi', 'Baner', 'Viman Nagar', 'Kothrud', 'Magarpatta'], len(dates))
    raw_df = pd.DataFrame({'Date': dates, 'Locality': localities, 'Demand': demand})

    df_model = raw_df.copy()
    df_model['DayOfYear'] = df_model['Date'].dt.dayofyear
    df_model = pd.get_dummies(df_model, columns=['Locality'], drop_first=True)
    df_model.set_index('Date', inplace=True)

    X = df_model.drop(columns=['Demand'])
    y = df_model['Demand']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))

    return raw_df, df_model, model, X_train, y_test, y_pred, mae, rmse

# Load primary dataset
df = load_data()

# ---------------------------------------------------------
# App Header
# ---------------------------------------------------------
st.title("🛒 Dark Store Feasibility Analysis")
st.markdown("### An interactive tool to identify optimal locations for Dark Stores.")

# Tabs for structured navigation
tab1, tab2, tab3 = st.tabs([
    "📊 Feasibility & Insights",
    "📈 Demand Forecasting",
    "🗺️ Network Map"
])

# ---------------------------------------------------------
# TAB 1: Key Neighborhood Insights & Feasibility
# ---------------------------------------------------------
with tab1:
    st.subheader("Key Neighborhood Insights")
    
    if st.checkbox("Show Raw Dataset", key="show_data_1"):
        st.dataframe(df, use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        fig_pop = px.bar(
            df,
            x='Neighborhood',
            y='Projected Population (2025)',
            title="Projected Population by Neighborhood",
            color='Projected Population (2025)',
            color_continuous_scale='Blues'
        )
        st.plotly_chart(fig_pop, use_container_width=True)

    with col2:
        fig_orders = px.bar(
            df,
            x='Neighborhood',
            y='Predicted Online Order Volume (Monthly)',
            title="Predicted Online Order Volume (Monthly)",
            color='Predicted Online Order Volume (Monthly)',
            color_continuous_scale='Viridis'
        )
        st.plotly_chart(fig_orders, use_container_width=True)

    col_rec1, col_rec2 = st.columns(2)
    with col_rec1:
        st.subheader("Top 6 Recommended Neighborhoods")
        if st.button("Get Recommendations", key="recommend_button"):
            top_neighborhoods = df.nlargest(6, 'Predicted Online Order Volume (Monthly)')
            st.dataframe(
                top_neighborhoods[['Neighborhood', 'Predicted Online Order Volume (Monthly)']],
                use_container_width=True
            )

    with col_rec2:
        st.subheader("High-Demand Areas Requiring 2 Dark Stores")
        high_demand = df[df['Predicted Online Order Volume (Monthly)'] > 80000]
        if not high_demand.empty:
            st.dataframe(
                high_demand[['Neighborhood', 'Predicted Online Order Volume (Monthly)']],
                use_container_width=True
            )
        else:
            st.info("No areas require two Dark Stores at the moment.")

# ---------------------------------------------------------
# TAB 2: Demand Forecasting Dashboard
# ---------------------------------------------------------
with tab2:
    st.subheader("📈 Demand Forecasting Dashboard")
    st.markdown("Predict future demand for different localities with machine learning.")

    raw_df, df_model, model, X_train, y_test, y_pred, mae, rmse = get_forecasting_data_and_model()

    if st.checkbox("Show Forecasting Sample Data", key="show_data_2"):
        st.dataframe(df_model.head(10), use_container_width=True)

    # Actual vs Predicted Graph
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=y_test.index,
        y=y_test,
        mode='markers',
        name='Actual Demand',
        marker=dict(color='#1f77b4', size=8)
    ))
    fig.add_trace(go.Scatter(
        x=y_test.index,
        y=y_pred,
        mode='markers',
        name='Predicted Demand',
        marker=dict(color='#d62728', size=8, symbol='x')
    ))
    fig.update_layout(
        title="Actual vs Predicted Demand",
        xaxis_title="Date",
        yaxis_title="Demand",
        legend_title="Legend",
        hovermode="x unified"
    )
    st.plotly_chart(fig, use_container_width=True)

    # Model Evaluation Metrics
    st.subheader("Model Performance")
    m_col1, m_col2 = st.columns(2)
    m_col1.metric(label="Mean Absolute Error (MAE)", value=f"{mae:.2f}")
    m_col2.metric(label="Root Mean Squared Error (RMSE)", value=f"{rmse:.2f}")

    # Future Predictions Slider
    st.subheader("Predict Future Demand")
    days_ahead = st.slider("Select number of days ahead for prediction:", min_value=1, max_value=30, value=7)
    
    last_date = df_model.index.max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=days_ahead, freq='D')
    future_days = np.arange(df_model['DayOfYear'].max() + 1, df_model['DayOfYear'].max() + 1 + days_ahead)

    future_X = pd.DataFrame({'DayOfYear': future_days})
    for col in X_train.columns:
        if col not in future_X.columns:
            future_X[col] = 0

    future_pred = model.predict(future_X)
    future_df = pd.DataFrame({
        'Date': future_dates,
        'Predicted Demand': np.round(future_pred, 1)
    })
    
    st.dataframe(future_df, use_container_width=True)

    fig_future = go.Figure()
    fig_future.add_trace(go.Scatter(
        x=future_df['Date'],
        y=future_df['Predicted Demand'],
        mode='lines+markers',
        name='Predicted Demand',
        line=dict(color='#9467bd', width=3)
    ))
    fig_future.update_layout(
        title="Future Demand Prediction",
        xaxis_title="Date",
        yaxis_title="Predicted Demand",
        legend_title="Legend"
    )
    st.plotly_chart(fig_future, use_container_width=True)

# ---------------------------------------------------------
# TAB 3: Dark Store Network Map
# ---------------------------------------------------------
with tab3:
    st.subheader("🗺️ Pune Dark Store Network")
    st.markdown("Interactive geospatial map showing the distribution of Dark Stores across Pune.")

    dark_stores = [
        {"name": "Store 1 - Hinjewadi", "lat": 18.5913, "lon": 73.7389},
        {"name": "Store 2 - Baner", "lat": 18.5636, "lon": 73.7761},
        {"name": "Store 3 - Viman Nagar", "lat": 18.5679, "lon": 73.9143},
        {"name": "Store 4 - Kothrud", "lat": 18.5074, "lon": 73.8077},
        {"name": "Store 5 - Magarpatta", "lat": 18.5167, "lon": 73.9325},
        {"name": "Store 6 - FC Road", "lat": 18.5282, "lon": 73.8416},
        {"name": "Store 7 - Hadapsar", "lat": 18.4966, "lon": 73.9252},
        {"name": "Store 8 - Wagholi", "lat": 18.5793, "lon": 73.9783},
        {"name": "Store 9 - Pimple Saudagar", "lat": 18.5988, "lon": 73.7877},
        {"name": "Store 10 - Aundh", "lat": 18.5635, "lon": 73.8077},
        {"name": "Store 11 - Bavdhan", "lat": 18.5120, "lon": 73.7722},
        {"name": "Store 12 - Katraj", "lat": 18.4482, "lon": 73.8689},
        {"name": "Store 13 - Hadapsar Industrial Area", "lat": 18.5071, "lon": 73.9443}
    ]

    pune_map = folium.Map(location=[18.5204, 73.8567], zoom_start=12)
    for store in dark_stores:
        folium.Marker(
            location=[store["lat"], store["lon"]],
            popup=store["name"],
            tooltip=store["name"],
            icon=folium.Icon(color="blue", icon="shopping-cart", prefix="fa"),
        ).add_to(pune_map)

    folium_static(pune_map, width=1000, height=550)
