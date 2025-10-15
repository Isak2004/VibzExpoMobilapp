import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import { registerForPushNotificationsAsync, configureForegroundNotifications } from '@/utils/notificationService';

export default function RootLayout() {
  useFrameworkReady();
  useDeepLinking();

  const [pushToken, setPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }

    configureForegroundNotifications();

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setPushToken(token);
        global.pushToken = token;
        console.log('Push token registered:', token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const notificationData = response.notification.request.content.data;

      global.lastNotificationData = {
        type: 'notificationTapped',
        data: notificationData
      };
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
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

declare global {
  var lastNotificationData: any;
  var pushToken: string | null;
}

if (typeof global !== 'undefined') {
  global.pushToken = null;
}