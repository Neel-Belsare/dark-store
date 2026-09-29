# 🛒 Aurangabad (Chhatrapati Sambhajinagar) Quick-Commerce Ecosystem (v3.0 Production) 📊
**An AI-Powered Dark Store Command Center & Real-Time Blinkit Clone Mobile App**

[![Release](https://img.shields.io/badge/Release-v3.0.0-0C831F?logo=github)](https://github.com/NeelBelsare/my-dark-store-app/releases/tag/v3.0.0)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.32%2B-ff4b4b?logo=streamlit)](https://streamlit.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3ECF8E?logo=supabase)](https://supabase.com)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2051-61DAFB?logo=react)](https://reactnative.dev/)
[![PyDeck](https://img.shields.io/badge/PyDeck-Deck.gl%203D-blueviolet)](https://deckgl.readthedocs.io/)
[![Deployed on Streamlit](https://img.shields.io/badge/Live%20Dashboard-Streamlit%20Cloud-00c853?logo=streamlit)](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)
[![Deployed on Netlify](https://img.shields.io/badge/Live%20Consumer%20Client-Netlify-00C7B7?logo=netlify)](https://blinkit-aurangabad.netlify.app)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Neel%20Belsare-0A66C2?logo=linkedin)](https://www.linkedin.com/in/neel-belsare-719b9a314/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mansi%20Gaike-0A66C2?logo=linkedin)](https://www.linkedin.com/in/mansi-gaike-821260316)
[![GitHub](https://img.shields.io/badge/GitHub-NeelBelsare-181717?logo=github)](https://github.com/NeelBelsare)
[![GitHub](https://img.shields.io/badge/GitHub-gaikemansi03--sketch-181717?logo=github)](https://github.com/gaikemansi03-sketch)

---

## 🌐 Live Deployments & Links
- 📱 **Blinkit Consumer Client (Live Web App)**: [**blinkit-aurangabad.netlify.app**](https://blinkit-aurangabad.netlify.app)
- 🚀 **Streamlit Command Center (Live Dashboard)**: [**my-dark-store-app.streamlit.app**](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)
- 🔗 **GitHub Repository**: [**NeelBelsare/my-dark-store-app**](https://github.com/NeelBelsare/my-dark-store-app)
- 👨‍💻 **Developers**: [**Neel Belsare**](https://www.linkedin.com/in/neel-belsare-719b9a314/) & [**Mansi Gaike**](https://www.linkedin.com/in/mansi-gaike-821260316) 

---

## 📸 Application Screenshots & Live Visual Showcase

Experience the full-stack quick-commerce workflow from customer cart placement to autonomous dispatch, courier street navigation, and command center analytics.

### 📱 1. React Native Consumer Mobile App & Live Road Tracking
*Direct Supabase cloud synchronization, live street routing, and real-time courier milestone status.*

<p align="center">
  <img src="./docs/screenshots/01_mobile_app_live_dispatch.png" width="360" alt="Blinkit Mobile App Live GPS Dispatch" />
</p>
<p align="center"><i>Figure 1: React Native (Expo) consumer mobile client with live road dispatch, rider status stepper, and 0.34 km courier proximity tracking.</i></p>

---

### 🖥️ 2. Streamlit Dark Store Command Center & 3D Spatial Telemetry
*High-precision urban logistics monitoring with 3D PyDeck ArcLayers, dynamic multi-variable cross-filters, and macro KPI modeling.*

| 🛰️ 3D PyDeck Live Dispatch Telemetry | ⚙️ Dynamic Cross-Filters & Executive KPIs |
| :---: | :---: |
| <img src="./docs/screenshots/02_command_center_telemetry.png" width="480" alt="3D PyDeck Live Dispatch Telemetry" /> | <img src="./docs/screenshots/03_command_center_kpis_filters.png" width="400" alt="Executive KPIs and Cross-Filters" /> |
| *Figure 2: Real-time order dispatch visualizer showing 3D vector arcs, store assignment (Store 10 - Railway Station), and courier routing.* | *Figure 3: Command Center control panel with demand sliders, weather impact scale, and citywide macro KPIs (1.91M population, 1.35M monthly orders).* |

---

### 🗺️ 3. Geographic Hub Catchment & Delivery Polygons
*Comprehensive spatial coverage across Chhatrapati Sambhajinagar with 12 dark store hubs holding a sub-12 minute delivery promise.*

<p align="center">
  <img src="./docs/screenshots/04_dark_store_network_geospatial.png" width="620" alt="12-Hub Dark Store Geographic Coverage" />
</p>
<p align="center"><i>Figure 4: 12-Hub Dark Store fulfillment network with 3.0 km circular delivery radii and service boundaries across CIDCO, Kranti Chowk, Beed Bypass, and Waluj MIDC.</i></p>

---

## 💡 Project Architecture & Overview

This project provides an end-to-end **Quick-Commerce Dark Store Management & Consumer Ecosystem** designed for **Chhatrapati Sambhajinagar (Aurangabad)**. 

It connects four synchronized tiers:
1. **Frontend Mobile App (`mobile-app/`)**: A high-performance **React Native (Expo)** mobile application (Blinkit clone) featuring device GPS location locking, cart management, free delivery tier, celebratory micro-animations, instant checkout, and direct Supabase synchronization. Includes dedicated **Rider Partner Mode** with turn-by-turn road route tracking.
2. **Autonomous Dispatch Bridge (`api.py`)**: A **FastAPI** backend that receives live GPS coordinates from the mobile app, enforces GeoJSON serviceability catchments, runs Haversine nearest-hub routing against 12 Aurangabad dark stores, assigns delivery riders, computes predictive weather/traffic SLAs, manages live inventory decrement, and syncs order payloads.
3. **Cloud Database & Realtime Layer (Supabase PostgreSQL)**: A cloud database providing persistent storage for `stores`, `riders`, `users`, `orders`, `order_items`, and `store_inventory` with native PostGIS geospatial support, Row Level Security, and Realtime WebSocket event broadcasting.
4. **Analytics & Command Center (`app.py`)**: A modern **Streamlit** dashboard featuring 3D PyDeck telemetry (flight arcs, concentric pulse rings, moving riders), Leaflet vector GeoJSON delivery zones, ML demand forecasting, climate friction simulations, unit economics, and Smart Inventory Management.

<div align="center">
  <img src="docs/screenshots/architecture_flowchart.png" alt="Quick-Commerce End-to-End System Architecture Flowchart" width="100%" style="border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.18);" />
  <p><em>Figure 0: End-to-end synchronized 4-tier production architecture spanning mobile client, edge dispatch engine, Supabase cloud database, and Streamlit command center.</em></p>
</div>

---

## 📂 Detailed Folder Structure

Below is the complete file and folder breakdown of the repository:

```
📦 Dark-Store-Feasibility-Analysis
├── 📄 app.py                             # Main Streamlit Command Center web application (UI, 3D maps, ML, KPIs, Inventory)
├── 📄 api.py                             # FastAPI REST bridge connecting mobile orders to the Streamlit visualizer
├── 📄 inventory_manager.py               # Smart Inventory engine (SKU catalog, auto-decrement, stockout alerts, transfers)
├── 📄 supabase_client.py                 # Supabase Python client (orders, riders, stores with zero-downtime fallback)
├── 📄 supabase_schema.sql                # Complete SQL migration script (stores, riders, users, orders, store_inventory, RLS)
├── 📄 MainScript.py                      # Core Python data modeling and analytics pipeline
├── 📄 requirements.txt                   # Python dependencies (Streamlit, FastAPI, Supabase, PyDeck, Folium, Plotly, etc.)
├── 📄 Dockerfile                         # Production containerization configuration
├── 📄 docker-compose.yml                 # Multi-container orchestration for local dev & testing
├── 📄 DEPLOYMENT.md                      # Cloud & container deployment documentation
├── 📄 .env.example                       # Environment variables template for Supabase & API keys
├── 📄 index.html                         # GitHub Pages static redirect
├── 📄 LICENSE                            # MIT License
├── 📄 README.md                          # Full system documentation, folder structure, and usage guide
│
├── 📂 docs/
│   └── 📂 screenshots/                   # High-resolution application screenshots and visual assets
│       ├── 📄 architecture_flowchart.png            # End-to-end 4-tier system architecture diagram
│       ├── 📄 01_mobile_app_live_dispatch.png       # Mobile app live order celebration & road route
│       ├── 📄 02_command_center_telemetry.png       # 3D PyDeck spatial telemetry visualizer
│       ├── 📄 03_command_center_kpis_filters.png    # Dynamic cross-filters and macro KPIs
│       └── 📄 04_dark_store_network_geospatial.png  # 12 Dark Store geographic coverage map
│
├── 📂 mobile-app/                        # React Native (Expo) Blinkit Clone Mobile Application
│   ├── 📄 App.tsx                        # App entry point with SafeAreaProvider & Status Bar configuration
│   ├── 📄 app.json                       # Expo configuration (app metadata, GPS permissions for iOS/Android)
│   ├── 📄 package.json                   # React Native & Expo dependencies (expo-location, etc.)
│   ├── 📄 tsconfig.json                  # TypeScript compiler settings
│   ├── 📄 .env.example                   # Mobile app public Supabase environment template
│   ├── 📄 README.md                      # Dedicated mobile app setup and run guide
│   └── 📂 src/
│       ├── 📄 types.ts                   # TypeScript interfaces (GPSLocation, CartItem, OrderPayload, RiderShiftStats)
│       ├── 📂 constants/
│       │   └── 📄 theme.ts               # Blinkit brand tokens (Signature Yellow, Quick-Commerce Green)
│       ├── 📂 hooks/
│       │   └── 📄 useCurrentLocation.ts  # Expo GPS location hook, reverse geocoding, and micro-market switcher
│       ├── 📂 services/
│       │   ├── 📄 api.ts                 # HTTP client calling FastAPI bridge with offline fallback simulation
│       │   └── 📄 supabase.ts            # Lightweight Supabase REST client for order sync & reset
│       ├── 📂 components/
│       │   ├── 📄 LocationBar.tsx        # Top GPS delivery bar with live indicator & Aurangabad hub switcher
│       │   ├── 📄 CartItemRow.tsx        # Grocery items with dynamic +/- quantity steppers
│       │   ├── 📄 BillSummary.tsx        # Item total, free delivery waiver, and grand total calculations
│       │   ├── 📄 CelebrationModal.tsx   # Confetti explosion micro-animations & live order dispatch summary
│       │   └── 📄 RealDeliveryMap.tsx    # OSRM road geometry, turn-by-turn HUD, and rider rotation
│       └── 📂 screens/
│           ├── 📄 HomeScreen.tsx         # Product catalog, categories, search, and store info
│           ├── 📄 CartScreen.tsx         # Cart items, substitutions, and delivery instructions
│           ├── 📄 CheckoutScreen.tsx     # Full checkout screen with instant order CTA
│           ├── 📄 RiderScreen.tsx        # Courier Partner Mode (Accept, At Hub, Picked, Delivered stepper)
│           └── 📄 ProfileScreen.tsx      # User profile, VIP tier, default address, and telemetry links
│
├── 📂 data/                              # Datasets and Spatial Geometries
│   ├── 📂 geojson/                       # Real-world delivery service polygons (Chhatrapati Sambhajinagar)
│   │   ├── 📄 cidcoHarsul_blinkit_geo.json   # Blinkit delivery zone: CIDCO & Harsul
│   │   ├── 📄 cidco_zepto_geo.geojson        # Zepto delivery zone: CIDCO Hub
│   │   ├── 📄 deolai_blinkit_geo.json        # Blinkit delivery zone: Deolai & Beed Bypass
│   │   ├── 📄 dishanagari_zepto_geo.geojson  # Zepto delivery zone: Disha Nagari
│   │   ├── 📄 niralibag_zepto_geo.geojson    # Zepto delivery zone: Nirala Bazar / Khadkeshwar
│   │   └── 📄 usmanpura_blinkit_geo.json     # Blinkit delivery zone: Osmanpura & Kranti Chowk
│   │
│   ├── 📂 processed/                     # Cleaned, structured datasets used for dashboard & routing
│   │   ├── 📄 aurangabad_dark_stores.csv             # 12 Dark Store coordinates, radii, and operational status
│   │   ├── 📄 inventory_state.json                   # Real-time SKU stock levels across all 12 dark stores
│   │   ├── 📄 Merged_Aurangabad_Dark_Store_Data.csv  # Micro-market demographics and demand forecasts
│   │   ├── 📄 Aurangabad_Climate_Delivery_Impact.csv # Monthly temperatures, monsoon rainfall & impact scores
│   │   └── 📄 ... (Legacy Pune benchmark comparison datasets)
│   │
│   └── 📂 raw/                           # Original census, online activity, and climate records
│
└── 📂 notebooks/                         # Google Colab Data Cleaning & Feature Engineering Notebooks
    ├── 📄 Clean_Climate.ipynb            # Processes weather records into friction metrics
    └── 📄 DataCleaner.ipynb              # Merges ward census data with quick-commerce demand predictions
```

---

## 🛠️ Step-by-Step Usage Guide

### 1. Prerequisites & Environment Setup

Ensure you have **Python 3.9+** and **Node.js 18+ (with npm)** installed.

#### Clone the Repository:
```bash
git clone https://github.com/NeelBelsare/my-dark-store-app.git
cd my-dark-store-app
```

#### Install Python Dependencies:
```bash
pip install -r requirements.txt
```

---

### 2. Running the Streamlit Command Center (`app.py`)

Launch the interactive dashboard locally:
```bash
python -m streamlit run app.py
```
Open **`http://localhost:8501`** in your browser.

#### Dashboard Navigation & Tabs:
- **📊 Executive Summary**: High-level KPIs, serviceable population metrics, and top micro-market demand rankings.
- **⚡ Live Order Simulation**:
  - `🚀 Simulate New Customer Order`: Generates realistic customer GPS coordinates within Aurangabad.
  - `📱 Sync Live Mobile Order`: Seamlessly loads real-time orders triggered from the React Native mobile app.
  - **3D Animated Telemetry**: Displays curved 3D `ArcLayer` vectors, customer pulsing rings, store glow highlights, and moving in-transit courier markers.
  - **Sidebar Dispatch Pipeline**: Real-time `st.status` widget updating step-by-step from order placement to courier dispatch.
- **🗺️ Geospatial Coverage View**: Interactive Leaflet & 3D PyDeck maps showing:
  - Real-world GeoJSON delivery boundary polygons for **Blinkit** (Yellow) and **Zepto** (Purple).
  - Dark store center pins and adjustable catchment delivery buffers (radii).
- **👥 Demographic Heatmaps**: Scatter plots, population density correlations, and predictive demand distributions.
- **📈 Demand Forecasting**: Machine learning regression models predicting order frequency based on population density and income.
- **🌦️ Climate & Monsoon Impact**: Monsoon delivery friction scales, heatwave impacts, and rider safety adjustments.
- **📦 Smart Inventory & Stockouts**: Real-time SKU tracking across all 12 dark stores, critical stockout (<10 units) and low stock warnings, interactive Plotly inventory health charts, and an autonomous inter-hub replenishment simulator.

---

### 3. Running the FastAPI Dispatch Bridge (`api.py`)

The FastAPI server receives order requests with GPS coordinates from mobile devices and connects them to the Streamlit dashboard in real time.

In a separate terminal:
```bash
python3 api.py
```
- API will start at: **`http://0.0.0.0:8000`**
- **Interactive Swagger Documentation**: Visit **`http://localhost:8000/docs`**

#### Available Endpoints:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **`POST`** | `/api/order` | Receives GPS coordinates, routes to nearest dark store, computes buffered ETA, decrements stock, and syncs to Supabase |
| **`POST`** | `/api/order/reset` | Resets active order pipeline in Supabase and local cache when "Done" is triggered |
| **`GET`** | `/api/latest-order` | Returns the single active order payload for real-time mobile and dashboard synchronization |
| **`POST`** | `/api/order/rider-status` | Updates courier fulfillment lifecycle (`accepted`, `arrived_hub`, `picked_up`, `delivered`) |
| **`GET`** | `/api/inventory` | Returns complete real-time inventory state across all 12 dark stores and 8 core SKUs |
| **`GET`** | `/api/inventory/alerts` | Scans and returns active critical stockout warnings (<10 units) and low stock advisories |
| **`POST`** | `/api/inventory/replenish` | Restocks SKU inventory at a designated dark store from central FMCG depot |
| **`POST`** | `/api/inventory/transfer` | Rebalances stock between dark stores (surplus $\to$ deficit) to prevent localized stockouts |
| **`GET`** | `/api/orders` | Retrieves recent order history from Supabase (or local cache) |
| **`GET`** | `/api/stores` | Returns the list of all 12 dark store hubs with coordinates, radii, and operational status |
| **`GET`** | `/api/riders` | Returns delivery couriers, vehicle types, speed, ratings, and live availability |
| **`GET`** | `/api/users` | Returns registered consumers, addresses, and quick-commerce loyalty tiers |
| **`GET`** | `/api/serviceability/check` | Evaluates if GPS coordinates are inside GeoJSON catchment zones or dark store radii |
| **`POST`** | `/api/warehouse/optimize-pick-path` | Calculates optimal serpentine (S-shape) picking sequences for warehouse workers |
| **`GET`** | `/api/dispatch/batched-routes` | Calculates multi-order spatial route batching to reduce courier transit distance |
| **`WS`** | `/ws/tracking/{order_id}` | Live WebSocket streaming rider GPS coordinates and 4 fulfillment milestones |
| **`GET`** | `/api/health` | System health check and catchment summary |

---

### 4. Supabase Cloud Database & Realtime Setup

The project uses **Supabase (PostgreSQL + Realtime)** as the unified persistence and synchronization tier.

#### Database Tables & Schemas:
- **`public.stores`**: All 12 Aurangabad dark store fulfillment hubs (CIDCO, Garkheda, Nirala Bazar, Waluj, Chikalthana, Beed Bypass, Osmanpura, Seven Hills, HUDCO, Railway Station, Shahgunj, Shendra AURIC).
- **`public.riders`**: Delivery couriers with live GPS coordinates, vehicle types (EV Scooter, ICE Motorcycle, E-Bike), ratings, speeds, and status (`available`, `delivering`, `idle`).
- **`public.users`**: Registered consumers with delivery addresses, phone numbers, and loyalty tiers (`Gold`, `Silver`, `Bronze`).
- **`public.orders`**: Single-active order pipeline with customer coordinates, assigned store, routing distances, predictive buffered ETAs, weather/traffic conditions, and courier telemetry.
- **`public.order_items`**: Line items linked via foreign keys to parent orders.

#### Activating Your Database Tables:
1. Open the [**Supabase SQL Editor**](https://supabase.com/dashboard/project/wovfqutzuppauwretoiw/sql/new).
2. Copy and paste the contents of [`supabase_schema.sql`](supabase_schema.sql).
3. Click **"Run"** — this creates the tables, pre-seeds the dark stores and sample data, enables Realtime publications, and configures Row Level Security (RLS).

#### Environment Variables Configuration:
Copy `.env.example` to `.env` in the project root:
```env
SUPABASE_URL="https://wovfqutzuppauwretoiw.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

In `mobile-app/`, copy `.env.example` to `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL="https://wovfqutzuppauwretoiw.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

> 🛡️ **Zero-Downtime Fallback**: If Supabase credentials are not provided or if the database is offline, both the Python backend and React Native client automatically fall back to local JSON and CSV datasets without errors.

### 5. Running the Consumer Client Locally (`mobile-app/` ➔ [blinkit-aurangabad.netlify.app](https://blinkit-aurangabad.netlify.app))

The customer client is built with React Native and Expo, and is deployed live on Netlify at [**https://blinkit-aurangabad.netlify.app**](https://blinkit-aurangabad.netlify.app).

To run and test this application locally:

#### A. Run the Local Web Client (Exact App Hosted on Netlify)
In a new terminal:
```bash
# 1. Navigate to the mobile app directory
cd mobile-app

# 2. Install dependencies
npm install

# 3. Start local development web server
npm run web
# (Alternatively: npx expo start --web)
```
*Your browser will automatically open [**http://localhost:8081**](http://localhost:8081) with the full interactive Blinkit ordering interface.*

---

#### B. Build & Preview the Production Netlify Bundle Locally
To verify the exact static build before deploying to Netlify:
```bash
# 1. Export the production static web bundle (outputs to mobile-app/dist/)
npm run build

# 2. Serve and preview the production dist folder locally
npm serve dist
```

---

#### C. Run on Physical Phone (Expo Go) or Emulators
To test on a physical smartphone or simulator:
```bash
cd mobile-app
npm expo start
```
- **Physical Phone**: Open the free **Expo Go** app (iOS/Android) and scan the terminal QR code.
- **iOS Simulator**: Press **`i`** (macOS with Xcode).
- **Android Emulator**: Press **`a`** (requires Android Studio).

> 💡 **Connecting Physical Device to Local Backend**: Ensure your phone is connected to the same Wi-Fi network as your computer. In `mobile-app/src/services/api.ts`, update `DEV_API_HOST` with your machine's LAN IP (e.g., `http://192.168.1.15:8000`).

---

### 6. Experiencing the End-to-End Live Workflow

1. Keep **FastAPI** (`python3 api.py`) and **Streamlit** (`streamlit run app.py`) running.
2. Open the **Mobile App** (Web or Phone).
3. The app automatically locks your device GPS (or allows switching between Aurangabad neighborhoods like *CIDCO N-4*, *Osmanpura*, or *Nirala Bazar*).
4. Tap **"Place Order"**.
5. An explosive **confetti celebration** triggers on the phone with order details and assigned hub info.
6. Look at your **Streamlit Command Center** under the **⚡ Live Order Simulation** tab:
   - The dashboard instantly reflects the mobile order!
   - The 3D PyDeck map animates a delivery flight vector from the nearest hub to the customer GPS.
   - The sidebar displays live dispatch status milestones: *Order Placed $\rightarrow$ GPS Locked $\rightarrow$ Assigned to Hub $\rightarrow$ Picked & Packed $\rightarrow$ Out for Delivery*.

---

## 🧮 Geospatial Routing & Haversine Distance Formula

The routing engine matches customer coordinates $(lat_1, lon_1)$ to the strictly nearest active dark store $(lat_2, lon_2)$ using the **Haversine formula**:

$$\Delta lat = lat_2 - lat_1, \quad \Delta lon = lon_2 - lon_1$$

$$a = \sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1) \cdot \cos(lat_2) \cdot \sin^2\left(\frac{\Delta lon}{2}\right)$$

$$d = 2 \cdot R \cdot \arcsin(\sqrt{a})$$

Where $R = 6371\text{ km}$ (Earth radius).

The estimated sub-15 minute delivery SLA is then calculated via:
$$\text{ETA (mins)} = \mathrm{round}\left(3.5 + d \times 2.8\right)$$

---

## 👨‍💻 Authors & Contributors

| Contributor | LinkedIn | GitHub |
|---|---|---|
| **Neel Belsare** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/neel-belsare-719b9a314/) | [![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/NeelBelsare) |
| **Mansi Gaike** | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mansi-gaike-821260316) | [![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/gaikemansi03-sketch) |

- 🌐 **Live Application**: [**my-dark-store-app.streamlit.app**](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)
- 📱 **Consumer Web App**: [**blinkit-aurangabad.netlify.app**](https://blinkit-aurangabad.netlify.app)

---

## 📜 License
This project is open-source and licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
