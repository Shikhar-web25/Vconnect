import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");

const networkIcons = [
  "book-open-variant",
  "school",
  "atom",
  "calculator",
  "lightbulb-on",
  "rocket",
  "notebook",
  "flask",
];

export default function SplashConstellationCampus({ navigation }: Props) {
  const reveal = useRef(new Animated.Value(0)).current;
  const converge = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const nodes = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const startR = 150 + (i % 2) * 20;
        const endR = 72;
        return {
          icon: networkIcons[i],
          sx: Math.cos(angle) * startR,
          sy: Math.sin(angle) * startR,
          ex: Math.cos(angle) * endR,
          ey: Math.sin(angle) * endR,
          color: ["#8ad8ff", "#4ee3c1", "#ffd36b", "#ff9f7a"][i % 4],
        };
      }),
    []
  );

  useEffect(() => {
    Animated.sequence([
      Animated.timing(reveal, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(converge, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 65, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
      Animated.delay(380),
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start(() => navigation.replace("Login"));
  }, [converge, fade, logoOpacity, logoScale, navigation, reveal, titleOpacity]);

  const bgGridOpacity = reveal.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] });
  const lineOpacity = converge.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0.75, 0.12] });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={["#03060f", "#0d1d36", "#05101e"]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.grid, { opacity: bgGridOpacity }]}>
        <View style={styles.gridLineH} />
        <View style={[styles.gridLineH, { top: "58%" }]} />
        <View style={styles.gridLineV} />
        <View style={[styles.gridLineV, { left: "62%" }]} />
      </Animated.View>

      <Animated.View style={[styles.links, { opacity: lineOpacity }]}>
        <View style={[styles.link, { transform: [{ rotate: "0deg" }] }]} />
        <View style={[styles.link, { transform: [{ rotate: "45deg" }] }]} />
        <View style={[styles.link, { transform: [{ rotate: "90deg" }] }]} />
        <View style={[styles.link, { transform: [{ rotate: "135deg" }] }]} />
      </Animated.View>

      {nodes.map((node, i) => {
        const x = converge.interpolate({ inputRange: [0, 1], outputRange: [node.sx, node.ex] });
        const y = converge.interpolate({ inputRange: [0, 1], outputRange: [node.sy, node.ey] });
        const nodeOpacity = reveal.interpolate({
          inputRange: [0, 0.2 + i * 0.08, 1],
          outputRange: [0, 0, 1],
        });
        return (
          <Animated.View key={node.icon} style={[styles.node, { opacity: nodeOpacity, transform: [{ translateX: x }, { translateY: y }] }]}>
            <View style={[styles.nodeGlow, { backgroundColor: node.color }]} />
            <Icon name={node.icon} size={20} color="#ffffff" />
          </Animated.View>
        );
      })}

      <Animated.View style={[styles.logoBadge, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Icon name="school" size={54} color="#223d59" />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Vconnect</Animated.Text>
      <Text style={styles.subtitle}>Find your campus circle</Text>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#ffffff", opacity: fade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  grid: { position: "absolute", width: width, height: height },
  gridLineH: { position: "absolute", top: "42%", width: "100%", height: 1, backgroundColor: "rgba(138,216,255,0.5)" },
  gridLineV: { position: "absolute", left: "38%", width: 1, height: "100%", backgroundColor: "rgba(138,216,255,0.4)" },
  links: { position: "absolute", width: 180, height: 180, justifyContent: "center", alignItems: "center" },
  link: { position: "absolute", width: 170, height: 2, backgroundColor: "rgba(160, 230, 255, 0.9)" },
  node: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  nodeGlow: { position: "absolute", width: 34, height: 34, borderRadius: 17, opacity: 0.6 },
  logoBadge: {
    width: 114,
    height: 114,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#a9e7ff",
    shadowOpacity: 0.36,
    shadowRadius: 24,
  },
  title: { marginTop: 24, color: "#ffffff", fontSize: 45, fontWeight: "900", letterSpacing: -1.2 },
  subtitle: { marginTop: 6, color: "rgba(255,255,255,0.75)", fontSize: 14, letterSpacing: 1.6, textTransform: "uppercase" },
});

