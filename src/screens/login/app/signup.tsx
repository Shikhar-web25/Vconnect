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
  const blueScaleAnim = useRef(new Animated.Value(0.85)).current;
  const blueOpacityAnim = useRef(new Animated.Value(0)).current;
  const blueSlideAnim = useRef(new Animated.Value(-30)).current;
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
      Animated.timing(blueSlideAnim, {
        toValue: 0,
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
              transform: [
                { scale: blueScaleAnim },
                { translateY: blueSlideAnim },
              ],
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
                  icon={<User size={22} color={Colors.auth.textGray} />}
                  style={{ marginBottom: 14 }}
                />
                <AuthInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon={<Mail size={22} color={Colors.auth.textGray} />}
                  style={{ marginBottom: 14 }}
                />
                <PasswordInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  icon={<Lock size={22} color={Colors.auth.textGray} />}
                  style={{ marginBottom: 14 }}
                />
                <PasswordInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon={<Lock size={22} color={Colors.auth.textGray} />}
                  style={{ marginBottom: 18 }}
                />
                <Text style={styles.termsText}>
                  By signing up, you agree to our{" "}
                  <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
                <View style={{ marginBottom: 22 }}>
                  <AuthButton
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
      </View>
    </View>
  );
};
export default SignUpScreen;
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
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.auth.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.auth.textGray,
  },
  form: {
    width: "100%",
  },
  termsText: {
    fontSize: 13,
    color: Colors.auth.textGray,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
    marginTop: 6,
    marginBottom: 18,
  },
  termsLink: {
    color: Colors.auth.buttonPrimary,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  loginText: {
    fontSize: 14,
    color: Colors.auth.textGray,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.auth.buttonPrimary,
    fontWeight: "600",
  },
});