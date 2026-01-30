import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/colors";
const { height } = Dimensions.get("window");
const EntryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(800),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigation.replace("Login");
      }, 300);
    });
  }, [fadeAnim, scaleAnim, slideAnim, navigation]);
  return (
    <View style={styles.container}>
      <View style={styles.gradientContainer}>
        <View style={[styles.gradient, styles.gradientTop]} />
        <View style={[styles.gradient, styles.gradientMiddle]} />
        <View style={[styles.gradient, styles.gradientBottom]} />
      </View>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.appName}>Vconnect</Text>
        <Text style={styles.tagline}>Connect with VITians</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.whiteCard,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      />
    </View>
  );
};
export default EntryScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.auth.gradientEnd,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: "absolute",
    width: "100%",
  },
  gradientTop: {
    top: 0,
    height: "40%",
    backgroundColor: Colors.auth.gradientStart,
  },
  gradientMiddle: {
    top: "30%",
    height: "40%",
    backgroundColor: Colors.auth.gradientMiddle,
    opacity: 0.8,
  },
  gradientBottom: {
    top: "60%",
    height: "40%",
    backgroundColor: Colors.auth.gradientEnd,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 56,
    fontWeight: "700",
    color: Colors.auth.white,
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
  },
  whiteCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: Colors.auth.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});