import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<any>;

export default function SplashScreen({ navigation }: Props) {
  // ─── ORIGINAL ANIMATIONS (UNTOUCHED) ───────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  const portalRotate = useRef(new Animated.Value(0)).current;
  const portalScale = useRef(new Animated.Value(0)).current;
  const portalOpacity = useRef(new Animated.Value(0)).current;

  const constellationOpacity = useRef(new Animated.Value(0)).current;

  const explosionFlash = useRef(new Animated.Value(0)).current;
  const shockwave1 = useRef(new Animated.Value(0)).current;
  const shockwave2 = useRef(new Animated.Value(0)).current;
  const shockwave3 = useRef(new Animated.Value(0)).current;

  const lightBurst = useRef(new Animated.Value(0)).current;
  const lightBurstRotate = useRef(new Animated.Value(0)).current;

  const paintSplatter = useRef(new Animated.Value(0)).current;

  const textGlow = useRef(new Animated.Value(0)).current;

  const vortexSpin = useRef(new Animated.Value(0)).current;

  const centerImplosion = useRef(new Animated.Value(0)).current;

  // UNIFIED TEXT - exact same positioning as original
  const unifiedTextOpacity = useRef(new Animated.Value(0)).current;
  const unifiedTextScale = useRef(new Animated.Value(0.8)).current;
  const unifiedTextY = useRef(new Animated.Value(0)).current;
  const textFlicker = useRef(new Animated.Value(1)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(80)).current;

  const holographicShimmer = useRef(new Animated.Value(0)).current;

  const glowRing1 = useRef(new Animated.Value(0)).current;
  const glowRing2 = useRef(new Animated.Value(0)).current;

  // Smooth page-out transition
  const screenFade = useRef(new Animated.Value(0)).current;

  // ─── NEW EFFECT ANIMATIONS ──────────────────────────────────────────────────
  const colorShift = useRef(new Animated.Value(0)).current;
  const lightBeam = useRef(new Animated.Value(0)).current;
  const rippleWave1 = useRef(new Animated.Value(0)).current;
  const rippleWave2 = useRef(new Animated.Value(0)).current;
  const rippleWave3 = useRef(new Animated.Value(0)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;
  const textRotation = useRef(new Animated.Value(0)).current;

  // Sparkle trail (12 sparkles that follow the slide)
  const sparkleTrail = useRef(
    Array.from({ length: 12 }, () => ({
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  // Landing burst (16 particles that burst when text lands)
  const landingBurst = useRef(
    Array.from({ length: 16 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 16;
      return {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        targetX: Math.cos(angle) * 80,
        targetY: Math.sin(angle) * 80 + 60,
      };
    })
  ).current;

  // ─── STUDY ITEMS (UNTOUCHED) ────────────────────────────────────────────────
  const studyItems = useRef([
    { icon: 'book-open-variant', color: '#FF6B6B', glowColor: '#FF8E8E', size: 32, ...createAnimValues() },
    { icon: 'book', color: '#4ECDC4', glowColor: '#6FE5DC', size: 28, ...createAnimValues() },
    { icon: 'notebook', color: '#FFE66D', glowColor: '#FFF099', size: 30, ...createAnimValues() },
    { icon: 'book-multiple', color: '#FF8C42', glowColor: '#FFAA6F', size: 26, ...createAnimValues() },
    { icon: 'pencil', color: '#95E1D3', glowColor: '#B5F5E7', size: 28, ...createAnimValues() },
    { icon: 'pen', color: '#F38181', glowColor: '#FF9E9E', size: 26, ...createAnimValues() },
    { icon: 'fountain-pen-tip', color: '#E17055', glowColor: '#F08C73', size: 26, ...createAnimValues() },
    { icon: 'school', color: '#A29BFE', glowColor: '#C1BCFE', size: 32, ...createAnimValues() },
    { icon: 'certificate', color: '#FD79A8', glowColor: '#FFA0C5', size: 30, ...createAnimValues() },
    { icon: 'flask', color: '#74B9FF', glowColor: '#9ACFFF', size: 28, ...createAnimValues() },
    { icon: 'atom', color: '#FFB8E6', glowColor: '#FFD4F0', size: 30, ...createAnimValues() },
    { icon: 'calculator', color: '#C7CEEA', glowColor: '#E0E5F5', size: 28, ...createAnimValues() },
    { icon: 'lightbulb-on', color: '#FFEAA7', glowColor: '#FFF5D1', size: 26, ...createAnimValues() },
    { icon: 'brain', color: '#55EFC4', glowColor: '#7FF5D6', size: 32, ...createAnimValues() },
    { icon: 'dna', color: '#DFE6E9', glowColor: '#F5F8FA', size: 28, ...createAnimValues() },
    { icon: 'rocket', color: '#6C5CE7', glowColor: '#8B7EED', size: 30, ...createAnimValues() },
  ]).current;

  const explosionPositions = useRef(studyItems.map(() => ({ x: 0, y: 0 }))).current;

  const particles = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
      type: i % 4 === 0 ? 'airplane' : i % 4 === 1 ? 'sparkle' : i % 4 === 2 ? 'bubble' : 'star',
      color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE', '#FD79A8', '#74B9FF', '#55EFC4'][i % 7],
    }))
  ).current;

  const ambientParticles = useRef(
    Array.from({ length: 15 }, () => {
      const startX = (Math.random() - 0.5) * width;
      const startY = (Math.random() - 0.5) * height;
      return {
        startX,
        startY,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      };
    })
  ).current;

  // ─── PARTICLE BUILD SYSTEM (NEW - PHASE 0) ─────────────────────────────────
  // 60 tiny glowing education icons (background ambiance)
  const buildParticles = useRef(
    Array.from({ length: 60 }, (_, i) => {
      const angleStep = (Math.PI * 2) / 60;
      const angle = i * angleStep;
      const radius = 65;

      const icons = ['book-open-page-variant', 'pencil', 'atom', 'flask', 'calculator', 'lightbulb-on-outline', 'brain', 'rocket'];
      const colors = ['#26d0ce', '#4ECDC4', '#74B9FF', '#A29BFE', '#FFE66D', '#FF6B6B', '#55EFC4', '#FD79A8'];

      const typeIndex = i % icons.length;

      return {
        startX: (Math.random() - 0.5) * width * 1.2,
        startY: (Math.random() - 0.5) * height * 1.2,
        endX: Math.cos(angle) * radius,
        endY: Math.sin(angle) * radius,
        icon: icons[typeIndex],
        color: colors[typeIndex],
        x: new Animated.Value((Math.random() - 0.5) * width * 1.2),
        y: new Animated.Value((Math.random() - 0.5) * height * 1.2),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        rotate: new Animated.Value(Math.random() * 360),
      };
    })
  ).current;

  // ─── VECTOR LOGO ASSEMBLY (NEW!) ───────────────────────────────────────────
  // 16 BIGGER vector outline icons that assemble into logo shape
  const vectorIcons = useRef([
    { icon: 'book-open-variant', color: '#FF6B6B', ...createAnimValues() },
    { icon: 'book', color: '#4ECDC4', ...createAnimValues() },
    { icon: 'notebook', color: '#FFE66D', ...createAnimValues() },
    { icon: 'book-multiple', color: '#FF8C42', ...createAnimValues() },
    { icon: 'pencil', color: '#95E1D3', ...createAnimValues() },
    { icon: 'pen', color: '#F38181', ...createAnimValues() },
    { icon: 'fountain-pen-tip', color: '#E17055', ...createAnimValues() },
    { icon: 'school', color: '#A29BFE', ...createAnimValues() },
    { icon: 'certificate', color: '#FD79A8', ...createAnimValues() },
    { icon: 'flask', color: '#74B9FF', ...createAnimValues() },
    { icon: 'atom', color: '#FFB8E6', ...createAnimValues() },
    { icon: 'calculator', color: '#C7CEEA', ...createAnimValues() },
    { icon: 'lightbulb-on', color: '#FFEAA7', ...createAnimValues() },
    { icon: 'brain', color: '#55EFC4', ...createAnimValues() },
    { icon: 'dna', color: '#DFE6E9', ...createAnimValues() },
    { icon: 'rocket', color: '#6C5CE7', ...createAnimValues() },
  ].map((item, index) => {
    const angle = (index * Math.PI * 2) / 16;
    const radius = 50;

    return {
      ...item,
      startX: Math.cos(angle) * width * 0.8,
      startY: Math.sin(angle) * height * 0.8,
      endX: Math.cos(angle) * radius,
      endY: Math.sin(angle) * radius,
      x: new Animated.Value(Math.cos(angle) * width * 0.8),
      y: new Animated.Value(Math.sin(angle) * height * 0.8),
    };
  })).current;

  const vectorFlash = useRef(new Animated.Value(0)).current;
  const vectorGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ambient particles float continuously
    ambientParticles.forEach((particle, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: particle.startY,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.3,
            duration: 2000,
            delay: i * 200,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: particle.startY - 150,
              duration: 4000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 2000,
              delay: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    // ═══════════════════════════════════════════════════════
    // MAIN SEQUENCE
    // ═══════════════════════════════════════════════════════
    Animated.sequence([

      // ═══════════════════════════════════════════════════════
      // PHASE 0: ENHANCED PARTICLE BUILD + VECTOR ASSEMBLY
      // ═══════════════════════════════════════════════════════

      // Step 1: Tiny particles drift to background (0-1500ms)
      Animated.parallel([
        ...buildParticles.map((particle, index) => {
          const delay = index * 10;
          return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0.4,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(particle.scale, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.timing(particle.x, {
                toValue: particle.endX,
                duration: 1200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: particle.endY,
                duration: 1200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]);
        }),
      ]),

      // Step 2: BIG vector icons assemble logo (1500-2800ms)
      Animated.parallel([
        ...vectorIcons.map((icon, index) => {
          const delay = index * 60;
          return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(icon.opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.spring(icon.scale, {
                toValue: 1.2,
                friction: 6,
                tension: 60,
                useNativeDriver: true,
              }),
              Animated.timing(icon.x, {
                toValue: icon.endX,
                duration: 800,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
              }),
              Animated.timing(icon.y, {
                toValue: icon.endY,
                duration: 800,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
              }),
              Animated.timing(icon.rotate, {
                toValue: 360,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.spring(icon.scale, {
              toValue: 1,
              friction: 8,
              useNativeDriver: true,
            }),
          ]);
        }),
      ]),

      Animated.delay(200),

      // Step 3: GLOW INTENSIFIES (2800-3300ms)
      Animated.parallel([
        Animated.timing(vectorGlow, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        ...vectorIcons.map((icon) =>
          Animated.timing(icon.scale, {
            toValue: 1.3,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        ),
      ]),

      // BRIGHT WHITE FLASH + logo fades in
      Animated.sequence([
        Animated.timing(vectorFlash, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(vectorFlash, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          ...vectorIcons.map((icon) =>
            Animated.timing(icon.opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ),
          Animated.sequence([
            Animated.delay(100),
            Animated.parallel([
              Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.spring(logoScale, {
                toValue: 1.1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]),

      Animated.delay(200),

      // PHASE 8: TEXT APPEARS + EFFECTS (8000-9000ms)
      Animated.sequence([
        Animated.parallel([
          Animated.timing(unifiedTextOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(unifiedTextScale, { toValue: 1.1, friction: 6, tension: 60, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(glowRing1, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(glowRing2, { toValue: 1, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(100),
            Animated.timing(lightBeam, { toValue: 1, duration: 500, useNativeDriver: true }),
          ]),
          Animated.timing(colorShift, { toValue: 1, duration: 800, useNativeDriver: false }),
        ]),

        Animated.delay(200),
      ]),

      // PHASE 9: SLIDE DOWN WITH EFFECTS (9000-9800ms)
      Animated.parallel([
        Animated.timing(unifiedTextY, {
          toValue: 60, duration: 800, easing: Easing.out(Easing.back(0.8)), useNativeDriver: true,
        }),
        Animated.timing(textRotation, {
          toValue: 360, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.spring(unifiedTextScale, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
        Animated.timing(glowRing1, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(glowRing2, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(lightBeam, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(colorShift, { toValue: 0, duration: 800, useNativeDriver: false }),
        ...sparkleTrail.map((sparkle, index) => {
          const delay = index * 60;
          return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(sparkle.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
              Animated.spring(sparkle.scale, { toValue: 1, friction: 4, useNativeDriver: true }),
              Animated.timing(sparkle.y, {
                toValue: 60, duration: Math.max(100, 700 - delay), useNativeDriver: true,
              }),
            ]),
            Animated.timing(sparkle.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]);
        }),
        Animated.sequence([
          Animated.delay(400),
          Animated.parallel([
            Animated.timing(taglineY, {
              toValue: 0, duration: 500, easing: Easing.out(Easing.back(1)), useNativeDriver: true,
            }),
            Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]),
        ]),
      ]),

      // PHASE 10: LANDING EFFECTS (9800-10300ms)
      Animated.parallel([
        Animated.stagger(150, [
          Animated.timing(rippleWave1, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(rippleWave2, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(rippleWave3, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        ...landingBurst.map((burst) =>
          Animated.sequence([
            Animated.parallel([
              Animated.timing(burst.opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
              Animated.spring(burst.scale, { toValue: 1, friction: 5, useNativeDriver: true }),
              Animated.timing(burst.x, { toValue: burst.targetX, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
              Animated.timing(burst.y, { toValue: burst.targetY, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            ]),
            Animated.timing(burst.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        ),
      ]),

      Animated.delay(400),

      // PHASE 11: HOLD BRIEFLY, THEN DISSOLVE (10300ms+)
      Animated.delay(600),

      Animated.parallel([
        Animated.timing(screenFade, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(unifiedTextY, {
          toValue: 30,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(unifiedTextOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

    ]).start(() => {
      // Navigate to Login screen
      navigation.replace("Login");
    });

    // Breathing scale
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathingScale, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breathingScale, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }, 10300);

    // Text glow pulse
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(textGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(textGlow, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }, 9800);

    // Holographic shimmer
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(holographicShimmer, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(holographicShimmer, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }, 9800);

    return () => {};
  }, []);

  // ─── INTERPOLATIONS ─────────────────────────────────────────────────────────
  const portalRotation = portalRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const shockwave1Opacity = shockwave1.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] });
  const shockwave1Scale = shockwave1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 4] });
  const shockwave2Opacity = shockwave2.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  const shockwave2Scale = shockwave2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 4.8] });
  const shockwave3Opacity = shockwave3.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const shockwave3Scale = shockwave3.interpolate({ inputRange: [0, 1], outputRange: [0.5, 5.5] });

  const lightBurstOpacity = lightBurst.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const lightBurstScale = lightBurst.interpolate({ inputRange: [0, 1], outputRange: [0, 3.5] });
  const lightBurstRotation = lightBurstRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const paintSplatterScale = paintSplatter.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });
  const paintSplatterOpacity = paintSplatter.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.6, 0] });

  const textGlowOpacity = textGlow.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });
  const textGlowScale = textGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  const shimmerTranslate = holographicShimmer.interpolate({ inputRange: [0, 1], outputRange: [-200, 200] });

  const vortexRotation = vortexSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  const centerImplosionScale = centerImplosion.interpolate({ inputRange: [0, 1], outputRange: [0, 1.5] });
  const centerImplosionOpacity = centerImplosion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });

  const glowRing1Opacity = glowRing1.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });
  const glowRing1Scale = glowRing1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] });
  const glowRing2Opacity = glowRing2.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const glowRing2Scale = glowRing2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] });

  const textColor = colorShift.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['#FFFFFF', '#26d0ce', '#FFFFFF'] });
  const lightBeamOpacity = lightBeam.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });

  const ripple1Opacity = rippleWave1.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  const ripple1Scale = rippleWave1.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2.5] });
  const ripple2Opacity = rippleWave2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const ripple2Scale = rippleWave2.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3] });
  const ripple3Opacity = rippleWave3.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });
  const ripple3Scale = rippleWave3.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3.5] });

  const slideRotation = textRotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  const vectorFlashOpacity = vectorFlash.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const vectorGlowOpacity = vectorGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] });
  const vectorGlowScale = vectorGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── BACKGROUND (EXTRA DARK for brilliant shine) ── */}
      <LinearGradient
        colors={['#020408', '#030610', '#020408']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(26, 41, 128, 0.08)', 'rgba(38, 208, 206, 0.05)', 'rgba(26, 41, 128, 0.08)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* ── AMBIENT PARTICLES ── */}
      {ambientParticles.map((particle, index) => (
        <Animated.View
          key={`ambient-${index}`}
          style={[styles.ambientParticle, {
            opacity: particle.opacity,
            transform: [{ translateX: particle.x }, { translateY: particle.y }, { scale: particle.scale }],
          }]}
        />
      ))}

      {/* ── BUILD PARTICLES ── */}
      {buildParticles.map((particle, index) => (
        <Animated.View
          key={`build-${index}`}
          style={[styles.buildParticle, {
            opacity: particle.opacity,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale },
              { rotate: particle.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })
              },
            ],
          }]}
        >
          <Icon name={particle.icon} size={10} color={particle.color} />
        </Animated.View>
      ))}

      {/* ── VECTOR GLOW ── */}
      <Animated.View
        style={[styles.vectorGlow, {
          opacity: vectorGlowOpacity,
          transform: [{ scale: vectorGlowScale }],
        }]}
      />

      {/* ── VECTOR ICONS ── */}
      {vectorIcons.map((icon, index) => (
        <Animated.View
          key={`vector-${index}`}
          style={[styles.vectorIcon, {
            opacity: icon.opacity,
            transform: [
              { translateX: icon.x },
              { translateY: icon.y },
              { scale: icon.scale },
              { rotate: icon.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })
              },
            ],
          }]}
        >
          <View style={[styles.vectorIconGlow, { backgroundColor: icon.color, shadowColor: icon.color }]} />
          <Icon name={icon.icon} size={40} color={icon.color} style={{ opacity: 0.9 }} />
        </Animated.View>
      ))}

      {/* ── VECTOR FLASH ── */}
      <Animated.View
        style={[styles.vectorFlash, { opacity: vectorFlashOpacity }]}
      />

      {/* ── PAINT SPLATTER ── */}
      <Animated.View
        style={[styles.paintSplatter, {
          opacity: paintSplatterOpacity,
          transform: [{ scale: paintSplatterScale }],
        }]}
      />

      {/* ── PORTAL ── */}
      <Animated.View
        style={[styles.portal, {
          opacity: portalOpacity,
          transform: [{ scale: portalScale }, { rotate: portalRotation }],
        }]}
      >
        <View style={styles.portalRing1} />
        <View style={styles.portalRing2} />
        <View style={styles.portalRing3} />
        <View style={styles.portalCenter} />
      </Animated.View>

      {/* ── EXPLOSION FLASH ── */}
      <Animated.View style={[styles.explosionFlash, { opacity: explosionFlash }]} />

      {/* ── SHOCKWAVES ── */}
      <Animated.View style={[styles.shockwave, { opacity: shockwave1Opacity, transform: [{ scale: shockwave1Scale }], borderColor: '#FF6B6B' }]} />
      <Animated.View style={[styles.shockwave, { opacity: shockwave2Opacity, transform: [{ scale: shockwave2Scale }], borderColor: '#4ECDC4' }]} />
      <Animated.View style={[styles.shockwave, { opacity: shockwave3Opacity, transform: [{ scale: shockwave3Scale }], borderColor: '#A29BFE' }]} />

      {/* ── CENTER IMPLOSION ── */}
      <Animated.View
        style={[styles.centerImplosion, {
          opacity: centerImplosionOpacity,
          transform: [{ scale: centerImplosionScale }],
        }]}
      />

      {/* ── VORTEX ── */}
      <Animated.View style={[styles.vortex, { opacity: vortexSpin, transform: [{ rotate: vortexRotation }] }]}>
        <View style={styles.vortexLine1} />
        <View style={styles.vortexLine2} />
        <View style={styles.vortexLine3} />
      </Animated.View>

      {/* ── CONSTELLATION LINES ── */}
      <Animated.View style={[styles.constellationContainer, { opacity: constellationOpacity }]}>
        {studyItems.map((_, index) => {
          if (index === 0) return null;
          const angle1 = ((index - 1) * Math.PI * 2) / studyItems.length;
          const angle2 = (index * Math.PI * 2) / studyItems.length;
          const distance = 240;
          const x1 = Math.cos(angle1) * distance;
          const y1 = Math.sin(angle1) * distance;
          const x2 = Math.cos(angle2) * distance;
          const y2 = Math.sin(angle2) * distance;
          const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const lineColor = studyItems[index].color;
          return (
            <View
              key={`line-${index}`}
              style={[styles.constellationLine, {
                width: lineLength,
                left: width / 2 + x1,
                top: height / 2 + y1,
                backgroundColor: lineColor,
                shadowColor: lineColor,
                transform: [{ rotate: `${angle}rad` }],
              }]}
            />
          );
        })}
      </Animated.View>

      {/* ── PARTICLES ── */}
      {particles.map((particle, index) => (
        <Animated.View
          key={`particle-${index}`}
          style={[styles.particle, {
            opacity: particle.opacity,
            transform: [{ translateX: particle.x }, { translateY: particle.y }, { scale: particle.scale }],
          }]}
        >
          {particle.type === 'airplane' ? (
            <Icon name="airplane" size={22} color={particle.color} />
          ) : particle.type === 'sparkle' ? (
            <Icon name="star-four-points" size={18} color={particle.color} />
          ) : particle.type === 'star' ? (
            <Icon name="star" size={16} color={particle.color} />
          ) : (
            <View style={[styles.bubble, { backgroundColor: particle.color, shadowColor: particle.color }]} />
          )}
        </Animated.View>
      ))}

      {/* ── STUDY ITEMS ── */}
      {studyItems.map((item, index) => (
        <Animated.View
          key={index}
          style={[styles.studyItem, {
            opacity: item.opacity,
            transform: [
              { translateX: item.x },
              { translateY: item.y },
              { scale: item.scale },
              { rotate: item.rotate.interpolate({ inputRange: [-720, 720], outputRange: ['-720deg', '720deg'] }) },
            ],
          }]}
        >
          <View style={[styles.studyItemGlow, { backgroundColor: item.glowColor }]} />
          <View style={[styles.studyItemBg, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={item.size} color="#FFFFFF" />
          </View>
        </Animated.View>
      ))}

      {/* ── LOGO ── */}
      <Animated.View
        style={[styles.logoBadge, {
          opacity: logoOpacity,
          transform: [{ scale: Animated.multiply(logoScale, logoPulse) }],
        }]}
      >
        <Icon name="school" size={64} color="#4A6D8C" />
      </Animated.View>

      {/* ── LIGHT BURST ── */}
      <Animated.View
        style={[styles.lightBurst, {
          opacity: lightBurstOpacity,
          transform: [{ scale: lightBurstScale }, { rotate: lightBurstRotation }],
        }]}
      >
        <View style={[styles.lightRay, { backgroundColor: '#FF6B6B' }]} />
        <View style={[styles.lightRay, { backgroundColor: '#4ECDC4', transform: [{ rotate: '30deg' }] }]} />
        <View style={[styles.lightRay, { backgroundColor: '#FFE66D', transform: [{ rotate: '60deg' }] }]} />
        <View style={[styles.lightRay, { backgroundColor: '#A29BFE', transform: [{ rotate: '90deg' }] }]} />
        <View style={[styles.lightRay, { backgroundColor: '#FD79A8', transform: [{ rotate: '120deg' }] }]} />
        <View style={[styles.lightRay, { backgroundColor: '#74B9FF', transform: [{ rotate: '150deg' }] }]} />
      </Animated.View>

      {/* ── LIGHT BEAM ── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.lightBeamContainer, {
          opacity: lightBeamOpacity,
          transform: [{ translateY: unifiedTextY }],
        }]}
      />

      {/* ── GLOW RINGS ── */}
      <Animated.View
        style={[styles.glowRing, {
          opacity: glowRing1Opacity,
          transform: [{ translateY: unifiedTextY }, { scale: glowRing1Scale }],
        }]}
      />
      <Animated.View
        style={[styles.glowRing, styles.glowRing2, {
          opacity: glowRing2Opacity,
          transform: [{ translateY: unifiedTextY }, { scale: glowRing2Scale }],
        }]}
      />

      {/* ── SPARKLE TRAIL ── */}
      {sparkleTrail.map((sparkle, index) => (
        <Animated.View
          key={`sparkle-${index}`}
          pointerEvents="none"
          style={[styles.sparkleTrailItem, {
            opacity: sparkle.opacity,
            transform: [{ translateY: sparkle.y }, { scale: sparkle.scale }],
            left: width / 2 + (index % 2 === 0 ? -20 : 20),
          }]}
        >
          <Icon name="star-four-points" size={10} color="#FFE66D" />
        </Animated.View>
      ))}

      {/* ── LANDING BURST ── */}
      {landingBurst.map((burst, index) => (
        <Animated.View
          key={`burst-${index}`}
          pointerEvents="none"
          style={[styles.landingBurstDot, {
            opacity: burst.opacity,
            transform: [{ translateX: burst.x }, { translateY: burst.y }, { scale: burst.scale }],
          }]}
        />
      ))}

      {/* ── RIPPLE WAVES ── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.rippleWave, {
          opacity: ripple1Opacity,
          transform: [{ translateY: 60 }, { scale: ripple1Scale }],
        }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.rippleWave, {
          opacity: ripple2Opacity,
          transform: [{ translateY: 60 }, { scale: ripple2Scale }],
        }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.rippleWave, {
          opacity: ripple3Opacity,
          transform: [{ translateY: 60 }, { scale: ripple3Scale }],
        }]}
      />

      {/* ── TEXT GLOW ── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.textGlow, {
          opacity: Animated.multiply(unifiedTextOpacity, textGlowOpacity),
          transform: [{ translateY: unifiedTextY }, { scale: textGlowScale }],
        }]}
      />

      {/* ── HOLOGRAPHIC SHIMMER ── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.holographicShimmer, {
          opacity: Animated.multiply(unifiedTextOpacity, 0.3),
          transform: [{ translateX: shimmerTranslate }, { translateY: unifiedTextY }],
        }]}
      />

      {/* ── UNIFIED TEXT ── */}
      <Animated.View
        style={[styles.unifiedTextContainer, {
          opacity: unifiedTextOpacity,
          transform: [
            { translateY: unifiedTextY },
            { scale: Animated.multiply(Animated.multiply(unifiedTextScale, textFlicker), breathingScale) },
            { rotateY: slideRotation },
          ],
        }]}
      >
        <Animated.Text style={[styles.title, { color: textColor }]}>Vconnect</Animated.Text>
      </Animated.View>

      {/* ── TAGLINE ── */}
      <Animated.View
        style={[styles.taglineContainer, {
          opacity: taglineOpacity,
          transform: [{ translateY: taglineY }],
        }]}
      >
        <Text style={styles.tagline}>Connect with VITians</Text>
      </Animated.View>

      {/* ── SCREEN FADE OVERLAY ── */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, {
          backgroundColor: '#FFFFFF',
          opacity: screenFade,
        }]}
      />

    </View>
  );
}

function createAnimValues() {
  return {
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
    rotate: new Animated.Value(0),
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  explosionFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  ambientParticle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  buildParticle: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#26d0ce',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  vectorIcon: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vectorIconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  vectorGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  vectorFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  paintSplatter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  portal: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalRing1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'rgba(255, 107, 107, 0.8)',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  portalRing2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'rgba(78, 205, 196, 0.8)',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  portalRing3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(162, 155, 254, 0.8)',
    shadowColor: '#A29BFE',
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  portalCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  shockwave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
  },
  centerImplosion: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  vortex: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vortexLine1: {
    position: 'absolute',
    width: 250,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  vortexLine2: {
    position: 'absolute',
    width: 250,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '60deg' }],
  },
  vortexLine3: {
    position: 'absolute',
    width: 250,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '120deg' }],
  },
  constellationContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  constellationLine: {
    position: 'absolute',
    height: 3,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  particle: {
    position: 'absolute',
  },
  bubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  studyItem: {
    position: 'absolute',
  },
  studyItemGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.4,
  },
  studyItemBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  logoBadge: {
    backgroundColor: "#FFFFFF",
    width: 130,
    height: 130,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  lightBurst: {
    position: 'absolute',
    width: 500,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightRay: {
    position: 'absolute',
    width: 500,
    height: 8,
    shadowOpacity: 1,
    shadowRadius: 30,
    opacity: 0.9,
  },
  lightBeamContainer: {
    position: 'absolute',
    width: 180,
    height: height * 0.6,
    top: -height * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.6,
    shadowRadius: 40,
    borderRadius: 90,
  },
  glowRing: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 25,
  },
  glowRing2: {
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  sparkleTrailItem: {
    position: 'absolute',
    top: height / 2,
  },
  landingBurstDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  rippleWave: {
    position: 'absolute',
    width: 300,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  textGlow: {
    position: 'absolute',
    width: 380,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.5,
    shadowRadius: 50,
    top: height / 2 - 30,
  },
  holographicShimmer: {
    position: 'absolute',
    width: 80,
    height: 260,
    top: height / 2 - 30,
    left: width / 2 - 40,
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(78, 205, 196, 0.4)',
  },
  unifiedTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: height / 2,
  },
  title: {
    fontSize: 62,
    fontWeight: "900",
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 18,
  },
  taglineContainer: {
    position: 'absolute',
    top: height / 2 + 130,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 17,
    fontWeight: "700",
    color: "rgba(255,255,255,0.98)",
    letterSpacing: 4,
    textTransform: "uppercase",
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
});
