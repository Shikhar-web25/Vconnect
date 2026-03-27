import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import AuthNavigator from './src/navigation/AuthNavigator';
import { installGlobalErrorHandler, logClientError } from './src/lib/errorMonitor';
import { AppThemeProvider, useAppTheme } from './src/theme/AppThemeContext';

function AppShell() {
  const { theme, navigationTheme } = useAppTheme();
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
          console.warn('Failed to restore session:', error.message);
          logClientError('auth', error, { operation: 'getSession' });
        }
        if (isMounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.warn('Failed to restore session:', error);
        logClientError('auth', error, { operation: 'getSession' });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
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
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
        async (payload: any) => {
          const row = payload?.new;
          if (!row || row.sender_id === userId) return;

          let senderName = 'New message';
          try {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', row.sender_id)
              .single();
            senderName = data?.full_name ?? data?.username ?? senderName;
          } catch {
            // Keep fallback sender name.
          }

          const preview = (row.message_text ?? '').trim() || 'Sent you a message';
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
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.appRoot, { backgroundColor: theme.background }]}>
      <NavigationContainer theme={navigationTheme}>
        <AuthNavigator isAuthenticated={!!session} />
      </NavigationContainer>
      {dmBanner ? (
        <Animated.View
          style={[
            styles.dmBanner,
            {
              transform: [{ translateY: bannerY }],
              backgroundColor: theme.heroStart,
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.92} onPress={() => setDmBanner(null)}>
            <Text style={[styles.dmBannerTitle, { color: theme.onPrimary }]}>{dmBanner.senderName}</Text>
            <Text style={[styles.dmBannerBody, { color: 'rgba(255,255,255,0.85)' }]} numberOfLines={1}>
              {dmBanner.preview}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <AppShell />
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dmBanner: {
    position: 'absolute',
    top: 48,
    left: 14,
    right: 14,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 12,
  },
  dmBannerTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  dmBannerBody: {
    marginTop: 2,
    fontSize: 13,
  },
});
