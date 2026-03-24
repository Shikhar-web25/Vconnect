import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StatusBar, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = NativeStackScreenProps<any>;

const icons = ["book-open-page-variant", "pencil", "atom", "calculator", "flask", "school"];

export default function SplashInkWater({ navigation }: Props) {
  const plume = useRef(new Animated.Value(0)).current;
  const absorb = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const floaters = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const x = -120 + i * 48;
        const y = i % 2 === 0 ? -90 + i * 15 : 90 - i * 12;
        return { icon: icons[i], x, y, tint: ["#36d6c0", "#ff8d5b", "#ffd36f"][i % 3] };
      }),
    []
  );

  useEffect(() => {
    Animated.sequence([
      Animated.timing(plume, {
        toValue: 1,
        duration: 1250,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(absorb, {
          toValue: 1,
          duration: 820,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(260),
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 62, useNativeDriver: true }),
            Animated.timing(titleOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          ]),
        ]),
      ]),
      Animated.delay(350),
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start(() => navigation.replace("Login"));
  }, [absorb, fade, logoOpacity, logoScale, navigation, plume, titleOpacity]);

  const plumeScale = plume.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.3] });
  const plumeRotate = plume.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "260deg"] });
  const plumeOpacity = absorb.interpolate({ inputRange: [0, 1], outputRange: [0.85, 0.06] });
  const absorbRingScale = absorb.interpolate({ inputRange: [0, 1], outputRange: [2.2, 0.2] });
  const absorbRingOpacity = absorb.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.7] });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={["#07070f", "#11253b", "#091720"]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.inkLayer, { opacity: plumeOpacity, transform: [{ rotate: plumeRotate }, { scale: plumeScale }] }]}>
        <View style={[styles.inkBlob, styles.inkA]} />
        <View style={[styles.inkBlob, styles.inkB]} />
        <View style={[styles.inkBlob, styles.inkC]} />
      </Animated.View>

      {floaters.map((item, i) => {
        const fx = absorb.interpolate({ inputRange: [0, 1], outputRange: [item.x, 0] });
        const fy = absorb.interpolate({ inputRange: [0, 1], outputRange: [item.y, 0] });
        const fo = plume.interpolate({ inputRange: [0, 0.25 + i * 0.08, 1], outputRange: [0, 0, 1] });
        const fs = absorb.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] });
        return (
          <Animated.View
            key={item.icon}
            style={[styles.floater, { opacity: fo, transform: [{ translateX: fx }, { translateY: fy }, { scale: fs }] }]}
          >
            <View style={[styles.floaterBg, { backgroundColor: item.tint }]} />
            <Icon name={item.icon} size={18} color="#ffffff" />
          </Animated.View>
        );
      })}

      <Animated.View style={[styles.absorbRing, { opacity: absorbRingOpacity, transform: [{ scale: absorbRingScale }] }]} />

      <Animated.View style={[styles.logoBadge, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Icon name="school" size={54} color="#243d58" />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Vconnect</Animated.Text>
      <Text style={styles.subtitle}>Ideas flow. People connect.</Text>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: "#ffffff", opacity: fade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  inkLayer: { position: "absolute", width: 360, height: 360, justifyContent: "center", alignItems: "center" },
  inkBlob: { position: "absolute", width: 220, height: 220, borderRadius: 110, opacity: 0.72 },
  inkA: { backgroundColor: "#2fd6bf", left: -56, top: 22 },
  inkB: { backgroundColor: "#ff8d5b", right: -62, top: -26 },
  inkC: { backgroundColor: "#ffd36f", top: 80 },
  floater: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  floaterBg: { position: "absolute", width: 30, height: 30, borderRadius: 15, opacity: 0.65 },
  absorbRing: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
  },
  logoBadge: {
    width: 114,
    height: 114,
    borderRadius: 34,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOpacity: 0.34,
    shadowRadius: 24,
  },
  title: { marginTop: 24, color: "#ffffff", fontSize: 45, fontWeight: "900", letterSpacing: -1.2 },
  subtitle: { marginTop: 7, color: "rgba(255,255,255,0.72)", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase" },
});

