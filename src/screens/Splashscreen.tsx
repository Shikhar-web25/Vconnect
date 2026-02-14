import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.delay(500),

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace("Login");
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>V</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
        VConnect
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
        Connect • Share • Engage
      </Animated.Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  logoText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#6366f1",
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 2,
  },
});
