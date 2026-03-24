import React, { useEffect, useRef } from "react";
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = NativeStackScreenProps<any>;

const icons = [
  "book-open-variant",
  "pencil",
  "calculator",
  "flask",
  "atom",
  "lightbulb-on",
  "certificate",
  "rocket",
];

export default function SplashOrbitalTimelapse({ navigation }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const radius = useRef(new Animated.Value(130)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const implode = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(spin, {
          toValue: 1,
          duration: 1450,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(ring, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(radius, {
          toValue: 12,
          duration: 380,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(implode, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      ]),
      Animated.delay(320),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => navigation.replace("Login"));
  }, [fade, implode, logoOpacity, logoScale, navigation, radius, ring, spin]);

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] });
  const ringOpacity = implode.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={["#040910", "#081a2d", "#06101e"]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />

      <Animated.View style={[styles.orbitLayer, { transform: [{ rotate: rotation }] }]}>
        {icons.map((name, i) => {
          const angle = (i / icons.length) * Math.PI * 2;
          const tx = Animated.multiply(radius, Math.cos(angle));
          const ty = Animated.multiply(radius, Math.sin(angle));
          return (
            <Animated.View key={name} style={[styles.iconWrap, { transform: [{ translateX: tx }, { translateY: ty }] }]}>
              <Icon name={name} size={20} color="#d9f4ff" />
            </Animated.View>
          );
        })}
      </Animated.View>

      <Animated.View style={[styles.logoBadge, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Icon name="school" size={54} color="#243c57" />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: logoOpacity }]}>Vconnect</Animated.Text>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#ffffff", opacity: fade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  ring: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 2.5,
    borderColor: "rgba(154, 231, 255, 0.85)",
  },
  orbitLayer: { position: "absolute", width: 1, height: 1, justifyContent: "center", alignItems: "center" },
  iconWrap: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(122, 188, 235, 0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoBadge: {
    width: 112,
    height: 112,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d9f4ff",
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  title: { marginTop: 20, color: "#ffffff", fontSize: 44, fontWeight: "900", letterSpacing: -1.2 },
});

