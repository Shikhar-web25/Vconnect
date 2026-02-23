import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DiscoverScreen from "../screens/DiscoverScreen";
import AllSeniorsScreen from "../screens/AllSeniorsScreen";

// ── Stack Param List (for TypeScript safety) ──────────────────────────────────
export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  AllSeniors: undefined;
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

const DiscoverStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Discover Screen */}
      <Stack.Screen
        name="DiscoverMain"
        component={DiscoverScreen}
      />

      {/* All Seniors Screen — navigated via "View More" */}
      <Stack.Screen
        name="AllSeniors"
        component={AllSeniorsScreen}
        options={{
          headerShown: false, // AllSeniorsScreen has its own custom header
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
};

export default DiscoverStack;