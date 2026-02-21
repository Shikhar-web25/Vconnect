import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DiscoverScreen from "../screens/DiscoverScreen";
import AllSeniorsScreen from "../screens/AllSeniorsScreen";
import OpportunityDetailScreen from "../screens/OpportunityDetailScreen"; // optional

const Stack = createNativeStackNavigator();

const DiscoverStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DiscoverMain"
        component={DiscoverScreen}
      />

      <Stack.Screen
        name="AllSeniors"
        component={AllSeniorsScreen}
        options={{
          headerShown: true,
          title: "All Seniors",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="OpportunityDetail"
        component={OpportunityDetailScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
};

export default DiscoverStack;