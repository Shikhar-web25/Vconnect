import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import AuthInput from "./AuthInput";

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  style?: any;
}

const RealisticEyeButton: React.FC<{ visible: boolean; onToggle: () => void }> = ({
  visible,
  onToggle,
}) => {
  const blinkAnim = useRef(new Animated.Value(0)).current;
  const gazeX = useRef(new Animated.Value(0)).current;
  const gazeY = useRef(new Animated.Value(0)).current;
  const pupilScale = useRef(new Animated.Value(visible ? 1 : 0.7)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const lidOpenAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (!visible) {
      blinkAnim.stopAnimation();
      blinkAnim.setValue(0);
    } else {
      const blinkLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(2400),
          Animated.timing(blinkAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
          Animated.delay(900),
        ])
      );
      blinkLoop.start();
    }

    const gazeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gazeX, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(gazeY, { toValue: -0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(gazeX, { toValue: -1, duration: 900, useNativeDriver: true }),
        Animated.timing(gazeY, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        Animated.timing(gazeX, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(gazeY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    gazeLoop.start();

    return () => {
      gazeLoop.stop();
    };
  }, [blinkAnim, gazeX, gazeY, visible]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pupilScale, { toValue: visible ? 1 : 0.7, duration: 140, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }),
      Animated.timing(lidOpenAnim, { toValue: visible ? 1 : 0, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [visible, glowAnim, pupilScale, lidOpenAnim]);

  const blinkScale = blinkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.12] });
  const gazeTranslateX = gazeX.interpolate({ inputRange: [-1, 1], outputRange: [-2, 2] });
  const gazeTranslateY = gazeY.interpolate({ inputRange: [-1, 1], outputRange: [-1.5, 1.5] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });
  const lidOpacity = lidOpenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const irisOpacity = lidOpenAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(blinkAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <View style={styles.eyeButton}>
        <Animated.View style={[styles.eyeGlow, { opacity: glowOpacity }]} />
        <Animated.View style={[styles.eyeShell, { transform: [{ scaleY: blinkScale }] }]}>
          <View style={styles.eyeSclera}>
            <Animated.View
              style={[
                styles.eyeIris,
                {
                  opacity: irisOpacity,
                  transform: [{ translateX: gazeTranslateX }, { translateY: gazeTranslateY }],
                },
              ]}
            >
              <View style={styles.irisOuter}>
                <View style={styles.irisInner}>
                  <Animated.View style={[styles.pupil, { transform: [{ scale: pupilScale }] }]} />
                </View>
              </View>
              <View style={styles.highlight} />
              <View style={styles.highlightSmall} />
            </Animated.View>
            <Animated.View style={[styles.closedEyeOverlay, { opacity: lidOpacity }]} />
          </View>
        </Animated.View>
        <View style={styles.eyeLidTop} />
        <View style={styles.eyeLidBottom} />
      </View>
    </TouchableOpacity>
  );
};

export default function PasswordInput({ icon, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthInput
      {...props}
      style={style}
      secureTextEntry={!visible}
      icon={icon}
      rightIcon={<RealisticEyeButton visible={visible} onToggle={() => setVisible((prev) => !prev)} />}
    />
  );
}

const styles = StyleSheet.create({
  eyeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeGlow: {
    position: "absolute",
    width: 30,
    height: 20,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.85)",
  },
  eyeShell: {
    width: 32,
    height: 18,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0A0F18",
  },
  eyeSclera: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  eyeIris: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  irisOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2F6BE0",
    alignItems: "center",
    justifyContent: "center",
  },
  irisInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
  },
  pupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#030712",
  },
  highlight: {
    position: "absolute",
    top: 2,
    left: 3,
    width: 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  highlightSmall: {
    position: "absolute",
    bottom: 3,
    right: 4,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  closedEyeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0F18",
  },
  eyeLidTop: {
    position: "absolute",
    top: 8,
    width: 30,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  eyeLidBottom: {
    position: "absolute",
    bottom: 8,
    width: 28,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(15,23,42,0.25)",
  },
});
