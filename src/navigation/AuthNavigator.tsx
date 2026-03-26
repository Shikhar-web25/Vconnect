import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/login/app/login';
import SignupScreen from '../screens/login/app/signup';
import ForgotPasswordScreen from '../screens/login/app/forgot-password';
import SplashScreen from '../screens/Splashscreen';
import BottomTabNavigator from './BottomTabNavigator';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  ChatDetail: { chatId: string; name: string; avatar: any };
  UserProfile: { name: string; avatar: any; batch?: string; about?: string; bio?: string; contributions?: number };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
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
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: true, headerTransparent: true, title: '', headerTintColor: '#FFFFFF' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: true, headerTransparent: true, title: '', headerTintColor: '#FFFFFF' }}
          />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;