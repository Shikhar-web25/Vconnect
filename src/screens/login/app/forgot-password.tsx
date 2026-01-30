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
import { Mail } from "lucide-react-native";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import { Colors } from "../constants/colors";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(140)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 18,
          stiffness: 120,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 120);
    const keyboardDidShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
    return () => {
      clearTimeout(timer);
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);
  const handleResetPassword = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Reset password for:", email);
    }, 2000);
  };
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#5483B3" />
      <View style={styles.headerWrapper}>
        <View style={styles.headerBase} />
        <View style={styles.headerTopShade} />
        <View style={styles.headerBottomShade} />
        <View style={styles.headerContent}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.appName}>Vconnect</Text>
          <Text style={styles.tagline}>Connect with VITians</Text>
        </View>
      </View>
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
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
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address and we'll send you instructions to
                    reset your password.
                  </Text>
                </View>
                <View style={styles.form}>
                  <AuthInput
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon={<Mail size={22} color={Colors.auth.textGray} />}
                    style={{ marginBottom: 18 }}
                  />
                  <View style={{ marginTop: 6 }}>
                    <AuthButton
                      title="Send Reset Link"
                      onPress={handleResetPassword}
                      loading={loading}
                    />
                  </View>
                  <View style={styles.secondaryAction}>
                    <Text style={styles.secondaryText}>
                      Remember your password?
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.secondaryLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.helpSection}>
                    <Text style={styles.helpTitle}>Need Help?</Text>
                    <Text style={styles.helpText}>
                      If you don't receive an email within 5 minutes, check your
                      spam folder or contact support.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
};
export default ForgotPasswordScreen;
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.auth.textGray,
    lineHeight: 22,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  secondaryAction: {
    marginTop: 24,
    marginBottom: 28,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 14,
    color: Colors.auth.textGray,
    marginBottom: 6,
  },
  secondaryLink: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.auth.secondary,
  },
  helpSection: {
    padding: 20,
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: "#B45309",
    lineHeight: 18,
  },
});