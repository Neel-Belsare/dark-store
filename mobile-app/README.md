# 📱 Blinkit Quick-Commerce Client (React Native Expo)

[![Deployed on Netlify](https://img.shields.io/badge/Live%20Web%20App-Netlify-00C7B7?logo=netlify)](https://blinkit-aurangabad.netlify.app)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2051-61DAFB?logo=react)](https://reactnative.dev/)

A high-performance, modern React Native (Expo) web and mobile application replicating the **Blinkit** quick-commerce customer experience for **Chhatrapati Sambhajinagar (Aurangabad)**.

- 🌐 **Live Web Application (Netlify)**: [**https://blinkit-aurangabad.netlify.app**](https://blinkit-aurangabad.netlify.app)
- 🚀 **Streamlit Command Center**: [**https://my-dark-store-app.streamlit.app**](https://my-dark-store-app-nahqcxrxdlguw9uczkkpj3.streamlit.app)

---

## 💻 Local Run Commands (Web & Mobile)

### 1. Run the Local Web Client (Exact App Deployed on Netlify)
To run the web application on your local machine:
```bash
# Navigate to the mobile app folder
cd mobile-app

# Install dependencies
npm install

# Start local web development server
npm run web
# (or: npx expo start --web)
```
*Your browser will open automatically at [**http://localhost:8081**](http://localhost:8081).*

---

### 2. Build & Preview the Production Netlify Bundle Locally
To export and test the production web build:
```bash
# Export the production static bundle to dist/
npm run build

# Preview the static build locally using any web server
npx serve dist
```

---

### 3. Run on Physical Smartphone (Expo Go) / Emulators
```bash
cd mobile-app
npx expo start
```
- **Physical Phone**: Open the free **Expo Go** app (iOS/Android) and scan the QR code in your terminal.
- **iOS Simulator**: Press **`i`** (requires macOS with Xcode).
- **Android Emulator**: Press **`a`** (requires Android Studio).

> 💡 **Testing with Local Backend**: To connect your physical phone to your local FastAPI backend, update `DEV_API_HOST` in `src/services/api.ts` with your computer's local Wi-Fi IP (e.g. `http://192.168.1.15:8000`).

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
