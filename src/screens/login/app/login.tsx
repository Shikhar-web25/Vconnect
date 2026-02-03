import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TextInput,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, Lock } from "lucide-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import * as Constants from "expo-constants";

import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import AuthButton from "../components/auth/AuthButton";
import { Colors } from "../constants/colors";
import { supabase } from "../../../../supabaseClient";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const VIT_DOMAIN = "@vitbhopal.ac.in";

// ---------------------------------------------------------------------------
// Animated Google Button  (scroll-unroll reveal)
// ---------------------------------------------------------------------------
// The button starts as a thin pill that "unrolls" horizontally to full width,
// then the text fades in once the pill is fully open.
const AnimatedGoogleButton: React.FC<{
  onPress: () => void;
  loading: boolean;
  animDelay?: number;
}> = ({ onPress, loading, animDelay = 0 }) => {
  // width animates from ~60 (icon-only pill) → full container width
  const widthAnim = useRef(new Animated.Value(60)).current;
  // text opacity fades in after the pill finishes opening
  const textOpacity = useRef(new Animated.Value(0)).current;
  // subtle scale-bounce on press
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.sequence([
        // 1) unroll the pill
        Animated.spring(widthAnim, {
          toValue: SCREEN_WIDTH - 48, // match parent padding
          friction: 6,
          tension: 40,
          useNativeDriver: false, // width cannot use native driver
        }),
        // 2) fade the label in
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, animDelay);

    return () => clearTimeout(timeout);
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.googleOuterShell, { width: widthAnim, transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        style={styles.googleInnerRow}
      >
        {/* Google G icon (always visible) */}
        <View style={styles.googleIconBubble}>
          <MaterialCommunityIcons name="google" size={22} color="#fff" />
        </View>

        {/* Label that fades in after unroll */}
        <Animated.Text style={[styles.googleLabel, { opacity: textOpacity }]}>
          {loading ? "Opening Google…" : "Continue with Google"}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Animated Domain Badge  (slides in from the right when '@' is typed)
// ---------------------------------------------------------------------------
const DomainBadge: React.FC<{ visible: boolean }> = ({ visible }) => {
  const slideX = useRef(new Animated.Value(SCREEN_WIDTH * 0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // a small "pop" scale
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideX, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      ]).start();
    }
    // We intentionally do NOT animate back out — once the domain appears it stays.
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.domainBadge,
        {
          translateX: slideX,
          opacity,
          transform: [{ translateX: slideX }, { scale }],
        },
      ]}
    >
      <Text style={styles.domainBadgeAt}>@</Text>
      <Text style={styles.domainBadgeText}>vitbhopal.ac.in</Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// LoginScreen
// ---------------------------------------------------------------------------
const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // ── state ──────────────────────────────────────────────────────────────
  // We only store the USERNAME part (before the @).  The domain is rendered
  // as a locked animated badge beside it.
  const [username, setUsername] = useState("");
  const [domainVisible, setDomainVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // ── entrance animations ──────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScaleAnim, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.timing(logoOpacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 90, delay: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
      ]),
    ]).start();

    const keyboardWillShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      Animated.timing(keyboardOffsetAnim, { toValue: -SCREEN_HEIGHT * 0.15, duration: 300, useNativeDriver: true }).start();
    };
    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      Animated.timing(keyboardOffsetAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    };

    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      keyboardWillShow
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      keyboardWillHide
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // ── handlers ─────────────────────────────────────────────────────────
  const handleUsernameChange = useCallback((text: string) => {
    // Strip out everything from '@' onward — user cannot type or paste a domain.
    const cleaned = text.split("@")[0];
    setUsername(cleaned);

    // The moment the raw input contains '@' we lock the domain badge open.
    if (text.includes("@") && !domainVisible) {
      setDomainVisible(true);
    }

    // Clear inline error while typing
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  }, [domainVisible, errors.email]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!username.trim()) newErrors.email = "Enter your username";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFullEmail = () => `${username.trim()}${VIT_DOMAIN}`;

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    const { error } = await supabase.auth.signInWithPassword({
      email: getFullEmail(),
      password,
    });
    if (error) setErrors({ general: error.message });
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Build a scheme-based redirect that works in both Expo dev and production.
      // expo-constants gives us the app scheme (e.g. "vconnect").
      // Fall back to the classic Expo dev tunnel URL if no scheme is configured.
      const scheme = Constants.expoConfig?.scheme ?? "exp";
      const redirectTo = `${scheme}://google-auth-callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) console.log("Google OAuth error:", error.message);
    } catch (err) {
      console.error("Google login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={["#4A6D8C", "#6B8CAE"]} style={styles.screen}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* ── Logo header ── */}
      <View style={styles.headerWrapper}>
        <Animated.View style={[styles.headerContent, { opacity: logoOpacityAnim, transform: [{ scale: logoScaleAnim }] }]}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="school" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>Vconnect</Text>
          <Text style={styles.tagline}>Connect with VITians</Text>
        </Animated.View>
      </View>

      {/* ── Sliding card ── */}
      <Animated.View style={[styles.cardWrapper, { transform: [{ translateY: Animated.add(slideAnim, keyboardOffsetAnim) }] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.cardScroll, keyboardHeight > 0 && { paddingBottom: keyboardHeight + 20 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.form}>
              {/* General / server error banner */}
              {errors.general && (
                <View style={styles.generalErrorContainer}>
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              )}

              {/* ── Email row: username input + animated domain badge ── */}
              <View style={styles.emailFieldWrapper}>
                <View style={[styles.emailInputRow, errors.email && styles.emailInputRowError]}>
                  <Mail size={20} color="#64748B" style={styles.emailIcon} />

                  {/* Username portion (editable) */}
                  <TextInput
                    style={styles.emailUsernameInput}
                    placeholder={domainVisible ? "" : "Email Address"}
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />

                  {/* Locked domain badge — slides in on first '@' */}
                  <DomainBadge visible={domainVisible} />
                </View>

                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>

              {/* ── Password ── */}
              <PasswordInput
                placeholder="Password"
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                icon={<Lock size={20} color="#64748B" />}
                style={styles.inputStyle}
                error={errors.password}
              />

              {/* Forgot password link */}
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign-in CTA */}
              <AuthButton title="Sign In" onPress={handleLogin} loading={loading} style={styles.loginBtn} textStyle={styles.loginBtnText} />

              {/* OR divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* ── Google button (scroll-unroll) ── */}
              <AnimatedGoogleButton onPress={handleGoogleLogin} loading={loading} animDelay={600} />

              {/* Sign-up link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </LinearGradient>
  );
};

export default LoginScreen;

// ---------------------------------------------------------------------------
// StyleSheet  (was completely missing from the uploaded file)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // ── screen / gradient ──
  screen: {
    flex: 1,
  },

  // ── logo / header ──
  headerWrapper: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },

  // ── sliding card ──
  cardWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // subtle shadow so the card feels lifted
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cardScroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },

  // ── card header ──
  cardHeader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  // ── form ──
  form: {},

  // ── general error ──
  generalErrorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  generalErrorText: {
    color: "#DC2626",
    fontSize: 13,
  },

  // ── email input row (username + domain badge) ──
  emailFieldWrapper: {
    marginBottom: 16,
  },
  emailInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    // clip the domain badge so it slides in cleanly
    overflow: "hidden",
  },
  emailInputRowError: {
    borderColor: "#F87171",
    backgroundColor: "#FEF2F2",
  },
  emailIcon: {
    marginRight: 10,
    flexShrink: 0,
  },
  emailUsernameInput: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    // make sure it doesn't push the badge off-screen
    minWidth: 0,
  },

  // ── domain badge ──
  domainBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A6D8C",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
    marginLeft: 2,
  },
  domainBadgeAt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 1,
  },
  domainBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },

  // field-level error text
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
  },

  // ── shared input style (passed down to AuthInput / PasswordInput) ──
  inputStyle: {
    marginBottom: 16,
  },

  // ── forgot password ──
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 13,
    color: "#4A6D8C",
    fontWeight: "600",
  },

  // ── primary sign-in button ──
  loginBtn: {
    backgroundColor: "#4A6D8C",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── OR divider ──
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
    marginHorizontal: 12,
  },

  // ── Google button shell (animated width) ──
  googleOuterShell: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#DB4437",
    overflow: "hidden",
    // centre it horizontally while it animates width
    alignSelf: "center",
    marginBottom: 20,
  },
  googleInnerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  googleIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  googleLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 10,
    letterSpacing: 0.3,
  },

  // ── sign-up footer ──
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  signupText: {
    fontSize: 14,
    color: "#64748B",
  },
  signupLink: {
    fontSize: 14,
    color: "#4A6D8C",
    fontWeight: "700",
  },
});