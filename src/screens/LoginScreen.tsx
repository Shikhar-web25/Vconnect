import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#5B86B3" />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="school"
              size={28}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.hello}>Hello!</Text>
          <Text style={styles.welcome}>Welcome Student</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.loginTitle}>Login</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#9AA4B2" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9AA4B2"
              style={styles.input}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#9AA4B2" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9AA4B2"
              secureTextEntry
              style={styles.input}
            />
          </View>
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.signupText}>
            New here? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default LoginScreen;
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#5B86B3",
  },
  container: {
    flex: 1,
    backgroundColor: "#5B86B3",
  },
  topSection: {
    flex: 0.42,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 32 : 0,
    justifyContent: "center",
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  hello: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  welcome: {
    fontSize: 16,
    color: "#E6EEF6",
    fontWeight: "400",
  },
  card: {
    flex: 0.58,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B1F44",
    marginBottom: 22,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F8FB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1F2937",
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgot: {
    fontSize: 13,
    color: "#4C74A6",
    fontWeight: "500",
  },
  loginButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#0B2D5C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupText: {
    textAlign: "center",
    fontSize: 13,
    color: "#9AA4B2",
  },
  signupLink: {
    color: "#4C74A6",
    fontWeight: "600",
  },
});