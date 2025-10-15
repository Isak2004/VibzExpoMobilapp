import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PlatformWebView from '@/components/PlatformWebView';

const START_PAGE_URL = 'https://loveappneo.vibz.world';

export default function BrowserScreen() {
  const webViewRef = useRef<any>(null);

  return (
    <View style={styles.container}>
      <PlatformWebView
        ref={webViewRef}
        source={{ uri: START_PAGE_URL }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        allowsBackForwardNavigationGestures={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
  },
});