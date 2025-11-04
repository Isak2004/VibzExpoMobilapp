import { useEffect, useState, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationProvider } from '@/contexts/NotificationContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  useDeepLinking();
  const [appReady, setAppReady] = useState(false);

  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [lastNotificationResponse, setLastNotificationResponse] = useState<Notifications.NotificationResponse | null>(null);

  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    console.log('[RootLayout] 🔔 Notification received:', notification);
    setLastNotification(notification);
  }, []);

  const handleNotificationTapped = useCallback((response: Notifications.NotificationResponse) => {
    console.log('[RootLayout] 👆 Notification tapped:', response);
    setLastNotificationResponse(response);
  }, []);

  const { pushToken, permissionStatus } = useNotifications({
    onNotificationReceived: handleNotificationReceived,
    onNotificationTapped: handleNotificationTapped,
  });

  useEffect(() => {
    console.log('[RootLayout] 🔄 Context state updated:', {
      pushToken,
      permissionStatus,
    });
  }, [pushToken, permissionStatus]);

  useEffect(() => {
    const hideSystemUI = () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
        NavigationBar.setBehaviorAsync('overlay-swipe');
      }
    };

    hideSystemUI();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        hideSystemUI();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAppReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <NotificationProvider
      value={{
        pushToken,
        permissionStatus,
        lastNotification,
        lastNotificationResponse,
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar hidden={true} />
    </NotificationProvider>
  );
}