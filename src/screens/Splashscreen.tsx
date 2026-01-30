import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
type Props = NativeStackScreenProps<any>;
export default function SplashScreen({ navigation }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(20)).current;
  const taglineAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 14,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(taglineAnim, {
        toValue: 0,
        duration: 600,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2600);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#5483B3" barStyle="light-content" />
      <View style={styles.topShade} />
      <View style={styles.bottomShade} />
      <Animated.View
        style={[
          styles.logoBadge,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logoIcon}>🎓</Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.title,
          { transform: [{ translateY: titleAnim }] },
        ]}
      >
        Vconnect
      </Animated.Text>
      <Animated.Text
        style={[
          styles.tagline,
          { transform: [{ translateY: taglineAnim }] },
        ]}
      >
        Connect with VITians
      </Animated.Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5483B3",
    justifyContent: "center",
    alignItems: "center",
  },
  topShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  bottomShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  logoBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    padding: 22,
    borderRadius: 26,
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
  },
});