import { useEffect, useRef, useState } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

interface NotificationData {
  pushToken: string | null;
  permissionStatus: string;
}

interface UseNotificationsProps {
  onTokenReceived?: (token: string) => void;
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
  }),
});

export function useNotifications({
  onTokenReceived,
  onNotificationReceived,
  onNotificationTapped,
}: UseNotificationsProps = {}): NotificationData {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const tokenListener = useRef<Notifications.Subscription>();
  const appStateListener = useRef<any>();

  useEffect(() => {
    // Initial token registration
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setPushToken(token);
        onTokenReceived?.(token);
      }
    });

    // Listen for token updates (when Expo/FCM refreshes the token)
    tokenListener.current = Notifications.addPushTokenListener((event) => {
      const newToken = event.data;
      setPushToken(newToken);
      onTokenReceived?.(newToken);
    });

    // Listen for notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        onNotificationReceived?.(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onNotificationTapped?.(response);
      });

    // Listen for app state changes to re-check permissions
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - check if permissions changed
        await recheckPermissions();
      }
    };

    appStateListener.current = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (tokenListener.current) {
        tokenListener.current.remove();
      }
      if (appStateListener.current) {
        appStateListener.current.remove();
      }
    };
  }, [onTokenReceived, onNotificationReceived, onNotificationTapped]);

  async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === 'web') {
      setPermissionStatus('unavailable');
      return null;
    }

    if (!Device.isDevice) {
      setPermissionStatus('unavailable');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setPermissionStatus('denied');
        return null;
      }

      setPermissionStatus('granted');

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('[Notifications] No EAS project ID found');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('[Notifications] Error registering for push notifications:', error);
      setPermissionStatus('error');
      return null;
    }
  }

  async function recheckPermissions() {
    if (Platform.OS === 'web' || !Device.isDevice) {
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      const previousStatus = permissionStatus;

      if (status !== previousStatus) {
        setPermissionStatus(status);

        // If permissions were granted, get a new token
        if (status === 'granted' && previousStatus !== 'granted') {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (projectId) {
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            const newToken = tokenData.data;
            setPushToken(newToken);
            onTokenReceived?.(newToken);
          }
        }

        // If permissions were revoked, clear the token
        if (status === 'denied' && previousStatus === 'granted') {
          setPushToken(null);
          onTokenReceived?.(null as any);
        }
      }
    } catch (error) {
      console.error('[Notifications] Error rechecking permissions:', error);
    }
  }

  return { pushToken, permissionStatus };
}
