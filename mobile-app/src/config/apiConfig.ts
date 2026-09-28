import { Platform } from 'react-native';

/**
 * FASTAPI BACKEND CONFIGURATION
 * -----------------------------
 * When testing on a physical iPhone or Android device via Expo Go:
 * Replace 'YOUR_LOCAL_IP' with your Mac's Wi-Fi IP address (e.g. '192.168.1.15').
 *
 * For Emulators:
 * - Android Emulator uses '10.0.2.2' to access your host Mac.
 * - iOS Simulator / Web uses 'localhost'.
 */
export const LOCAL_IP_ADDRESS = 'YOUR_LOCAL_IP'; // <-- Put your Mac's LAN IP here, e.g., '192.168.1.5'
export const BACKEND_PORT = 8000;

export const getApiBaseUrl = (): string => {
  if (LOCAL_IP_ADDRESS !== 'YOUR_LOCAL_IP') {
    return `http://${LOCAL_IP_ADDRESS}:${BACKEND_PORT}`;
  }

  return Platform.select({
    android: `http://10.0.2.2:${BACKEND_PORT}`,
    ios: `http://localhost:${BACKEND_PORT}`,
    default: `http://localhost:${BACKEND_PORT}`,
  });
};

export const API_ENDPOINTS = {
  PLACE_ORDER: '/place_order',
  API_ORDER: '/api/order',
  LATEST_ORDER: '/api/latest-order',
  STORES: '/api/stores',
  HEALTH: '/api/health',
};
