import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { getDeferredDeepLink } from './useAppsflyerDeepLinking';

export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    const handleInitialURL = async () => {
      if (__DEV__) {
        console.log('[Deep Link] Starting initial URL check on app launch');
      }

      const deferredLink = await getDeferredDeepLink();

      if (deferredLink.deepLinkValue) {
        if (__DEV__) {
          console.log('[Deep Link] Found stored deferred deep link:', deferredLink.deepLinkValue);
        }
        router.replace(`/?url=${encodeURIComponent(deferredLink.deepLinkValue)}`);
        return;
      }

      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        if (__DEV__) {
          console.log('[Deep Link] Got initial URL from OS:', initialUrl);
        }

        const parsedUrl = Linking.parse(initialUrl);
        const isHandledDomain = ['loveappneo.vibz.world', 'lovenote.vibz.world', 'openinapp.vibz.world'].some(
          domain => parsedUrl.hostname === domain
        );

        if (isHandledDomain) {
          if (__DEV__) {
            console.log('[Deep Link] Initial URL is from handled domain, navigating:', initialUrl);
          }
          router.replace(`/?url=${encodeURIComponent(initialUrl)}`);
        } else if (__DEV__) {
          console.log('[Deep Link] Initial URL is not from handled domain, ignoring');
        }
      } else if (__DEV__) {
        console.log('[Deep Link] No initial URL on app launch');
      }
    };

    handleInitialURL();
  }, [router]);
}