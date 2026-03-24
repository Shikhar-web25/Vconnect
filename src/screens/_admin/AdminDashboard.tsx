import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../../supabaseClient';
import { ADMIN_EMAIL, isAdminEmail } from '../../constants/admin';

type Props = NativeStackScreenProps<any>;
type AdminTab = 'overview' | 'users' | 'posts';

type OverviewStats = {
  totalUsers: number;
  mentorsAndAdmins: number;
  totalPosts: number;
  totalComments: number;
  newUsersThisWeek: number;
  newPostsThisWeek: number;
};

type AdminUser = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  branch?: string | null;
  year_of_study?: number | null;
  role_level?: number | null;
  created_at?: string | null;
};

type AdminPost = {
  id: string;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  user_id?: string | null;
  profile?: {
    id?: string | null;
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
};

const DEFAULT_STATS: OverviewStats = {
  totalUsers: 0,
  mentorsAndAdmins: 0,
  totalPosts: 0,
  totalComments: 0,
  newUsersThisWeek: 0,
  newPostsThisWeek: 0,
};

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'view-dashboard-outline' },
  { key: 'users', label: 'Students', icon: 'account-group-outline' },
  { key: 'posts', label: 'Posts', icon: 'post-outline' },
];

const formatDate = (value?: string | null) => {
  if (!value) return 'Unknown';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatYear = (year?: number | null) => {
  if (!year) return 'Year hidden';
  if (year === 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  return `${year}th Year`;
};

const getRoleMeta = (roleLevel?: number | null) => {
  if ((roleLevel ?? 0) >= 2) {
    return {
      label: 'Admin',
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      borderColor: '#FCA5A5',
    };
  }

  if ((roleLevel ?? 0) >= 1) {
    return {
      label: 'Mentor',
      backgroundColor: '#DCFCE7',
      color: '#166534',
      borderColor: '#86EFAC',
    };
  }

  return {
    label: 'Student',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    borderColor: '#93C5FD',
  };
};

export default function AdminDashboard({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<OverviewStats>(DEFAULT_STATS);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);

  const headerStats = useMemo(
    () => [
      {
        label: 'Students',
        value: stats.totalUsers,
        accent: '#38BDF8',
        icon: 'account-multiple-outline',
      },
      {
        label: 'Posts',
        value: stats.totalPosts,
        accent: '#34D399',
        icon: 'post-outline',
      },
      {
        label: 'Comments',
        value: stats.totalComments,
        accent: '#FBBF24',
        icon: 'message-outline',
      },
      {
        label: 'Mentors',
        value: stats.mentorsAndAdmins,
        accent: '#F472B6',
        icon: 'star-four-points-outline',
      },
    ],
    [stats],
  );

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  const verifyAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const allowed = isAdminEmail(user?.email);
      setAuthorized(allowed);
      setCheckingAccess(false);

      if (!allowed) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Main');
        }
        return;
      }

      await loadDashboard(true);
    } catch (error) {
      setCheckingAccess(false);
      setAuthorized(false);
      console.warn('Admin access check failed:', error);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    }
  };

  const loadDashboard = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const [
        usersCountResult,
        mentorsCountResult,
        postsCountResult,
        commentsCountResult,
        newUsersResult,
        newPostsResult,
        usersResult,
        postsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('role_level', 1),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase
          .from('profiles')
          .select('id, full_name, username, email, branch, year_of_study, role_level, created_at')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('posts')
          .select(
            'id, title, content, created_at, likes_count, comments_count, user_id, profiles:profiles!posts_user_id_fkey(id, full_name, username, email)',
          )
          .order('created_at', { ascending: false })
          .limit(30),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (postsResult.error) throw postsResult.error;

      setStats({
        totalUsers: usersCountResult.count ?? 0,
        mentorsAndAdmins: mentorsCountResult.count ?? 0,
        totalPosts: postsCountResult.count ?? 0,
        totalComments: commentsCountResult.count ?? 0,
        newUsersThisWeek: newUsersResult.count ?? 0,
        newPostsThisWeek: newPostsResult.count ?? 0,
      });

      setUsers((usersResult.data as AdminUser[] | null) ?? []);
      setPosts(
        ((postsResult.data as any[] | null) ?? []).map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          user_id: post.user_id,
          profile: post.profiles ?? null,
        })),
      );
    } catch (error) {
      console.warn('Admin dashboard load failed:', error);
      Alert.alert(
        'Dashboard unavailable',
        'The admin panel could not load fresh data. Check your Supabase policies if this keeps happening.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!authorized) return;
    loadDashboard();
  };

  const handleToggleMentor = (user: AdminUser) => {
    if (isAdminEmail(user.email) || (user.role_level ?? 0) >= 2) {
      return;
    }

    const nextRoleLevel = (user.role_level ?? 0) >= 1 ? 0 : 1;
    const actionLabel = nextRoleLevel >= 1 ? 'promote this student to mentor' : 'remove mentor access';

    Alert.alert('Update role', `Do you want to ${actionLabel}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          const { error } = await supabase
            .from('profiles')
            .update({ role_level: nextRoleLevel })
            .eq('id', user.id);

          if (error) {
            Alert.alert(
              'Action blocked',
              'Supabase rejected the role update. Add an admin-only update policy on profiles to allow this.',
            );
            return;
          }

          setUsers(current =>
            current.map(item =>
              item.id === user.id ? { ...item, role_level: nextRoleLevel } : item,
            ),
          );
          setStats(current => ({
            ...current,
            mentorsAndAdmins: nextRoleLevel >= 1
              ? current.mentorsAndAdmins + 1
              : Math.max(current.mentorsAndAdmins - 1, 0),
          }));
        },
      },
    ]);
  };

  const handleDeletePost = (post: AdminPost) => {
    Alert.alert(
      'Remove post',
      'This removes the post from the feed immediately. Continue only if you want it gone for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('posts').delete().eq('id', post.id);

            if (error) {
              Alert.alert(
                'Action blocked',
                'Supabase rejected the delete request. Add an admin-only delete policy on posts to allow this.',
              );
              return;
            }

            setPosts(current => current.filter(item => item.id !== post.id));
            setStats(current => ({
              ...current,
              totalPosts: Math.max(current.totalPosts - 1, 0),
            }));
          },
        },
      ],
    );
  };

  if (checkingAccess || loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingTitle}>Opening control room</Text>
          <Text style={styles.loadingBody}>We are checking your admin access and syncing the latest activity.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38BDF8" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Icon name="shield-crown-outline" size={16} color="#93C5FD" />
            <Text style={styles.heroBadgeText}>Private admin entry</Text>
          </View>
          <Text style={styles.heroTitle}>Vconnect Control Room</Text>
          <Text style={styles.heroSubtitle}>
            Hidden access is tied to {ADMIN_EMAIL}. Swipe down on your profile avatar to get here.
          </Text>

          <View style={styles.heroStatsRow}>
            {headerStats.map(item => (
              <View key={item.label} style={styles.heroStatCard}>
                <View style={[styles.heroStatIcon, { backgroundColor: `${item.accent}22` }]}>
                  <Icon name={item.icon} size={20} color={item.accent} />
                </View>
                <Text style={styles.heroStatValue}>{item.value}</Text>
                <Text style={styles.heroStatLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map(tab => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.9}
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Icon name={tab.icon} size={18} color={active ? '#071A2F' : '#94A3B8'} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'overview' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live overview</Text>
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.newUsersThisWeek}</Text>
                <Text style={styles.metricLabel}>New students this week</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.newPostsThisWeek}</Text>
                <Text style={styles.metricLabel}>Fresh posts this week</Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>What you can control from here</Text>
              <Text style={styles.insightBody}>
                Review live student accounts, promote strong contributors to mentor, and remove posts directly from the feed.
              </Text>
              <View style={styles.insightPills}>
                <View style={styles.insightPill}>
                  <Icon name="account-arrow-up-outline" size={14} color="#38BDF8" />
                  <Text style={styles.insightPillText}>Mentor access</Text>
                </View>
                <View style={styles.insightPill}>
                  <Icon name="trash-can-outline" size={14} color="#38BDF8" />
                  <Text style={styles.insightPillText}>Post removal</Text>
                </View>
                <View style={styles.insightPill}>
                  <Icon name="database-refresh-outline" size={14} color="#38BDF8" />
                  <Text style={styles.insightPillText}>Pull-to-refresh</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student directory</Text>
            {users.map(user => {
              const roleMeta = getRoleMeta(user.role_level);
              const canToggleMentor = !isAdminEmail(user.email) && (user.role_level ?? 0) < 2;

              return (
                <View key={user.id} style={styles.listCard}>
                  <View style={styles.listCardHeader}>
                    <View style={styles.listCardIdentity}>
                      <View style={styles.userGlyph}>
                        <Text style={styles.userGlyphText}>
                          {(user.full_name ?? user.username ?? 'S').trim().charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.listCardCopy}>
                        <Text style={styles.listCardTitle}>{user.full_name ?? user.username ?? 'Unnamed Student'}</Text>
                        <Text style={styles.listCardSubtitle}>{user.email ?? 'Email unavailable'}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: roleMeta.backgroundColor, borderColor: roleMeta.borderColor },
                      ]}
                    >
                      <Text style={[styles.roleBadgeText, { color: roleMeta.color }]}>{roleMeta.label}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{user.branch ?? 'Branch hidden'}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>{formatYear(user.year_of_study)}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>Joined {formatDate(user.created_at)}</Text>
                  </View>

                  {canToggleMentor && (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={styles.inlineAction}
                      onPress={() => handleToggleMentor(user)}
                    >
                      <Icon
                        name={(user.role_level ?? 0) >= 1 ? 'account-remove-outline' : 'account-plus-outline'}
                        size={18}
                        color="#071A2F"
                      />
                      <Text style={styles.inlineActionText}>
                        {(user.role_level ?? 0) >= 1 ? 'Remove mentor access' : 'Promote to mentor'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'posts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest posts</Text>
            {posts.map(post => (
              <View key={post.id} style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <View style={styles.listCardCopy}>
                    <Text style={styles.listCardTitle}>
                      {post.title?.trim() || post.content?.trim() || 'Untitled post'}
                    </Text>
                    <Text style={styles.listCardSubtitle}>
                      {(post.profile?.full_name ?? post.profile?.username ?? 'Unknown author')} • {formatDate(post.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.destructiveAction}
                    onPress={() => handleDeletePost(post)}
                  >
                    <Icon name="trash-can-outline" size={18} color="#FEE2E2" />
                    <Text style={styles.destructiveActionText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.postPreview} numberOfLines={3}>
                  {post.content?.trim() || 'No body content stored for this post.'}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{post.likes_count ?? 0} likes</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>{post.comments_count ?? 0} comments</Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaText}>ID {post.id.slice(0, 8)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071A2F',
  },
  screen: {
    flex: 1,
    backgroundColor: '#071A2F',
  },
  contentContainer: {
    paddingBottom: 36,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#071A2F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F2742',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.18)',
    alignItems: 'center',
  },
  loadingTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  loadingBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#94A3B8',
  },
  hero: {
    marginHorizontal: 18,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderRadius: 28,
    backgroundColor: '#0F2742',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.16)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.3,
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#CBD5E1',
  },
  heroStatsRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroStatCard: {
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: '#102E4E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  heroStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatValue: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  heroStatLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 18,
  },
  tabChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#10263E',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  tabChipActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#BAE6FD',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#071A2F',
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0F2742',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricLabel: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#94A3B8',
  },
  insightCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#071A2F',
  },
  insightBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  insightPills: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E0F2FE',
  },
  insightPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  listCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  listCardIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userGlyph: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#102E4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userGlyphText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E2F3FF',
  },
  listCardCopy: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  listCardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  roleBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  metaDivider: {
    marginHorizontal: 6,
    fontSize: 12,
    color: '#94A3B8',
  },
  inlineAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#E2F3FF',
  },
  inlineActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#071A2F',
  },
  destructiveAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#991B1B',
  },
  destructiveActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FEE2E2',
  },
  postPreview: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
  },
});
