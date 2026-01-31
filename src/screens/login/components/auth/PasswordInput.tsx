import React, { useState, useRef } from "react";
import { TouchableOpacity, Animated } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import AuthInput from "./AuthInput";
import { Colors } from "../../constants/colors";
interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  style?: any;
}
export default function PasswordInput({
  icon,
  style,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const toggleVisibility = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    setVisible((prev) => !prev);
  };
  return (
    <AuthInput
      {...props}
      style={style}
      secureTextEntry={!visible}
      icon={icon}
      rightIcon={
        <TouchableOpacity
          onPress={toggleVisibility}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={{ opacity: opacityAnim }}>
            {visible ? (
              <EyeOff size={22} color={Colors.auth.textGray} />
            ) : (
              <Eye size={22} color={Colors.auth.textGray} />
            )}
          </Animated.View>
        </TouchableOpacity>
      }
    />
  );
}