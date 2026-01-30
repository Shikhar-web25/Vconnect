import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Colors } from "../../constants/colors";
interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}
const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  const isDisabled = disabled || loading;
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          variant === "secondary" && styles.buttonSecondary,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color={Colors.auth.white} />
        ) : (
          <Text
            style={[
              styles.buttonText,
              variant === "secondary" && styles.buttonTextSecondary,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
export default AuthButton;
const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.auth.buttonPrimary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.auth.buttonPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDisabled: {
    backgroundColor: Colors.auth.buttonDisabled,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: Colors.auth.white,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonTextSecondary: {
    color: Colors.auth.buttonPrimary,
  },
});