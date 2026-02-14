import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { supabase } from "./supabaseClient";
import AuthNavigator from "./src/navigation/AuthNavigator";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen to auth state changes (Google OAuth or email login)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A6D8C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthNavigator isAuthenticated={!!session} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
