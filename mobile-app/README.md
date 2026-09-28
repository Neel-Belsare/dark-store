# 📱 Blinkit Quick-Commerce Mobile App (React Native Expo)

A high-performance, modern React Native (Expo) mobile frontend replicating the **Blinkit** quick-commerce checkout experience for **Chhatrapati Sambhajinagar (Aurangabad)**. 

Directly integrated with the **Aurangabad Dark Store Command Center** (`app.py`) via a real-time **FastAPI Bridge** (`api.py`).

---

## 🌟 Key Features

1. **⚡ Instant GPS Catchment Matching (`useCurrentLocation.ts`)**:
   - Uses `expo-location` with high-accuracy GPS lock (`Accuracy.Balanced`).
   - Reverse geocoding to resolve street & micro-market addresses.
   - Built-in one-tap selector for Chhatrapati Sambhajinagar hubs (CIDCO N-4, Osmanpura, Nirala Bazar, Seven Hills, Garkheda, Chikalthana MIDC).

2. **🛍️ Blinkit Checkout Experience (`CheckoutScreen.tsx`)**:
   - Signature Blinkit yellow (`#F7D435`) and quick-commerce green (`#0C831F`) design tokens.
   - Dynamic grocery basket with quantity steppers (`Amul Taaza Milk`, `Whole Wheat Bread`, `Lay's Chips`, `Sunflower Oil`, `Tata Salt`).
   - Delivery instructions selector (Leave at door, Don't ring bell).
   - Itemized bill breakdown with Free Delivery tier and savings banner.

3. **🎉 Celebratory Micro-Animations (`CelebrationModal.tsx`)**:
   - Dynamic multi-particle confetti explosion built with React Native's `Animated` engine.
   - Spring-bouncing checkmark badge.
   - Order telemetry summary: **Assigned Hub**, **Road Distance**, **Estimated SLA**, and **Assigned Fleet Rider**.

4. **📡 Real-Time Bridge to Streamlit (`api.py`)**:
   - When "Place Order" is tapped, payload is dispatched to `POST /api/order`.
   - The FastAPI backend calculates Haversine nearest-store dispatch.
   - Updates `latest_order.json`, instantly triggering 3D Arc & telemetry animation inside the Streamlit Command Center dashboard!

---

## 🚀 Quick Start Guide

### 1. Launch the FastAPI Bridge
In the root directory of the project:
```bash
python3 api.py
```
*API will start listening at `http://0.0.0.0:8000` (Docs at `http://localhost:8000/docs`).*

### 2. Launch the Streamlit Command Center
In a separate terminal:
```bash
streamlit run app.py
```
*Open `http://localhost:8501` and navigate to the **⚡ Live Order Simulation** tab.*

### 3. Launch the Mobile App
In another terminal, navigate to `mobile-app`:
```bash
cd mobile-app
npm install
npx expo start
```

Press:
- **`w`** to open in Web browser (instant testing without phone/emulator).
- **`i`** to open in iOS Simulator (macOS with Xcode).
- **`a`** to open in Android Emulator.
- **Scan QR Code** with the **Expo Go** app on your physical iPhone or Android device!

> 💡 **Testing on a Physical Device**: Ensure your phone is connected to the same Wi-Fi network as your computer. In `mobile-app/src/services/api.ts`, update `DEV_API_HOST` to your computer's local IP (e.g. `http://192.168.1.15:8000`).

---

## 📁 Directory Structure

```
mobile-app/
├── App.tsx                      # Root entry point & SafeAreaProvider
├── app.json                     # Expo manifest & GPS permission configs
├── package.json                 # Dependencies (expo, expo-location, etc.)
├── tsconfig.json                # TypeScript settings
└── src/
    ├── types.ts                 # TypeScript schemas for orders & GPS
    ├── constants/
    │   └── theme.ts             # Blinkit color tokens & shadows
    ├── hooks/
    │   └── useCurrentLocation.ts# GPS location & reverse geocoding
    ├── services/
    │   └── api.ts               # FastAPI bridge client with offline fallback
    ├── components/
    │   ├── LocationBar.tsx      # GPS status & micro-market switcher modal
    │   ├── CartItemRow.tsx      # Basket item with +/- steppers
    │   ├── BillSummary.tsx      # Pricing, free delivery, & savings breakdown
    │   └── CelebrationModal.tsx # Confetti micro-animations & dispatch badge
    └── screens/
        └── CheckoutScreen.tsx   # Complete Blinkit checkout flow
```
