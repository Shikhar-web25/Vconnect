import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import IndexScreen from "./index";
import LoginScreen from "./login";
import SignupScreen from "./signup";
import ForgotPasswordScreen from "./forgot-password";
const Stack = createNativeStackNavigator();
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          <Stack.Screen name="Index" component={IndexScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ animation: "slide_from_bottom" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
