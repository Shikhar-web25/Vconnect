import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabaseClient';
import {
  fetchActivityNotifications,
  markAllSeenNow,
  type ActivityNotification,
} from '../lib/notifications';
import { useAppTheme } from '../theme/AppThemeContext';

const iconForType = (type: ActivityNotification['type']) => {
  if (type === 'message') return { name: 'chatbubble', color: '#3B82F6', bg: '#DBEAFE' };
  return { name: 'chatbox-ellipses', color: '#22C55E', bg: '#DCFCE7' };
};

const relativeTime = (isoDate?: string) => {
  if (!isoDate) return 'Just now';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useAppTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadNotifications = useCallback(
    async (targetUserId: string, showLoader = false) => {
      if (showLoader) setLoading(true);
      const list = await fetchActivityNotifications(targetUserId, 160);
      setNotifications(list);
      if (showLoader) setLoading(false);
    },
    [],
  );

  useEffect(() => {
    let active = true;
    let channel: any = null;

    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user?.id) {
        if (active) setLoading(false);
        return;
      }

      setUserId(user.id);
      await loadNotifications(user.id, true);

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          () => loadNotifications(user.id, false),
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'comments' },
          () => loadNotifications(user.id, false),
        )
        .subscribe();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    initialize();

    return () => {
      active = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fadeAnim, loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((item) => !item.read);
  }, [filter, notifications]);

  const markSingleRead = useCallback(async (item: ActivityNotification) => {
    if (item.read) return;
    setNotifications((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, read: true } : row)),
    );

    if (item.type === 'message') {
      await supabase.from('messages').update({ read_status: true }).eq('id', item.sourceId);
    }
  }, []);

  const markEverythingRead = useCallback(async () => {
    if (!userId) return;
    await Promise.all([
      supabase
        .from('messages')
        .update({ read_status: true })
        .eq('receiver_id', userId)
        .eq('read_status', false),
      markAllSeenNow(userId),
    ]);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, [userId]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
          {unreadCount > 0 ? (
            <View style={[styles.countBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.countText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity
            style={[styles.markAllBtn, { backgroundColor: theme.surface }]}
            onPress={markEverythingRead}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={22} color={theme.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'unread'] as const).map((tab) => {
          const active = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                { backgroundColor: theme.surface },
                active && { backgroundColor: theme.primary },
              ]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                {tab === 'all' ? 'All' : 'Unread'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const icon = iconForType(item.type);
              return (
                <TouchableOpacity
                  style={[
                    styles.notifItem,
                    { backgroundColor: theme.surface },
                    !item.read && {
                      borderLeftColor: theme.primary,
                      borderLeftWidth: 3,
                      backgroundColor: isDark ? '#12203A' : '#F0F4FF',
                    },
                  ]}
                  onPress={() => markSingleRead(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: item.actorAvatar }} style={styles.avatar} />
                    <View style={[styles.iconBadge, { backgroundColor: icon.bg }]}>
                      <Ionicons name={icon.name as any} size={12} color={icon.color} />
                    </View>
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifText, { color: theme.text }]}>
                      <Text style={styles.userName}>{item.actorName}</Text> {item.content}
                    </Text>
                    {item.postTitle ? (
                      <Text style={[styles.postTitle, { color: theme.primary }]} numberOfLines={1}>
                        "{item.postTitle}"
                      </Text>
                    ) : null}
                    {item.preview ? (
                      <Text style={[styles.previewText, { color: theme.textMuted }]} numberOfLines={1}>
                        {item.preview}
                      </Text>
                    ) : null}
                    <Text style={[styles.timeText, { color: theme.textMuted }]}>
                      {relativeTime(item.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
                  <Ionicons name="notifications-off-outline" size={44} color={theme.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No notifications</Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  {filter === 'unread' ? "You're all caught up." : 'No live notifications yet.'}
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  markAllBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userName: {
    fontWeight: '700',
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  previewText: {
    fontSize: 12,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NotificationScreen;
