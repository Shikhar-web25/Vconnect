import React, { useEffect, useRef } from "react";
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = NativeStackScreenProps<any>;

export default function SplashPaperDigital({ navigation }: Props) {
  const sketchIn = useRef(new Animated.Value(0)).current;
  const morph = useRef(new Animated.Value(0)).current;
  const uiTiles = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(sketchIn, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(morph, {
        toValue: 1,
        duration: 700,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(uiTiles, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(180),
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 340, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 64, useNativeDriver: true }),
            Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ]),
      Animated.delay(300),
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start(() => navigation.replace("Login"));
  }, [fade, logoOpacity, logoScale, morph, navigation, sketchIn, titleOpacity, uiTiles]);

  const cardOpacity = morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] });
  const cardScale = morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] });
  const sketchPop = sketchIn.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const phoneScale = morph.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });

  const tileY = (start: number) => uiTiles.interpolate({ inputRange: [0, 1], outputRange: [start, 0] });
  const tileO = uiTiles.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.8, 1] });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={["#181109", "#2b1f14", "#101a25"]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.sketchCard, { opacity: cardOpacity, transform: [{ scale: Animated.multiply(cardScale, sketchPop) }] }]}>
        <View style={styles.paper} />
        <View style={styles.stroke1} />
        <View style={styles.stroke2} />
        <View style={styles.stroke3} />
        <Icon name="pencil" size={20} color="#f2b66b" style={styles.pencil} />
        <Icon name="book-open-page-variant" size={18} color="#f2b66b" style={styles.book} />
      </Animated.View>

      <Animated.View style={[styles.phoneFrame, { transform: [{ scale: phoneScale }] }]}>
        <Animated.View style={[styles.tile, styles.tileTop, { opacity: tileO, transform: [{ translateY: tileY(-45) }] }]}>
          <Icon name="account-group" size={18} color="#1f3a58" />
          <Text style={styles.tileText}>Connect</Text>
        </Animated.View>
        <Animated.View style={[styles.tile, styles.tileMid, { opacity: tileO, transform: [{ translateY: tileY(45) }] }]}>
          <Icon name="book-open-page-variant" size={18} color="#1f3a58" />
          <Text style={styles.tileText}>Study</Text>
        </Animated.View>
        <Animated.View style={[styles.tile, styles.tileBot, { opacity: tileO, transform: [{ translateY: tileY(70) }] }]}>
          <Icon name="rocket-launch" size={18} color="#1f3a58" />
          <Text style={styles.tileText}>Grow</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.logoBadge, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Icon name="school" size={54} color="#223c58" />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Vconnect</Animated.Text>
      <Text style={styles.subtitle}>From notes to network</Text>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#ffffff", opacity: fade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  sketchCard: { position: "absolute", width: 230, height: 290, justifyContent: "center", alignItems: "center" },
  paper: { position: "absolute", width: 200, height: 255, borderRadius: 16, backgroundColor: "rgba(255,235,210,0.92)" },
  stroke1: { position: "absolute", width: 140, height: 5, borderRadius: 3, backgroundColor: "#c88d4f", top: 76, transform: [{ rotate: "-16deg" }] },
  stroke2: { position: "absolute", width: 120, height: 5, borderRadius: 3, backgroundColor: "#c88d4f", top: 132, transform: [{ rotate: "11deg" }] },
  stroke3: { position: "absolute", width: 130, height: 5, borderRadius: 3, backgroundColor: "#c88d4f", top: 188, transform: [{ rotate: "-8deg" }] },
  pencil: { position: "absolute", right: 12, bottom: 14 },
  book: { position: "absolute", left: 20, top: 28 },
  phoneFrame: {
    position: "absolute",
    width: 220,
    height: 300,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  tile: {
    position: "absolute",
    width: 170,
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(215, 241, 255, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  tileTop: { top: 54 },
  tileMid: { top: 124 },
  tileBot: { top: 194 },
  tileText: { color: "#1f3a58", fontWeight: "800", fontSize: 14, letterSpacing: 0.4 },
  logoBadge: {
    width: 114,
    height: 114,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  title: { marginTop: 24, color: "#ffffff", fontSize: 45, fontWeight: "900", letterSpacing: -1.2 },
  subtitle: { marginTop: 7, color: "rgba(255,255,255,0.72)", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" },
});

