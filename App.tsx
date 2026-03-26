import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Animated, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { supabase } from "./supabaseClient";
import AuthNavigator from "./src/navigation/AuthNavigator";
import { installGlobalErrorHandler, logClientError } from "./src/lib/errorMonitor";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dmBanner, setDmBanner] = useState<{ senderName: string; preview: string } | null>(null);
  const bannerY = useRef(new Animated.Value(-90)).current;

  useEffect(() => {
    const removeGlobalHandler = installGlobalErrorHandler();
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Failed to restore session:", error.message);
          logClientError("auth", error, { operation: "getSession" });
        }
        if (isMounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.warn("Failed to restore session:", error);
        logClientError("auth", error, { operation: "getSession" });
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
      removeGlobalHandler();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id as string;
    const channel = supabase
      .channel(`app-dm-banner-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
        async (payload: any) => {
          const row = payload?.new;
          if (!row || row.sender_id === userId) return;

          let senderName = "New message";
          try {
            const { data } = await supabase
              .from("profiles")
              .select("full_name, username")
              .eq("id", row.sender_id)
              .single();
            senderName = data?.full_name ?? data?.username ?? senderName;
          } catch {
            // Keep fallback sender name.
          }

          const preview = (row.message_text ?? "").trim() || "Sent you a message";
          setDmBanner({ senderName, preview });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!dmBanner) return;

    bannerY.setValue(-90);
    const animation = Animated.sequence([
      Animated.timing(bannerY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.delay(3200),
      Animated.timing(bannerY, {
        toValue: -90,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setDmBanner(null);
      }
    });

    return () => animation.stop();
  }, [bannerY, dmBanner]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A6D8C" />
      </View>
    );
  }

  return (
    <View style={styles.appRoot}>
      <NavigationContainer>
        <AuthNavigator isAuthenticated={!!session} />
      </NavigationContainer>
      {dmBanner ? (
        <Animated.View style={[styles.dmBanner, { transform: [{ translateY: bannerY }] }]}>
          <TouchableOpacity activeOpacity={0.92} onPress={() => setDmBanner(null)}>
            <Text style={styles.dmBannerTitle}>{dmBanner.senderName}</Text>
            <Text style={styles.dmBannerBody} numberOfLines={1}>
              {dmBanner.preview}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dmBanner: {
    position: "absolute",
    top: 48,
    left: 14,
    right: 14,
    backgroundColor: "#1E1B4B",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 12,
  },
  dmBannerTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  dmBannerBody: {
    marginTop: 2,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
  },
});
