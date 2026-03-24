import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { supabase } from "./supabaseClient";
import AuthNavigator from "./src/navigation/AuthNavigator";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Failed to restore session:", error.message);
        }
        if (isMounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.warn("Failed to restore session:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    // Listen to auth state changes (Google OAuth or email login)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
