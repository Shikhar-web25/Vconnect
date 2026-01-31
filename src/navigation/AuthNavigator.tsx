import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/login/app/login';
import SignupScreen from '../screens/login/app/signup';
import ForgotPasswordScreen from '../screens/login/app/forgot-password';
import SplashScreen from '../screens/Splashscreen';
import BottomTabNavigator from './BottomTabNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  // TODO: Add authentication state logic here
  // For now, we'll always show login first
  const isAuthenticated = false;

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right'
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      ) : (
        <>
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Main" 
            component={BottomTabNavigator}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{ 
              headerShown: true,
              headerTransparent: true,
              title: '',
              headerTintColor: '#FFFFFF',
              gestureEnabled: true
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ 
              headerShown: true,
              headerTransparent: true,
              title: '',
              headerTintColor: '#FFFFFF',
              gestureEnabled: true
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
