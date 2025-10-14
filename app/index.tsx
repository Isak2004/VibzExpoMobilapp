import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PlatformWebView from '@/components/PlatformWebView';

const DEFAULT_URL = 'https://loveappneo.vibz.world';

export default function BrowserScreen() {
  const { url: initialUrl } = useLocalSearchParams<{ url?: string }>();
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNavigation, setShowNavigation] = useState(false);
  const webViewRef = useRef<any>(null);

  // Start with default URL or handle deep linking
  useEffect(() => {
    if (initialUrl) {
      const decodedUrl = decodeURIComponent(initialUrl);
      const formattedUrl = formatUrl(decodedUrl);
      setUrl(decodedUrl);
      setCurrentUrl(formattedUrl);
    } else {
      setCurrentUrl(DEFAULT_URL);
      setUrl(DEFAULT_URL);
    }
  }, [initialUrl]);

  const formatUrl = (inputUrl: string): string => {
    if (!inputUrl.trim()) return '';
    
    let cleanUrl = inputUrl.trim();
    
    // Check if it looks like a search query (no dots or spaces with multiple words)
    if (!cleanUrl.includes('.') || (cleanUrl.includes(' ') && cleanUrl.split(' ').length > 1)) {
      // Treat as search query
      return `https://www.google.com/search?q=${encodeURIComponent(cleanUrl)}`;
    }
    
    // Remove any existing protocol
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    
    // Add https:// if no protocol specified
    if (!cleanUrl.includes('://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    return cleanUrl;
  };

  const handleUrlSubmit = () => {
    const formattedUrl = formatUrl(url);
    if (!formattedUrl) return;

    setCurrentUrl(formattedUrl);
    setError(null);
    setShowNavigation(false);
    Keyboard.dismiss();
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (error: any) => {
    setLoading(false);
    setError('This website cannot be displayed due to security restrictions.');
  };

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url !== currentUrl) {
      setUrl(navState.url);
    }
  };

  const handleLongPress = () => {
    setShowNavigation(true);
  };

  return (
    <Pressable
      style={styles.fullscreenContainer}
      onLongPress={handleLongPress}
      delayLongPress={3000}
    >
      <PlatformWebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        allowsBackForwardNavigationGestures={true}
      />

      {showNavigation && (
        <View style={styles.navigationOverlay}>
          <View style={styles.navigationBar}>
            <TextInput
              style={styles.navInput}
              value={url}
              onChangeText={setUrl}
              placeholder="Enter URL"
              placeholderTextColor="#999"
              keyboardType="web-search"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={handleUrlSubmit}
              autoFocus
            />
            <TouchableOpacity style={styles.navGoButton} onPress={handleUrlSubmit}>
              <Text style={styles.navGoButtonText}>Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
  },
  navigationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#FFFFFF',
    paddingHorizontal: 12,
  },
  navGoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  navGoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});