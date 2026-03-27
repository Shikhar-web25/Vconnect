import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import DmsScreen from '../screens/DmsScreen';
import DiscoverStack from "./DiscoverStack";

import ProfileScreen from '../screens/ProfileScreen';
import { useAppTheme } from '../theme/AppThemeContext';

const ACCENT = '#5B6AF0';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const { theme } = useAppTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'DMs') {
                        iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                    } else if (route.name === 'Discover') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    // You can return any component that you like here!
                    return <Ionicons name={iconName ?? ''} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.primary ?? ACCENT,
                tabBarInactiveTintColor: theme.tabInactive,
                tabBarStyle: {
                    backgroundColor: theme.tabBar,
                    borderTopColor: theme.border,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="DMs" component={DmsScreen} />
            <Tab.Screen name="Discover" component={DiscoverStack}  options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
