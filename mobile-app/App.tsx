import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CheckoutScreen } from './src/screens/CheckoutScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F7D435" />
      <CheckoutScreen />
    </SafeAreaProvider>
  );
}
