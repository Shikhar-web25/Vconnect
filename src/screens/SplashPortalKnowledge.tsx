import React, { useEffect, useRef } from "react";
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = NativeStackScreenProps<any>;

export default function SplashPortalKnowledge({ navigation }: Props) {
  const pageFlow = useRef(new Animated.Value(0)).current;
  const portal = useRef(new Animated.Value(0)).current;
  const tunnel = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pageFlow, {
        toValue: 1,
        duration: 1150,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(portal, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(tunnel, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 370, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 58, useNativeDriver: true }),
      ]),
      Animated.delay(290),
      Animated.timing(fade, { toValue: 1, duration: 290, useNativeDriver: true }),
    ]).start(() => navigation.replace("Login"));
  }, [fade, logoOpacity, logoScale, navigation, pageFlow, portal, tunnel]);

  const pageOpacity = portal.interpolate({ inputRange: [0, 1], outputRange: [0.95, 0.08] });
  const ringScale = portal.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.8] });
  const ringOpacity = portal.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.58] });
  const tunnelScale = tunnel.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.2] });
  const tunnelOpacity = tunnel.interpolate({ inputRange: [0, 1], outputRange: [0.78, 0] });

  const sliceY = (offset: number) =>
    pageFlow.interpolate({
      inputRange: [0, 1],
      outputRange: [offset, -offset * 0.4],
    });

  const sliceRotate = (deg: string) =>
    pageFlow.interpolate({
      inputRange: [0, 1],
      outputRange: [deg, "0deg"],
    });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={["#040509", "#11152a", "#06101d"]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.portalRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[styles.tunnelGlow, { opacity: tunnelOpacity, transform: [{ scale: tunnelScale }] }]} />

      <Animated.View style={[styles.slice, styles.slice1, { opacity: pageOpacity, transform: [{ translateY: sliceY(180) }, { rotate: sliceRotate("-65deg") }] }]} />
      <Animated.View style={[styles.slice, styles.slice2, { opacity: pageOpacity, transform: [{ translateY: sliceY(145) }, { rotate: sliceRotate("65deg") }] }]} />
      <Animated.View style={[styles.slice, styles.slice3, { opacity: pageOpacity, transform: [{ translateY: sliceY(105) }, { rotate: sliceRotate("-35deg") }] }]} />
      <Animated.View style={[styles.slice, styles.slice4, { opacity: pageOpacity, transform: [{ translateY: sliceY(75) }, { rotate: sliceRotate("35deg") }] }]} />

      <Animated.View style={[styles.logoBadge, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Icon name="school" size={54} color="#253d58" />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: logoOpacity }]}>Vconnect</Animated.Text>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#ffffff", opacity: fade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  portalRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: "rgba(132, 212, 255, 0.86)",
  },
  tunnelGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(132, 212, 255, 0.2)",
    shadowColor: "#9be7ff",
    shadowOpacity: 0.75,
    shadowRadius: 35,
  },
  slice: {
    position: "absolute",
    width: 240,
    height: 24,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  slice1: { top: "28%" },
  slice2: { top: "38%" },
  slice3: { top: "48%" },
  slice4: { top: "58%" },
  logoBadge: {
    width: 112,
    height: 112,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9be7ff",
    shadowOpacity: 0.36,
    shadowRadius: 24,
  },
  title: { marginTop: 20, color: "#ffffff", fontSize: 44, fontWeight: "900", letterSpacing: -1.2 },
});

