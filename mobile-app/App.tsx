import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { TabNavigator } from './src/navigation/TabNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { supabase } from './src/supabaseClient';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (supabase && typeof supabase.auth?.getSession === 'function') {
      supabase.auth
        .getSession()
        .then((res: { data: { session: any } }) => {
          if (isMounted) {
            setSession(res.data?.session || null);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });

      const { data } = supabase.auth.onAuthStateChange(
        (_event: any, currentSession: any) => {
          if (isMounted) {
            setSession(currentSession);
          }
        }
      );

      return () => {
        isMounted = false;
        data?.subscription?.unsubscribe?.();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    if (supabase && typeof supabase.auth?.signOut === 'function') {
      supabase.auth.signOut().catch(() => {});
    }
    setSession(null);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f7ce00',
        }}
      >
        <ActivityIndicator size="large" color="#6549be" />
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#f7ce00" />
        <LoginScreen onLogin={(user: any) => setSession({ user })} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" backgroundColor="#f7ce00" />
        <TabNavigator
          userSession={session?.user || session}
          onLogout={handleLogout}
        />
      </CartProvider>
    </SafeAreaProvider>
  );
}