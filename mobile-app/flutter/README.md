# 📱 Blinkit Quick-Commerce Flutter Mobile App (v3.0.0 APK Ready)
> **Android & iOS Download-Ready Quick-Commerce Application**  
> Built with **Flutter (Dart)**, **Provider State Management**, **Flutter Map (OSRM)**, and **Supabase PostgreSQL Realtime Sync**.

---

## 🌟 Overview & Key Features

This mobile application is the production Flutter implementation of our Blinkit Clone client:

1. **⚡ Fast-Delivery Blinkit UI**:
   - Signature header with `⚡ 10 MINS` badge and live location pill (`CIDCO, Chhatrapati Sambhajinagar`).
   - Instant search bar and horizontal category filters (*Dairy & Breakfast, Snacks, Cold Drinks, Instant Food, Bakery, Fresh Fruits*).
   - Product cards with real-world grocery images, discount badges, and dynamic `ADD` / `+ -` counter controls.
   - Sticky bottom floating cart bar showing item count, total price, and one-tap checkout.

2. **🛵 Dedicated Rider Partner Mode**:
   - Integrated rider toggle button right in the top header.
   - 4-Stage delivery lifecycle stepper:  
     `Order Accepted` ➔ `Pick & Pack at Hub` ➔ `Out for Delivery` ➔ `Delivered`.
   - **Real-world OSRM Road Navigation Map HUD** following actual streets (Jalna Road, Kranti Chowk, CIDCO) with animated courier bike icon and live compass bearing rotation!
   - Customer phone button, delivery address, and delivery instructions.

3. **☁️ Zero-Downtime Cloud Synchronization**:
   - Direct connection to **Supabase PostgreSQL** (`https://wovfqutzuppauwretoiw.supabase.co`).
   - Every order placed is instantly broadcasted to the **Streamlit Command Center** (`app.py`), deducting stock from the nearest dark store hub automatically.

---

## 🔨 How to Build the Android APK

### Step 1: Ensure Flutter is Installed
If you do not have Flutter installed on your Mac:
```bash
brew install --cask flutter
```
Verify the installation:
```bash
flutter doctor
```

### Step 2: One-Click Build Command
Inside this `mobile-app/flutter/` directory, simply run:
```bash
./build_apk.sh
```
*Or manually run:*
```bash
flutter pub get
flutter build apk --release --no-tree-shake-icons
```

The compiled release APK will be generated at:
```
build/app/outputs/flutter-apk/app-release.apk
```

---

## 📲 How to Install & Run the APK on Your Android Phone

Choose the method most convenient for you:

### Method 1: USB Cable (Fastest via ADB)
1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Connect your phone to your Mac via USB cable.
3. Run the installation command:
   ```bash
   adb install -r build/app/outputs/flutter-apk/app-release.apk
   ```
4. The app icon **"Blinkit Quick-Com"** will appear on your phone screen!

### Method 2: Share via WhatsApp or Google Drive
1. Locate the generated file `app-release.apk`.
2. Upload it to your **Google Drive** or send it to yourself via **WhatsApp / Telegram / Email**.
3. On your phone, tap the APK file and select **"Install"** *(Allow "Install from Unknown Sources" if prompted)*.

### Method 3: Local Wi-Fi Download Server
Run a temporary Python web server from your laptop:
```bash
cd build/app/outputs/flutter-apk/
python3 -m http.server 8080
```
On your phone (connected to the same Wi-Fi), open Chrome and visit:
```
http://<your-laptop-ip>:8080/app-release.apk
```
Your phone will instantly download and install the APK!

---

## 💻 How to Test Locally on Your Laptop (Web or Simulator)

To test the Flutter app without building an APK:

```bash
# Run on Google Chrome
flutter run -d chrome

# Run on macOS desktop
flutter run -d macos

# Run on connected Android Simulator
flutter run
```

---

## 📂 Project Architecture

```
mobile-app/flutter/
├── pubspec.yaml               # Dependencies (provider, supabase_flutter, flutter_map)
├── build_apk.sh               # 1-Click APK generation script
├── README.md                  # Comprehensive setup & APK download guide
├── android/                   # Full Android wrapper configured for release builds
│   ├── app/build.gradle       # Configured: compileSdk 34, minSdkVersion 21
│   └── src/main/
│       └── AndroidManifest.xml # Internet & GPS permissions configured
└── lib/
    ├── main.dart              # MultiProvider setup & light theme entry
    ├── config/
    │   ├── theme.dart         # Signature Lavender & Dark Slate theme
    │   └── supabase_config.dart # Supabase REST URL & Anon Key
    ├── models/
    │   ├── product.dart       # Catalog models & pre-seeded grocery items
    │   └── order_model.dart   # Order & Line items payload for cloud sync
    ├── providers/
    │   ├── cart_provider.dart # Cart state, bill totals, Supabase sync
    │   ├── location_provider.dart # GPS lock & CIDCO coordinates
    │   └── rider_provider.dart    # Stepper state & OSRM road coordinates
    ├── screens/
    │   ├── home_catalog_screen.dart # Categories & product grid
    │   ├── cart_checkout_screen.dart # Bill summary & instant checkout
    │   └── rider_mode_screen.dart    # Stepper & live road map HUD
    └── widgets/
        ├── blinkit_header.dart      # 10 MINS badge & rider toggle
        ├── product_card.dart        # Image, price & + - counter
        └── road_navigation_map.dart # OpenStreetMap road route with bearing
```

---

## 👥 Authors
* **Neel Belsare** — Full-Stack & Systems Lead  
* **Mansi Gaike** — Data Science & Analytics Lead  
* **GitHub Repository**: [https://github.com/NeelBelsare/my-dark-store-app](https://github.com/NeelBelsare/my-dark-store-app)
