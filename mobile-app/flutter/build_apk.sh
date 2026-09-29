#!/usr/bin/env bash
# ==============================================================================
# One-Click Flutter Release APK Build Script for Blinkit Clone
# ==============================================================================
set -e

echo "📦 [1/4] Checking Flutter Environment..."
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter SDK was not found in your PATH."
    echo ""
    echo "💡 To install Flutter on macOS:"
    echo "   brew install --cask flutter"
    echo "   or download from https://docs.flutter.dev/get-started/install/macos"
    echo ""
    exit 1
fi

echo "🚀 [2/4] Fetching Flutter Dependencies (pub get)..."
flutter pub get

echo "🔨 [3/4] Building Release Android APK (arm64 + armv7)..."
flutter build apk --release --no-tree-shake-icons

APK_PATH="build/app/outputs/flutter-apk/app-release.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "=============================================================================="
    echo "✅ APK BUILT SUCCESSFULLY!"
    echo "📍 APK Location: $(pwd)/$APK_PATH"
    echo "📏 File Size: $(du -h "$APK_PATH" | cut -f1)"
    echo "=============================================================================="
    echo ""
    echo "📲 HOW TO INSTALL ON YOUR ANDROID PHONE:"
    echo "   1. USB Cable: Run 'adb install -r $APK_PATH'"
    echo "   2. WhatsApp / Drive: Share '$APK_PATH' to your phone and tap Install"
    echo "   3. Enjoy your 10-minute Blinkit Quick-Commerce App!"
    echo ""
else
    echo "⚠️ Build finished. Check output above for any compilation logs."
fi
