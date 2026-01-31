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
  const blueScaleAnim = useRef(new Animated.Value(0.85)).current;
  const blueOpacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(blueScaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(blueOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 9,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
    const keyboardDidShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
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
    setLoading(true);
    setErrors({});
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      console.log("Login bypassed - navigating to Main screen");
      navigation.navigate("Main");
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#5483B3" />
      <View style={styles.headerWrapper}>
        <View style={styles.headerBase} />
        <View style={styles.headerTopShade} />
        <View style={styles.headerBottomShade} />
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: blueOpacityAnim,
              transform: [{ scale: blueScaleAnim }],
            },
          ]}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.appName}>Vconnect</Text>
          <Text style={styles.tagline}>Connect with VITians</Text>
        </Animated.View>
      </View>
      <View style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={[
                styles.cardScroll,
                keyboardHeight > 0 && { paddingBottom: keyboardHeight + 20 }
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              automaticallyAdjustContentInsets={false}
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
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={22} color={Colors.auth.textGray} />}
                  error={errors.email}
                  style={{ marginBottom: 14 }}
                />
                <PasswordInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  icon={<Lock size={22} color={Colors.auth.textGray} />}
                  error={errors.password}
                  style={{ marginBottom: 12 }}
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
                />
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>
                    Don&apos;t have an account?{" "}
                  </Text>
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
      </View>
    </View>
  );
};
export default LoginScreen;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#5483B3",
  },
  headerWrapper: {
    height: SCREEN_HEIGHT * 0.4,
    position: "relative",
    backgroundColor: "#5483B3",
  },
  headerBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#5483B3",
  },
  headerTopShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  headerBottomShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  logoBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
  },
  logoIcon: {
    fontSize: 32,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  cardWrapper: {
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: "#5483B3",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  cardScroll: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  cardHeader: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.auth.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.auth.textGray,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.auth.buttonPrimary,
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
    backgroundColor: Colors.auth.inputBorder,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.auth.textGray,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  signupText: {
    fontSize: 14,
    color: Colors.auth.textGray,
  },
  signupLink: {
    fontSize: 14,
    color: Colors.auth.buttonPrimary,
    fontWeight: "600",
  },
  generalErrorContainer: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  generalErrorText: {
    color: Colors.auth.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});