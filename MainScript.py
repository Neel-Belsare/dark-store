import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np
import plotly.graph_objects as go
import folium
from streamlit_folium import folium_static
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Streamlit page config
st.set_page_config(page_title="Dark Store Analysis", layout="wide")

# Custom footer with developer credit in bottom right corner
custom_footer = """
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
st.markdown(custom_footer, unsafe_allow_html=True)

# Sidebar with Developer info
with st.sidebar:
    st.markdown("### 👨‍💻 Developer")
    st.markdown("**Neel Belsare**")
    st.markdown("[🔗 LinkedIn Profile](https://www.linkedin.com/in/neel-belsare-719b9a314/)")
    st.markdown("---")

# Load data
def load_data():
    df = pd.read_csv("data/processed/Merged_Pune_Dark_Store_Data.csv")
    return df

df = load_data()

# Streamlit App
st.title("🛒Dark Store Feasibility Analysis")
st.markdown("### An interactive tool to identify optimal locations for Dark Stores.")

# Display raw data
if st.checkbox("Show Raw Data", key="show_data_1"):
    st.write(df.head())

# Key Metrics Visualization
st.subheader("Key Neighborhood Insights")
col1, col2 = st.columns(2)

with col1:
    fig_pop = px.bar(df, x='Neighborhood', y='Projected Population (2025)', title="Projected Population by Neighborhood")
    st.plotly_chart(fig_pop)

with col2:
    fig_orders = px.bar(df, x='Neighborhood', y='Predicted Online Order Volume (Monthly)', title="Online Order Volume")
    st.plotly_chart(fig_orders)

# Top 6 Recommended Neighborhoods
st.subheader("Top 6 Recommended Neighborhoods")
if st.button("Get Recommendations", key="recommend_button"):
    top_neighborhoods = df.nlargest(6, 'Predicted Online Order Volume (Monthly)')
    st.write(top_neighborhoods[['Neighborhood', 'Predicted Online Order Volume (Monthly)']])

# Identify Areas Requiring 2 Dark Stores
st.subheader("High-Demand Areas Requiring 2 Dark Stores")
high_demand = df[df['Predicted Online Order Volume (Monthly)'] > 80000]
if not high_demand.empty:
    st.write(high_demand[['Neighborhood', 'Predicted Online Order Volume (Monthly)']])
else:
    st.write("No areas require two Dark Stores at the moment.")

# Generate Dummy Data
def generate_dummy_data():
    dates = pd.date_range(start='2023-01-01', periods=365, freq='D')
    demand = np.random.randint(50, 500, size=len(dates)) + np.sin(np.linspace(0, 10, len(dates))) * 50
    localities = np.random.choice(['Hinjewadi', 'Baner', 'Viman Nagar', 'Kothrud', 'Magarpatta'], len(dates))
    return pd.DataFrame({'Date': dates, 'Locality': localities, 'Demand': demand})

data = generate_dummy_data()
data['DayOfYear'] = data['Date'].dt.dayofyear

data = pd.get_dummies(data, columns=['Locality'], drop_first=True)
data.set_index('Date', inplace=True)

X = data.drop(columns=['Demand'])
y = data['Demand']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Model
model = LinearRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)

# Streamlit UI
st.title("📈 Demand Forecasting Dashboard")
st.markdown("### Predict future demand for different localities with improved accuracy")

# Display Raw Data
if st.checkbox("Show Raw Data", key="show_data_2"):
    st.write(data.head())

# Improved Graph: Actual vs Predicted Demand using Scatter Plot
fig = go.Figure()
fig.add_trace(go.Scatter(x=y_test.index, y=y_test, mode='markers', name='Actual Demand', marker=dict(color='blue')))
fig.add_trace(go.Scatter(x=y_test.index, y=y_pred, mode='markers', name='Predicted Demand', marker=dict(color='red')))
fig.update_layout(title="Actual vs Predicted Demand", xaxis_title="Date", yaxis_title="Demand", legend_title="Legend")
st.plotly_chart(fig)

# Model Evaluation Metrics
st.subheader("Model Performance")
st.write(f"Mean Absolute Error (MAE): {mae:.2f}")
st.write(f"Root Mean Squared Error (RMSE): {rmse:.2f}")

# Future Predictions
st.subheader("Predict Future Demand")
days_ahead = st.slider("Select number of days ahead for prediction:", 1, 30, 7)
future_dates = pd.date_range(start=data.index[-1] + pd.Timedelta(days=1), periods=days_ahead, freq='D')
future_days = np.arange(data['DayOfYear'].max()+1, data['DayOfYear'].max()+1+days_ahead)

future_X = pd.DataFrame({'DayOfYear': future_days})
for col in X_train.columns:
    if col not in future_X.columns:
        future_X[col] = 0

future_pred = model.predict(future_X)

future_df = pd.DataFrame({'Date': future_dates, 'Predicted Demand': future_pred})
st.write(future_df)

fig_future = go.Figure()
fig_future.add_trace(go.Scatter(x=future_df['Date'], y=future_df['Predicted Demand'], mode='lines', name='Predicted Demand', line=dict(color='purple')))
fig_future.update_layout(title="Future Demand Prediction", xaxis_title="Date", yaxis_title="Predicted Demand", legend_title="Legend")
st.plotly_chart(fig_future)

# Dark Store Map
st.title("🗺️ Pune Dark Store Network")
st.markdown("### Interactive map showing the distribution of Dark Stores across Pune.")

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
        icon=folium.Icon(color="blue", icon="shopping-cart"),
    ).add_to(pune_map)

folium_static(pune_map)
