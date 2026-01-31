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
import { Mail, Lock, User } from "lucide-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";

import AuthInput from "../components/auth/AuthInput";
import PasswordInput from "../components/auth/PasswordInput";
import AuthButton from "../components/auth/AuthButton";
import { Colors } from "../constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Sign Up:", { name, email, password });
    }, 2000);
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
            automaticallyAdjustContentInsets={false}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                icon={<User size={20} color="#64748B" />}
                style={styles.inputStyle}
              />
              <AuthInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail size={20} color="#64748B" />}
                style={styles.inputStyle}
              />
              <PasswordInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                icon={<Lock size={20} color="#64748B" />}
                style={styles.inputStyle}
              />
              <PasswordInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon={<Lock size={20} color="#64748B" />}
                style={[styles.inputStyle, { marginBottom: 24 }]}
              />

              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              <View style={{ marginBottom: 22 }}>
                <AuthButton
                  style={styles.signupBtn}
                  textStyle={styles.signupBtnText}
                  title="Sign Up"
                  onPress={handleSignUp}
                  loading={loading}
                />
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </LinearGradient>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerWrapper: {
    flex: 0.35,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
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
    fontSize: 32,
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
    flex: 0.65,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
  },
  cardScroll: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 32,
  },
  cardHeader: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputStyle: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
    marginTop: 0,
    marginBottom: 24,
  },
  termsLink: {
    color: "#4A6D8C",
    fontWeight: "600",
  },
  signupBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    height: 56,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  signupBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  loginText: {
    fontSize: 14,
    color: "#64748B",
  },
  loginLink: {
    fontSize: 14,
    color: "#4A6D8C",
    fontWeight: "700",
  },
});