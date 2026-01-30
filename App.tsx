import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// 1. Import the provider and the hook for insets
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  return (
    // 2. Wrap your entire app in the Provider
    <SafeAreaProvider>
      {/* 3. Use SafeAreaView to automatically handle padding for notches */}
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>MentorLink</Text>
          <Text style={styles.subtitle}>
            Safe Area Context is now configured!
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;