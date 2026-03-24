import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/login/app/login';
import SignupScreen from '../screens/login/app/signup';
import ForgotPasswordScreen from '../screens/login/app/forgot-password';
import SplashScreen from '../screens/SplashScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import AdminDashboard from '../screens/_admin/AdminDashboard';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  ChatDetail: { chatId: string; name: string; avatar: string };
  AdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = ({ isAuthenticated = false }: { isAuthenticated?: boolean }) => {

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right'
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{
              headerShown: true,
              title: 'Admin Dashboard'
            }}
          />
        </>
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
          <Stack.Screen
            name="ChatDetail"
            component={ChatDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{
              headerShown: true,
              title: 'Admin Dashboard'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
