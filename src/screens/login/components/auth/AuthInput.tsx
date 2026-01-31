import React, { useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  TextInputProps,
  Text,
} from "react-native";
import { Colors } from "../../constants/colors";
interface AuthInputProps extends TextInputProps {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  style?: any; 
}
const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  rightIcon,
  error,
  style, 
  ...props
}) => {
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const handleFocus = () => {
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const handleBlur = () => {
    Animated.timing(borderColorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.auth.inputBorder, Colors.auth.inputFocus],
  });
  return (
    <View>
      <Animated.View
        style={[
          styles.container,
          { borderColor },
          error ? styles.errorBorder : null,
          style,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.auth.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </Animated.View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};
export default AuthInput;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.auth.white,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: Colors.auth.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.auth.textDark,
    fontWeight: "500",
  },
  rightIconContainer: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBorder: {
    borderColor: Colors.auth.error,
  },
  errorText: {
    color: Colors.auth.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});