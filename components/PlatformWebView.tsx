import React, { useRef, useEffect } from 'react';
import { Platform, View, StyleSheet, Text, Alert, Share } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { initiateGoogleLogin } from '../utils/googleAuth';

interface NotificationContextType {
  pushToken: string | null;
  permissionStatus: string;
  lastNotification: any;
  lastNotificationResponse: any;
}

interface PlatformWebViewProps {
  source: { uri: string };
  style?: any;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  onNavigationStateChange?: (navState: any) => void;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  startInLoadingState?: boolean;
  scalesPageToFit?: boolean;
  bounces?: boolean;
  allowsBackForwardNavigationGestures?: boolean;
  notificationContext?: NotificationContextType;
  ref?: React.RefObject<any>;
}

// Web-specific WebView component using iframe with complete fullscreen support
const WebWebView = React.forwardRef<any, PlatformWebViewProps>(
  ({ source, style, onLoadStart, onLoadEnd, onError, onNavigationStateChange, ...props }, ref) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = React.useState(source.uri);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => ({
      reload: () => {
        if (iframeRef.current) {
          setLoading(true);
          setError(null);
          iframeRef.current.src = currentUrl + (currentUrl.includes('?') ? '&' : '?') + '_reload=' + Date.now();
        }
      },
      goBack: () => {
        console.log('Go back functionality limited in web iframe');
      },
      goForward: () => {
        console.log('Go forward functionality limited in web iframe');
      },
    }));

    const enterFullscreen = async () => {
      try {
        if (containerRef.current && containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any)?.mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any)?.msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen request failed:', err);
      }
    };

    const handleLoad = () => {
      setLoading(false);
      setError(null);
      onLoadEnd?.();

      enterFullscreen();

      onNavigationStateChange?.({
        url: currentUrl,
        canGoBack: false,
        canGoForward: false,
        loading: false,
      });
    };

    const handleLoadStart = () => {
      setLoading(true);
      setError(null);
      onLoadStart?.();
    };

    const handleError = () => {
      setLoading(false);
      setError('This website cannot be displayed in the browser due to security restrictions. Try opening it in a new tab.');
      onError?.({ nativeEvent: { description: 'Failed to load page - X-Frame-Options restriction' } });
    };

    const openInNewTab = () => {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    };

    React.useEffect(() => {
      setCurrentUrl(source.uri);
      setLoading(true);
      setError(null);
    }, [source.uri]);

    if (error) {
      return (
        <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }, style]}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#dc3545', marginBottom: 12, textAlign: 'center' }}>
            Cannot Display Website
          </Text>
          <Text style={{ fontSize: 14, color: '#6c757d', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
            {error}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <button
              onClick={openInNewTab}
              style={{
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Open in New Tab
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </View>
        </View>
      );
    }

    return (
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#000',
          ...style 
        }}
      >
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
            color: '#fff',
            zIndex: 1,
          }}>
            <div style={{
              width: 50,
              height: 50,
              border: '4px solid #333',
              borderTop: '4px solid #007AFF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 20,
            }} />
            <div style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Loading website...</div>
            <div style={{ fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 300 }}>
              Will automatically enter fullscreen mode for immersive browsing
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={source.uri}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: loading ? 'none' : 'block',
          }}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation allow-top-navigation-by-user-activation"
          allow="accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; vr; xr-spatial-tracking; fullscreen"
          loading="lazy"
          title="Web Browser Content"
          allowFullScreen
        />
      </div>
    );
  }
);

// Main PlatformWebView component
const PlatformWebView = React.forwardRef<any, PlatformWebViewProps>((props, ref) => {
  const webViewRef = useRef<WebView>(null);
  const { notificationContext } = props;

  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(webViewRef.current);
      } else {
        (ref as React.MutableRefObject<any>).current = webViewRef.current;
      }
    }
  }, [ref]);

  const [webViewReady, setWebViewReady] = React.useState(false);

  useEffect(() => {
    if (webViewRef.current && webViewReady) {
      console.log('[PlatformWebView] 📤 Sending token update to web app:', {
        token: notificationContext?.pushToken || null,
        permissionStatus: notificationContext?.permissionStatus || 'unknown',
      });
      // Send token updates (including when token becomes null due to permission revocation)
      sendMessageToWebView({
        type: 'pushToken',
        token: notificationContext?.pushToken || null,
        permissionStatus: notificationContext?.permissionStatus || 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
  }, [notificationContext?.pushToken, notificationContext?.permissionStatus, webViewReady]);

  useEffect(() => {
    if (notificationContext?.lastNotificationResponse && webViewRef.current) {
      const notificationData = notificationContext.lastNotificationResponse.notification.request.content.data;
      sendMessageToWebView({
        type: 'notificationTapped',
        data: notificationData,
      });
    }
  }, [notificationContext?.lastNotificationResponse]);

  const sendMessageToWebView = (message: any) => {
    if (webViewRef.current) {
      // Method 1: Use postMessage (preferred)
      try {
        webViewRef.current.postMessage(JSON.stringify(message));
        console.log('[PlatformWebView] ✅ Message sent via postMessage');
      } catch (error) {
        console.error('[PlatformWebView] ❌ Error sending via postMessage:', error);
      }

      // Method 2: Inject JavaScript as fallback
      const script = `
        (function() {
          try {
            // Dispatch as MessageEvent
            window.dispatchEvent(new MessageEvent('message', {
              data: ${JSON.stringify(message)}
            }));

            // Also dispatch as CustomEvent for better compatibility
            window.dispatchEvent(new CustomEvent('reactNativeMessage', {
              detail: ${JSON.stringify(message)}
            }));
          } catch (error) {
            console.error('[WebView] Error dispatching message:', error);
          }
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handleShare = async (shareData: any) => {
    try {
      const { url, title, text } = shareData;

      if (!url) {
        sendMessageToWebView({
          type: 'shareResult',
          success: false,
          error: 'URL is required for sharing'
        });
        return;
      }

      const shareOptions = {
        title: title || 'Check this out!',
        message: text ? `${text}\n\n${url}` : url,
        url: url,
      };

      const result = await Share.share(shareOptions);

      sendMessageToWebView({
        type: 'shareResult',
        success: true,
        action: result.action,
        activityType: result.activityType || null
      });

    } catch (error) {
      console.error('[Native App] Share error:', error);
      sendMessageToWebView({
        type: 'shareResult',
        success: false,
        error: error instanceof Error ? error.message : 'Share failed'
      });
    }
  };

  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'webViewReady') {
        console.log('[PlatformWebView] ✅ SCENARIO 3a: Web app signaled ready');
        setWebViewReady(true);

        console.log('[PlatformWebView] 📤 Sending initial token to web app:', {
          token: notificationContext?.pushToken || null,
          permissionStatus: notificationContext?.permissionStatus || 'unknown',
        });
        // Send push token immediately (including null with status)
        sendMessageToWebView({
          type: 'pushToken',
          token: notificationContext?.pushToken || null,
          permissionStatus: notificationContext?.permissionStatus || 'unknown',
          timestamp: new Date().toISOString(),
        });
      } else if (data.type === 'requestPushToken') {
        console.log('[PlatformWebView] 📥 SCENARIO 3b: Web app explicitly requested token');
        console.log('[PlatformWebView] 📤 Sending current token to web app:', {
          token: notificationContext?.pushToken || null,
          permissionStatus: notificationContext?.permissionStatus || 'unknown',
        });
        sendMessageToWebView({
          type: 'pushToken',
          token: notificationContext?.pushToken || null,
          permissionStatus: notificationContext?.permissionStatus || 'unknown',
          timestamp: new Date().toISOString(),
        });
      } else if (data.type === 'GOOGLE_LOGIN_REQUEST') {
        const result = await initiateGoogleLogin();

        if (result.success && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.postMessage({
              type: 'GOOGLE_LOGIN_SUCCESS',
              accessToken: '${result.accessToken}',
              idToken: '${result.idToken}'
            }, '*');
            true;
          `);
        } else if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            window.postMessage({
              type: 'GOOGLE_LOGIN_ERROR',
              error: '${result.error || 'Login failed'}'
            }, '*');
            true;
          `);
        }
      } else if (data.type === 'share') {
        await handleShare(data);
      }
    } catch (error) {
      console.error('[Native App] Error handling WebView message:', error);
      sendMessageToWebView({
        type: 'error',
        success: false,
        error: 'Failed to parse message: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };

  const injectedJavaScript = `
    (function() {
      window.isReactNativeWebView = true;

      // Store the native postMessage function
      const nativePostMessage = window.ReactNativeWebView.postMessage.bind(window.ReactNativeWebView);

      // Override with our wrapper
      window.ReactNativeWebView = {
        postMessage: nativePostMessage
      };

      window.requestGoogleLogin = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'GOOGLE_LOGIN_REQUEST'
        }));
      };

      window.shareContent = function(shareData) {
        try {
          const message = JSON.stringify({
            type: 'share',
            url: shareData.url,
            title: shareData.title,
            text: shareData.text
          });
          window.ReactNativeWebView.postMessage(message);
        } catch (error) {
          console.error('[WebView] Error in shareContent:', error);
        }
      };

      // Notify native app that WebView is ready
      setTimeout(function() {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'webViewReady',
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('[WebView] Error sending webViewReady:', error);
        }
      }, 500);
    })();
    true;
  `;

  if (Platform.OS === 'web') {
    return <WebWebView {...props} ref={ref} />;
  }

  // For mobile platforms, use react-native-webview with OAuth support
  return (
    <WebView
      {...props}
      ref={webViewRef}
      userAgent="VibzWorldApp/1.0"
      onMessage={handleWebViewMessage}
      injectedJavaScript={injectedJavaScript}
    />
  );
});

export default PlatformWebView;