# 🛒 Aurangabad (Chhatrapati Sambhajinagar) Quick-Commerce Ecosystem 📊
**An AI-Powered Dark Store Command Center & Real-Time Blinkit Clone Mobile App**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.32%2B-ff4b4b?logo=streamlit)](https://streamlit.io/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2051-61DAFB?logo=react)](https://reactnative.dev/)
[![PyDeck](https://img.shields.io/badge/PyDeck-Deck.gl%203D-blueviolet)](https://deckgl.readthedocs.io/)
[![Deployed on Streamlit](https://img.shields.io/badge/Live%20App-Streamlit%20Cloud-00c853?logo=streamlit)](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Neel%20Belsare-0A66C2?logo=linkedin)](https://www.linkedin.com/in/neel-belsare-719b9a314/)
[![GitHub](https://img.shields.io/badge/GitHub-NeelBelsare-181717?logo=github)](https://github.com/NeelBelsare/my-dark-store-app)

---

## 🌐 Live Deployments & Links
- 🚀 **Streamlit Command Center (Live Web App)**: [**my-dark-store-app.streamlit.app**](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)
- 🔗 **GitHub Repository**: [**NeelBelsare/my-dark-store-app**](https://github.com/NeelBelsare/my-dark-store-app)
- 👨‍💻 **Developer**: [**Neel Belsare**](https://www.linkedin.com/in/neel-belsare-719b9a314/)

---

## 💡 Project Architecture & Overview

This project provides an end-to-end **Quick-Commerce Dark Store Management & Consumer Ecosystem** designed for **Chhatrapati Sambhajinagar (Aurangabad)**. 

It connects three core tiers:
1. **Frontend Mobile App (`mobile-app/`)**: A high-performance **React Native (Expo)** mobile application (Blinkit clone) featuring device GPS location locking, cart management, free delivery tier, celebratory micro-animations, and instant checkout.
2. **Real-Time Dispatch Bridge (`api.py`)**: A **FastAPI** backend that receives live GPS coordinates from the mobile app, runs Haversine nearest-hub routing against 12 Aurangabad dark stores, assigns delivery riders, computes SLAs, and syncs order payloads.
3. **Analytics & Command Center (`app.py`)**: A modern **Streamlit** dashboard featuring 3D PyDeck telemetry (flight arcs, concentric pulse rings, moving riders), Leaflet vector GeoJSON delivery zones, ML demand forecasting, climate friction simulations, and unit economics.

```
                                      ┌──────────────────────────────────────────────┐
                                      │   📱 Mobile App (React Native Expo)          │
                                      │   - useCurrentLocation (GPS Lock via expo)   │
                                      │   - CheckoutScreen (Blinkit UI, Cart, Bill)  │
                                      │   - CelebrationModal (Confetti & Animation)  │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                                  POST /api/order (GPS Coords)
                                                             │
                                                             ▼
                                      ┌──────────────────────────────────────────────┐
                                      │   ⚡ FastAPI Dispatch Bridge (api.py)        │
                                      │   - Haversine Nearest Dark Store Routing     │
                                      │   - ETA, SLA & Rider Assignment Engine       │
                                      │   - Atomic State Sync (latest_order.json)    │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                                   Live Telemetry Sync
                                                             │
                                                             ▼
                                      ┌──────────────────────────────────────────────┐
                                      │   🖥️ Streamlit Command Center (app.py)       │
                                      │   - 3D PyDeck ArcLayer Vector Flight Path    │
                                      │   - Real-World GeoJSON Service Polygons      │
                                      │   - In-Transit Rider Marker & Telemetry      │
                                      │   - Sidebar Real-Time st.status Pipeline     │
                                      └──────────────────────────────────────────────┘
```

---

## 📂 Detailed Folder Structure

Below is the complete file and folder breakdown of the repository:

```
📦 Dark-Store-Feasibility-Analysis
├── 📄 app.py                             # Main Streamlit Command Center web application (UI, 3D maps, ML, KPIs)
├── 📄 api.py                             # FastAPI REST bridge connecting mobile orders to the Streamlit visualizer
├── 📄 MainScript.py                      # Core Python data modeling and analytics pipeline
├── 📄 requirements.txt                   # Python dependencies (Streamlit, FastAPI, PyDeck, Folium, Plotly, etc.)
├── 📄 index.html                         # GitHub Pages static redirect
├── 📄 LICENSE                            # MIT License
├── 📄 README.md                          # Full system documentation, folder structure, and usage guide
│
├── 📂 mobile-app/                        # React Native (Expo) Blinkit Clone Mobile Application
│   ├── 📄 App.tsx                        # App entry point with SafeAreaProvider & Status Bar configuration
│   ├── 📄 app.json                       # Expo configuration (app metadata, GPS permissions for iOS/Android)
│   ├── 📄 package.json                   # React Native & Expo dependencies (expo-location, etc.)
│   ├── 📄 tsconfig.json                  # TypeScript compiler settings
│   ├── 📄 README.md                      # Dedicated mobile app setup and run guide
│   └── 📂 src/
│       ├── 📄 types.ts                   # TypeScript interfaces (GPSLocation, CartItem, OrderPayload, etc.)
│       ├── 📂 constants/
│       │   └── 📄 theme.ts               # Blinkit brand tokens (Signature Yellow, Quick-Commerce Green)
│       ├── 📂 hooks/
│       │   └── 📄 useCurrentLocation.ts  # Expo GPS location hook, reverse geocoding, and micro-market switcher
│       ├── 📂 services/
│       │   └── 📄 api.ts                 # HTTP client calling FastAPI bridge with offline fallback simulation
│       ├── 📂 components/
│       │   ├── 📄 LocationBar.tsx        # Top GPS delivery bar with live indicator & Aurangabad hub switcher
│       │   ├── 📄 CartItemRow.tsx        # Grocery items with dynamic +/- quantity steppers
│       │   ├── 📄 BillSummary.tsx        # Item total, free delivery waiver, and grand total calculations
│       │   └── 📄 CelebrationModal.tsx   # Confetti explosion micro-animations & live order dispatch summary
│       └── 📂 screens/
│           └── 📄 CheckoutScreen.tsx     # Full checkout screen with delivery notes and instant order CTA
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
- **🗺️ Geospatial Coverage View**: Interactive Leaflet & 3D PyDeck maps showing:
  - Real-world GeoJSON delivery boundary polygons for **Blinkit** (Yellow) and **Zepto** (Purple).
  - Dark store center pins and adjustable catchment delivery buffers (radii).
- **⚡ Live Order Simulation**:
  - `🚀 Simulate New Customer Order`: Generates realistic customer GPS coordinates within Aurangabad.
  - `📱 Sync Live Mobile Order`: Seamlessly loads real-time orders triggered from the React Native mobile app.
  - **3D Animated Telemetry**: Displays curved 3D `ArcLayer` vectors, customer pulsing rings, store glow highlights, and moving in-transit courier markers.
  - **Sidebar Dispatch Pipeline**: Real-time `st.status` widget updating step-by-step from order placement to courier dispatch.
- **👥 Demographic Heatmaps**: Scatter plots, population density correlations, and predictive demand distributions.
- **🌦️ Weather & Monsoon Impact**: Monsoon delivery friction scales, heatwave impacts, and rider safety adjustments.
- **💰 Financials & Unit Economics**: ROI, capital expenditure, rider payouts, and profit margins.
- **📋 Dark Store Directory**: Searchable, filterable directory of all 12 operational and proposed dark stores.

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
| **`POST`** | `/api/order` | Receives GPS coordinates, routes to nearest dark store via Haversine geometry, and notifies Streamlit |
| **`GET`** | `/api/latest-order` | Returns the most recently dispatched order payload |
| **`GET`** | `/api/orders` | Retrieves recent order history |
| **`GET`** | `/api/stores` | Returns the list of all 12 dark store hubs with coordinates and coverage details |
| **`GET`** | `/api/health` | Health check endpoint |

---

### 4. Running the React Native Mobile App (`mobile-app/`)

The mobile app provides a Blinkit clone consumer checkout experience.

In another terminal:
```bash
cd mobile-app
npm install
npx expo start
```

#### Choose Your Testing Environment:
- **Web Browser (Fastest)**: Press **`w`** in the terminal to open the mobile view right in Google Chrome / Safari.
- **iOS Simulator**: Press **`i`** (requires macOS with Xcode).
- **Android Emulator**: Press **`a`** (requires Android Studio).
- **Physical Phone**: Install the free **Expo Go** app from the App Store or Google Play, and scan the QR code displayed in your terminal.

> 💡 **Tip for Physical Devices**: Ensure your phone is connected to the same local Wi-Fi as your computer. In `mobile-app/src/services/api.ts`, update `DEV_API_HOST` with your machine's local IP (e.g. `http://192.168.1.15:8000`).

---

### 5. Experiencing the End-to-End Live Workflow

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

## 👨‍💻 Author & Maintainer

**Neel Belsare**  
- **LinkedIn**: [linkedin.com/in/neel-belsare-719b9a314](https://www.linkedin.com/in/neel-belsare-719b9a314/)  
- **GitHub**: [github.com/NeelBelsare](https://github.com/NeelBelsare)
**Mansi gaike**  
- **LinkedIn**: [linkedin.com/in/mansi-gaike-821260316](https://www.linkedin.com/in/mansi-gaike-821260316)  
- **GitHub**: [github.com/gaikemansi03-sketch](https://github.com/gaikemansi03-sketch)
- 
- **Live Application**: [my-dark-store-app.streamlit.app](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)

---

## 📜 License
This project is open-source and licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
