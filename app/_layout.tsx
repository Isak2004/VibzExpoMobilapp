import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useDeepLinking } from '@/hooks/useDeepLinking';

export default function RootLayout() {
  useFrameworkReady();

  // Temporarily disabled to debug
  // useDeepLinking();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').catch(err => {
        console.log('Failed to hide navigation bar:', err);
      });
      NavigationBar.setBehaviorAsync('inset-swipe').catch(err => {
        console.log('Failed to set navigation bar behavior:', err);
      });
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar hidden={true} />
    </>
  );
}