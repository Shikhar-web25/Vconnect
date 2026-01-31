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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, Lock } from "lucide-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import AuthButton from "../components/auth/AuthButton";
import { Colors } from "../constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

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
      ])
    ]).start();

    const keyboardWillShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
      Animated.timing(keyboardOffsetAnim, {
        toValue: -SCREEN_HEIGHT * 0.15,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
      Animated.timing(keyboardOffsetAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      console.log("Login success - navigating to Main");
      navigation.navigate("Main");
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4A6D8C', '#6B8CAE']} style={styles.screen}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      <View style={styles.headerWrapper}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: logoOpacityAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="school" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>Vconnect</Text>
          <Text style={styles.tagline}>Connect with VITians</Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.cardWrapper,
          {
            transform: [{
              translateY: Animated.add(slideAnim, keyboardOffsetAnim)
            }]
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.cardScroll,
              keyboardHeight > 0 && { paddingBottom: keyboardHeight + 20 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.form}>
              {errors.general && (
                <View style={styles.generalErrorContainer}>
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                </View>
              )}

              <AuthInput
                placeholder="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={20} color="#64748B" />}
                style={styles.inputStyle}
                error={errors.email}
              />
              <PasswordInput
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                icon={<Lock size={20} color="#64748B" />}
                style={styles.inputStyle}
                error={errors.password}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotButton}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <AuthButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
                textStyle={styles.loginBtnText}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Signup")}
                  activeOpacity={0.7}
                >
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerWrapper: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  headerContent: {
    alignItems: "center",
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  cardWrapper: {
    flex: 0.6,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden', // Ensures shadow doesn't clip awkwardly
  },
  cardScroll: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 32,
  },
  cardHeader: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B", // Dark Slate
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B", // Slate
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputStyle: {
    backgroundColor: "#F8FAFC", // Light Slate
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: "#4A6D8C",
    fontWeight: "700",
  },
  loginBtn: {
    backgroundColor: "#0F172A", // Brand Dark
    borderRadius: 20,
    height: 56,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
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
  generalErrorContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  generalErrorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});