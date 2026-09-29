import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { TabNavigator } from './src/navigation/TabNavigator';

// @ts-ignore
import Login from './login';
import { supabase } from './src/supabaseClient';


export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then((res: { data: { session: any } }) => {
      setSession(res.data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, currentSession: any) => {
        setSession(currentSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7D435' }}>
        <ActivityIndicator size="large" color="#4E2298" />
      </View>
    );
  }

  if (!session) {
    return <Login onLogin={(user: any) => setSession({ user })} />;
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" backgroundColor="#F7D435" />
        <TabNavigator />
      </CartProvider>
    </SafeAreaProvider>
  );
}