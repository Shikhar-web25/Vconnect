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
  StatusBar,
  TextInput,
  Linking,
  ActivityIndicator,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, Lock, Check, Sparkles } from "lucide-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import InAppBrowser from "react-native-inappbrowser-reborn";

import PasswordInput from "../components/auth/PasswordInput";
import AuthButton from "../components/auth/AuthButton";
import { supabase } from "../../../../supabaseClient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DOMAIN_TEXT = "vitbhopal.ac.in";
const VIT_DOMAIN = "@vitbhopal.ac.in";

const normalizeUsernameFromEmail = (email?: string | null) => {
  if (!email) return null;
  const local = email.split("@")[0] ?? "";
  const sanitized = local.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 40);
  return sanitized || null;
};

const extractRegistrationNumberFromEmail = (email?: string | null) => {
  if (!email) return null;
  const local = (email.split("@")[0] ?? "").toLowerCase();
  const pattern = local.match(/[0-9]{2}[a-z]{3}[0-9]{5}/i);
  if (pattern?.[0]) return pattern[0].toUpperCase();
  const segments = local.split(".");
  if (segments.length > 1) {
    return segments[segments.length - 1].replace(/[^a-z0-9]/gi, "").toUpperCase() || null;
  }
  return null;
};

const upsertProfileFromAuthUser = async (user: any) => {
  if (!user?.id) return;

  const normalizedEmail = (user.email ?? "").toLowerCase();
  const metadata = user.user_metadata ?? {};
  const basePayload: Record<string, any> = {
    id: user.id,
    email: normalizedEmail || null,
    full_name: metadata.full_name ?? metadata.name ?? null,
    username:
      normalizeUsernameFromEmail(normalizedEmail) ??
      `student_${String(user.id).replace(/-/g, "").slice(0, 8)}`,
    registration_number:
      extractRegistrationNumberFromEmail(normalizedEmail) ??
      extractRegistrationNumberFromEmail(metadata.email) ??
      null,
    avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
  };

  const candidates: Array<Record<string, any>> = [
    { ...basePayload },
    (() => {
      const clone = { ...basePayload };
      delete clone.registration_number;
      return clone;
    })(),
    (() => {
      const clone = { ...basePayload };
      delete clone.registration_number;
      delete clone.avatar_url;
      return clone;
    })(),
    { id: user.id, email: normalizedEmail || null },
  ];

  let lastError: any = null;
  for (const payload of candidates) {
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (!error) return;
    lastError = error;
  }

  if (lastError) {
    throw new Error(lastError.message);
  }
};

// ---------------------------------------------------------------------------
// Floating Background Particle
// ---------------------------------------------------------------------------
const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const startX = Math.random() * SCREEN_WIDTH;
    const endX = startX + (Math.random() - 0.5) * 80;
    const duration = 8000 + Math.random() * 4000;

    translateX.setValue(startX);

    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.2,
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
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const size = 3 + Math.random() * 5;

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
// Animated Domain Badge (with sparkle effect)
// ---------------------------------------------------------------------------
const DomainBadge: React.FC<{ visible: boolean; typedDomain: string }> = ({
  visible,
  typedDomain,
}) => {
  const slideX = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Sparkle effect after slide-in
        Animated.sequence([
          Animated.parallel([
            Animated.spring(sparkleScale, {
              toValue: 1.2,
              friction: 3,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.spring(sparkleScale, {
              toValue: 0,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    } else {
      slideX.setValue(100);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.domainBadgeContainer,
        {
          opacity,
          transform: [{ translateX: slideX }],
        },
      ]}
    >
      <View style={styles.domainBadge}>
        <Text style={styles.domainAt}>@</Text>
        <Text style={styles.domainText}>{typedDomain}</Text>
      </View>
      <Animated.View
        style={[
          styles.sparkle,
          {
            opacity: sparkleOpacity,
            transform: [{ scale: sparkleScale }],
          },
        ]}
      >
        <Sparkles size={16} color="#F59E0B" />
      </Animated.View>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Success Checkmark with Ripple
// ---------------------------------------------------------------------------
const SuccessCheckmark: React.FC<{ visible: boolean }> = ({ visible }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Ripple effect
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(rippleScale, {
              toValue: 2,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(500),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.successCheckmarkContainer}>
      <Animated.View
        style={[
          styles.successRipple,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.successCheckmark,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        <Check size={32} color="#10B981" strokeWidth={3} />
      </Animated.View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Animated Google Button (with shimmer)
// ---------------------------------------------------------------------------
const AnimatedGoogleButton = ({
  onPress,
  loading,
  animDelay = 0,
}: {
  onPress: () => void;
  loading: boolean;
  animDelay?: number;
}) => {
  const widthAnim = useRef(new Animated.Value(60)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.sequence([
        Animated.spring(widthAnim, {
          toValue: SCREEN_WIDTH - 48,
          friction: 6,
          tension: 40,
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start();
    }, animDelay);

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_WIDTH],
  });

  return (
    <Animated.View
      style={[
        styles.googleOuterShell,
        { width: widthAnim, transform: [{ scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.googleInnerRow}
        onPress={onPress}
        activeOpacity={0.9}
        disabled={loading}
      >
        <Animated.View
          style={[
            styles.googleShimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />
        <View style={styles.googleIconBubble}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialCommunityIcons name="google" size={22} color="#fff" />
          )}
        </View>

        <Animated.Text style={[styles.googleLabel, { opacity: textOpacity }]}>
          Continue with Google
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Main Login Screen
// ---------------------------------------------------------------------------
const LoginScreen = () => {
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [typedDomain, setTypedDomain] = useState("");
  const [showDomainBadge, setShowDomainBadge] = useState(false);
  const typingRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [emailFocused, setEmailFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorPulse = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const emailGlowAnim = useRef(new Animated.Value(0)).current;
  const ctaPulseAnim = useRef(new Animated.Value(1)).current;

  const getFullEmail = () => `${username.trim()}${VIT_DOMAIN}`;

  const canSignIn = username.trim().length > 0 && password.length > 0;

  // ── Logo rotation (disabled) ─────────────────────────────────────────

  // ── Email glow on focus ──────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(emailGlowAnim, {
      toValue: emailFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [emailFocused]);

  // ── CTA pulse when ready ─────────────────────────────────────────────
  useEffect(() => {
    if (canSignIn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ctaPulseAnim, {
            toValue: 1.03,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ctaPulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      ctaPulseAnim.setValue(1);
    }
  }, [canSignIn]);

  // ── Shake animation ──────────────────────────────────────────────────
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Domain typing animation ──────────────────────────────────────────
  const startDomainTyping = () => {
    if (typingRef.current) return;
    let i = 0;
    setTypedDomain("");
    setShowDomainBadge(true);

    typingRef.current = setInterval(() => {
      i++;
      setTypedDomain(DOMAIN_TEXT.slice(0, i));
      if (i >= DOMAIN_TEXT.length) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
    }, 35);
  };

  const stopDomainTyping = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    setTypedDomain("");
    setShowDomainBadge(false);
  };

  // ── Error animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(errorPulse, { toValue: 1.05, duration: 100, useNativeDriver: true }),
          Animated.timing(errorPulse, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      errorOpacity.setValue(0);
      errorPulse.setValue(1);
    }
  }, [error]);

  useEffect(() => {
    if (successMsg) {
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      successOpacity.setValue(0);
    }
  }, [successMsg]);

  const getTokensFromUrl = (url: string) => {
    const hash = url.split("#")[1];
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return null;
    return { access_token, refresh_token };
  };

  const handleAuthCallback = async (url: string) => {
    if (!url.includes("auth-callback")) return;

    const tokens = getTokensFromUrl(url);
    if (tokens) {
      const { error: setSessionError } = await supabase.auth.setSession(tokens);
      if (setSessionError) {
        setError("Login failed. Please try again.");
        shake();
        return;
      }
    }

    const { data } = await supabase.auth.getUser();
    const email = (data.user?.email || "").toLowerCase();

    if (!email.endsWith(VIT_DOMAIN)) {
      await supabase.auth.signOut();
      setError("Only VIT Bhopal emails allowed");
      shake();
      return;
    }

    try {
      await upsertProfileFromAuthUser(data.user);
    } catch (profileError: any) {
      setError(profileError?.message ?? "Could not sync your profile.");
      shake();
      return;
    }

    setSuccessMsg("Login successful");

    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }, 600);
  };

  // ── Google Login ─────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "vconnect://auth-callback",
        skipBrowserRedirect: true,
        queryParams: {
          prompt: "select_account",
          hd: "vitbhopal.ac.in",
        },
        scopes: "email profile",
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
      shake();
      return;
    }

    if (data?.url) {
      const inApp = await InAppBrowser.isAvailable();
      if (inApp) {
        const result = await InAppBrowser.openAuth(data.url, "vconnect://auth-callback", {
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          ephemeralWebSession: false,
          forceCloseOnRedirection: true,
        });
        if (result.type === "success" && result.url) {
          await handleAuthCallback(result.url);
        }
      } else {
        await Linking.openURL(data.url);
      }
    }

    setGoogleLoading(false);
  };

  // ── OAuth Return Handler ─────────────────────────────────────────────
  useEffect(() => {
    const handleIncomingUrl = async (url?: string | null) => {
      if (!url) return;
      await handleAuthCallback(url);
    };

    Linking.getInitialURL()
      .then(handleIncomingUrl)
      .catch((err) => {
        console.warn("Initial OAuth URL read failed:", err);
      });

    const sub = Linking.addEventListener("url", async ({ url }) => {
      await handleIncomingUrl(url);
    });

    return () => sub.remove();
  }, []);

  // ── Email Login ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError("Enter email and password");
      shake();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: getFullEmail(),
      password,
    });

    if (error) {
      setError(error.message);
      shake();
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      await upsertProfileFromAuthUser(user);
    } catch (profileError: any) {
      setError(profileError?.message ?? "Could not sync your profile.");
      shake();
      setLoading(false);
      return;
    }

    setSuccessMsg("Login successful");

    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }, 600);

    setLoading(false);
  };

  const handleUsernameChange = (text: string) => {
    if (text.includes("@")) {
      const clean = text.split("@")[0];
      setUsername(clean);
      if (!typedDomain) startDomainTyping();
    } else {
      setUsername(text);
      stopDomainTyping();
    }
  };

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const emailBorderColor = emailGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8F0", "#3B82F6"],
  });

  const emailGlowOpacity = emailGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <LinearGradient colors={["#4A6D8C", "#6B8CAE"]} style={styles.screen}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* Floating particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 500} />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.cardScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <View style={styles.headerSection}>
              <Animated.View
                style={[
                  styles.logoBadge,
                  { transform: [{ rotate: logoRotate }] },
                ]}
              >
                <MaterialCommunityIcons name="school" size={36} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            {/* Error message with pulse */}
            {error && (
              <Animated.View
                style={[
                  styles.errorBanner,
                  {
                    opacity: errorOpacity,
                    transform: [{ scale: errorPulse }],
                  },
                ]}
              >
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Success message with ripple checkmark */}
            {successMsg && (
              <Animated.View
                style={[styles.successBanner, { opacity: successOpacity }]}
              >
                <SuccessCheckmark visible={true} />
                <Text style={styles.successText}>{successMsg}</Text>
              </Animated.View>
            )}

            {/* Email input with glow on focus */}
            <View style={styles.emailContainer}>
              <Animated.View
                style={[
                  styles.emailGlow,
                  {
                    opacity: emailGlowOpacity,
                    shadowColor: "#3B82F6",
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.emailRow,
                  {
                    borderColor: emailBorderColor,
                  },
                ]}
              >
                <Mail size={20} color="#64748B" style={styles.emailIcon} />

                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#94A3B8"
                  value={username}
                  onChangeText={handleUsernameChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />

                <DomainBadge visible={showDomainBadge} typedDomain={typedDomain} />
              </Animated.View>
            </View>

            <PasswordInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              icon={<Lock size={20} color="#64748B" />}
              style={styles.passwordInput}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View
              style={{
                marginTop: 24,
                transform: [{ scale: ctaPulseAnim }],
              }}
            >
              <AuthButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={!canSignIn}
              />
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <AnimatedGoogleButton
              onPress={handleGoogleLogin}
              loading={googleLoading}
              animDelay={400}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },

  cardScroll: {
    paddingHorizontal: 24,
    paddingTop: SCREEN_HEIGHT * 0.15,
    paddingBottom: 40,
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

  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },

  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  successBanner: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#6EE7B7",
    flexDirection: "row",
    alignItems: "center",
  },

  successText: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },

  successCheckmarkContainer: {
    position: "relative",
  },

  successRipple: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B981",
    top: -16,
    left: -16,
  },

  successCheckmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },

  emailContainer: {
    marginBottom: 16,
    position: "relative",
  },

  emailGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
    borderWidth: 1.5,
  },

  emailIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    minWidth: 0,
  },

  domainBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  domainBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  domainAt: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4A6D8C",
  },

  domainText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },

  sparkle: {
    position: "absolute",
    top: -12,
    right: -12,
  },

  passwordInput: {
    marginBottom: 0,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 12,
  },

  forgotText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  dividerText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    marginHorizontal: 12,
  },

  googleOuterShell: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#DB4437",
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  googleInnerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 52,
    overflow: "hidden",
  },

  googleShimmer: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 100,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  googleIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  googleLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 12,
    fontSize: 15,
    letterSpacing: 0.3,
    zIndex: 1,
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  signupText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },

  signupLink: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
