import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function BrowserScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <Text style={styles.appTitle}>Browser App</Text>
        <Text style={styles.appSubtitle}>Test - App is working!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -2,
  },
  appSubtitle: {
    fontSize: 20,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});
