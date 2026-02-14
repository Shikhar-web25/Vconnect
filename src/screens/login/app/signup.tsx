import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard,
  StatusBar,
  Alert,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, Lock, User, Check, X, AlertCircle, Hash, Sparkles } from "lucide-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import AuthButton from "../components/auth/AuthButton";
import { supabase } from "../../../../supabaseClient";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const VIT_DOMAIN = "@vitbhopal.ac.in";

// ---------------------------------------------------------------------------
// Floating Background Particle
// ---------------------------------------------------------------------------
const FloatingParticle: React.FC<{ delay: number; index: number }> = ({ delay, index }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const startX = Math.random() * SCREEN_WIDTH;
    const endX = startX + (Math.random() - 0.5) * 100;
    const duration = 8000 + Math.random() * 4000;

    translateX.setValue(startX);

    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: endX,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const size = 4 + Math.random() * 6;

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          width: size,
          height: size,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
};

// ---------------------------------------------------------------------------
// Password Strength Indicator (with rainbow shimmer on Strong)
// ---------------------------------------------------------------------------
const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const strength = getPasswordStrength(password);
  const barAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    barAnims.forEach((anim, index) => {
      if (index < strength) {
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(anim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
      }
    });

    // Rainbow shimmer when Strong (strength === 4)
    if (strength === 4) {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    } else {
      shimmerAnim.setValue(0);
    }
  }, [strength]);

  if (!password) return null;

  const strengthColors = ["#EF4444", "#F59E0B", "#EAB308", "#10B981"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const currentColor = strengthColors[strength - 1] || "#94A3B8";
  const currentLabel = strengthLabels[strength - 1] || "";

  const shimmerColor = shimmerAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"],
  });

  return (
    <View style={styles.strengthMeter}>
      <View style={styles.strengthBars}>
        {barAnims.map((anim, i) => {
          const backgroundColor = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["#E2E8F0", strengthColors[i]],
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.strengthBar,
                {
                  backgroundColor,
                  transform: [
                    {
                      scaleX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
      <Animated.Text
        style={[
          styles.strengthLabel,
          {
            color: strength === 4 ? shimmerColor : currentColor,
          },
        ]}
      >
        {currentLabel}
        {strength === 4 && " ✨"}
      </Animated.Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Password Match Indicator
// ---------------------------------------------------------------------------
const PasswordMatchIndicator: React.FC<{
  password: string;
  confirmPassword: string;
}> = ({ password, confirmPassword }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsDontMatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (passwordsMatch || passwordsDontMatch) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse on match
      if (passwordsMatch) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [passwordsMatch, passwordsDontMatch]);

  if (!confirmPassword) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.matchIndicator,
        {
          backgroundColor: passwordsMatch ? "#DCFCE7" : "#FEE2E2",
          borderColor: passwordsMatch ? "#10B981" : "#EF4444",
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }, { rotate }],
        },
      ]}
    >
      {passwordsMatch ? (
        <Check size={16} color="#10B981" strokeWidth={3} />
      ) : (
        <X size={16} color="#EF4444" strokeWidth={3} />
      )}
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Field Validation Checkmark (with micro-bounce)
// ---------------------------------------------------------------------------
const FieldCheckmark: React.FC<{ isValid: boolean }> = ({ isValid }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isValid) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1.2,
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      bounceAnim.setValue(1);
    }
  }, [isValid]);

  if (!isValid) return null;

  return (
    <Animated.View
      style={[
        styles.fieldCheckmark,
        { transform: [{ scale: Animated.multiply(scaleAnim, bounceAnim) }] },
      ]}
    >
      <Check size={14} color="#10B981" strokeWidth={3} />
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Inline Error Message
// ---------------------------------------------------------------------------
const InlineError: React.FC<{ message?: string }> = ({ message }) => {
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Micro shake on appear
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(-10);
      opacityAnim.setValue(0);
    }
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.inlineError,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
        },
      ]}
    >
      <AlertCircle size={14} color="#EF4444" />
      <Text style={styles.inlineErrorText}>{message}</Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Progress Indicator (with shimmer gradient)
// ---------------------------------------------------------------------------
const ProgressIndicator: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: completed / total,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [completed]);

  const backgroundColor = widthAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#F59E0B", "#EAB308", "#10B981"],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressShimmer,
              {
                opacity: shimmerOpacity,
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 300],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </View>
      <Text style={styles.progressText}>
        {completed} of {total} fields complete
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Confetti Particle
// ---------------------------------------------------------------------------
const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 100;
    const randomRotation = Math.random() * 720 - 360;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT * 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: randomX,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: randomRotation,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          delay: 1500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          backgroundColor: color,
          opacity,
          transform: [
            { translateY },
            { translateX },
            {
              rotate: rotate.interpolate({
                inputRange: [-360, 360],
                outputRange: ["-360deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    />
  );
};

// ---------------------------------------------------------------------------
// Registration Number Field (slides down)
// ---------------------------------------------------------------------------
const AnimatedRegNoField: React.FC<{
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isValid: boolean;
}> = ({ visible, value, onChangeText, error, isValid }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(heightAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false, // Changed to false to match heightAnim
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false, // Changed to false to match heightAnim
        }),
      ]).start();
    }
  }, [visible]);

  const animatedMaxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 88],
  });

  return (
    <Animated.View
      style={[
        styles.fieldContainer,
        {
          maxHeight: animatedMaxHeight, // Changed from height to maxHeight
          opacity: opacityAnim,
          overflow: "hidden",
        },
      ]}
    >
      <AuthInput
        placeholder="Registration Number (e.g., 12BCE10321)"
        value={value}
        onChangeText={onChangeText}
        icon={<Hash size={20} color="#64748B" />}
        style={[styles.inputStyle, error && styles.inputError]}
        keyboardType="default"
        autoCapitalize="characters"
      />
      {isValid && <FieldCheckmark isValid={true} />}
      <InlineError message={error} />
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Main SignUp Screen
// ---------------------------------------------------------------------------
const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const [nameError, setNameError] = useState("");
  const [regNoError, setRegNoError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const ctaPulseAnim = useRef(new Animated.Value(1)).current;

  const getGeneratedEmail = () => {
    const firstName = name.trim().split(" ")[0].toLowerCase();
    const regNumber = regNo.trim().toLowerCase();

    if (!firstName) return "yourname@vitbhopal.ac.in";
    if (!regNumber) return `${firstName}@vitbhopal.ac.in`;
    return `${firstName}.${regNumber}@vitbhopal.ac.in`;
  };

  const getFullEmail = () => getGeneratedEmail();

  const isNameValid = name.trim().length >= 2;
  const isRegNoValid = regNo.trim().length >= 5;
  const passwordStrength = getPasswordStrength(password);
  const isPasswordValid = password.length >= 6 && passwordStrength >= 2;
  const isConfirmValid = confirmPassword.length > 0 && password === confirmPassword;

  const completedFields = [
    isNameValid,
    isRegNoValid,
    isPasswordValid,
    isConfirmValid,
  ].filter(Boolean).length;

  const showRegNoField = name.trim().length >= 2;
  const allFieldsComplete = completedFields === 4;

  // ── Entrance animations ──────────────────────────────────────────────
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Rotating gradient on logo
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: any) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(keyboardOffsetAnim, {
          toValue: -SCREEN_HEIGHT * 0.15,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        Animated.timing(keyboardOffsetAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // ── CTA pulse when all fields complete ───────────────────────────────
  useEffect(() => {
    if (allFieldsComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ctaPulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ctaPulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      ctaPulseAnim.setValue(1);
    }
  }, [allFieldsComplete]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSignUp = async () => {
    setNameError("");
    setRegNoError("");
    setPasswordError("");
    setConfirmError("");

    let hasError = false;

    if (!name.trim() || name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      hasError = true;
    }

    if (!regNo.trim() || regNo.trim().length < 5) {
      setRegNoError("Registration number must be at least 5 characters");
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else if (passwordStrength < 2) {
      setPasswordError("Password is too weak. Add uppercase, numbers, or symbols.");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your password");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      hasError = true;
    }

    if (hasError) {
      triggerShake();
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: getFullEmail(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          registration_number: regNo.trim().toUpperCase(),
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Signup error", error.message);
      triggerShake();
      return;
    }

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);

    Alert.alert("Success", "Account created successfully! 🎉", [
      {
        text: "Continue",
        onPress: () =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          }),
      },
    ]);
  };

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient colors={["#4A6D8C", "#6B8CAE"]} style={styles.screen}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* Floating particles background */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {Array.from({ length: 15 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 400} index={i} />
        ))}
      </View>

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 50} />
          ))}
        </View>
      )}

      <View style={styles.headerWrapper}>
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: logoOpacityAnim, transform: [{ scale: logoScaleAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.logoBadge,
              { transform: [{ rotate: logoRotate }] },
            ]}
          >
            <MaterialCommunityIcons name="school" size={40} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.appName}>Vconnect</Text>
          <Text style={styles.tagline}>Connect with VITians</Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.cardWrapper,
          { transform: [{ translateY: Animated.add(slideAnim, keyboardOffsetAnim) }] },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.cardScroll,
              keyboardHeight > 0 && { paddingBottom: keyboardHeight + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            <ProgressIndicator completed={completedFields} total={4} />

            <View style={styles.fieldContainer}>
              <AuthInput
                placeholder="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError("");
                }}
                icon={<User size={20} color="#64748B" />}
                style={[styles.inputStyle, nameError && styles.inputError]}
              />
              {isNameValid && <FieldCheckmark isValid={true} />}
              <InlineError message={nameError} />
            </View>

            <AnimatedRegNoField
              visible={showRegNoField}
              value={regNo}
              onChangeText={(text) => {
                setRegNo(text);
                if (regNoError) setRegNoError("");
              }}
              error={regNoError}
              isValid={isRegNoValid}
            />

            <View style={styles.emailPreviewContainer}>
              <Mail size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.emailPreviewLabel}>Your email will be:</Text>
              <Text style={styles.emailPreviewText}>{getGeneratedEmail()}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.passwordContainer}>
                <PasswordInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  icon={<Lock size={20} color="#64748B" />}
                  style={[styles.inputStyle, passwordError && styles.inputError]}
                />
                {isPasswordValid && <FieldCheckmark isValid={true} />}
                <PasswordStrengthMeter password={password} />
              </View>
              <InlineError message={passwordError} />
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.confirmPasswordContainer}>
                <PasswordInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmError) setConfirmError("");
                  }}
                  icon={<Lock size={20} color="#64748B" />}
                  style={[
                    styles.inputStyle,
                    {
                      marginBottom: 0,
                      borderColor: isConfirmValid
                        ? "#10B981"
                        : confirmPassword && password !== confirmPassword
                        ? "#EF4444"
                        : "#E2E8F0",
                      borderWidth: confirmPassword ? 2 : 1,
                    },
                    confirmError && styles.inputError,
                  ]}
                />
                <View style={styles.matchIndicatorWrapper}>
                  <PasswordMatchIndicator password={password} confirmPassword={confirmPassword} />
                </View>
              </View>
              <InlineError message={confirmError} />
            </View>

            <Animated.View
              style={{
                transform: [{ translateX: shakeAnim }, { scale: ctaPulseAnim }],
                marginTop: 24,
              }}
            >
              <AuthButton
                title="Sign Up"
                onPress={handleSignUp}
                loading={loading}
                disabled={completedFields < 4}
              />
            </Animated.View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </LinearGradient>
  );
};

export default SignUpScreen;

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrapper: { flex: 0.35, justifyContent: "center", alignItems: "center", paddingTop: 30 },
  headerContent: { alignItems: "center" },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: { fontSize: 32, fontWeight: "800", color: "#FFFFFF" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  cardWrapper: {
    flex: 0.65,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cardScroll: { paddingHorizontal: 32, paddingTop: 40, paddingBottom: 32 },
  cardHeader: { marginBottom: 20, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: "#1E293B" },
  subtitle: { fontSize: 15, color: "#64748B", marginTop: 4 },
  progressContainer: { marginBottom: 20 },
  progressTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  progressText: { fontSize: 12, color: "#64748B", textAlign: "center", fontWeight: "600" },
  fieldContainer: { position: "relative", marginBottom: 16 },
  inputStyle: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16 },
  inputError: { borderColor: "#EF4444", borderWidth: 2 },
  fieldCheckmark: {
    position: "absolute",
    right: 16,
    top: 18,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  inlineError: { flexDirection: "row", alignItems: "center", marginTop: 6, marginLeft: 4, gap: 6 },
  inlineErrorText: { fontSize: 12, color: "#EF4444", fontWeight: "500" },
  emailPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  emailPreviewLabel: { fontSize: 12, color: "#64748B", marginRight: 6 },
  emailPreviewText: { fontSize: 13, color: "#1E40AF", fontWeight: "700", flex: 1 },
  passwordContainer: { position: "relative" },
  strengthMeter: { marginTop: 8 },
  strengthBars: { flexDirection: "row", gap: 6, marginBottom: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" },
  strengthLabel: { fontSize: 12, fontWeight: "600", textAlign: "right" },
  confirmPasswordContainer: { position: "relative" },
  matchIndicatorWrapper: { position: "absolute", right: 16, top: 18, zIndex: 10 },
  matchIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingParticle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: "center",
  },
  confettiParticle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: SCREEN_HEIGHT * 0.3,
  },
  loginContainer: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  loginText: { fontSize: 14, color: "#64748B" },
  loginLink: { fontSize: 14, color: "#4A6D8C", fontWeight: "700" },
});