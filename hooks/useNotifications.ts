import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '@/utils/notifications';

export interface UseNotificationsResult {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  notificationResponse: Notifications.NotificationResponse | null;
}

export function useNotifications(): UseNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationResponse, setNotificationResponse] = useState<Notifications.NotificationResponse | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    notificationListener.current = addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = addNotificationResponseReceivedListener(response => {
      setNotificationResponse(response);
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

  return {
    expoPushToken,
    notification,
    notificationResponse,
  };
}
