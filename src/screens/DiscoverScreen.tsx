import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../supabaseClient';
import { getMaleAvatar } from '../utils/avatar';
import { useAppTheme } from '../theme/AppThemeContext';

type ProfileLite = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

type PostItem = {
  id: string;
  user_id: string;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  tags?: string[] | null;
  profile?: ProfileLite | null;
};

type TopProfile = {
  id: string;
  name: string;
  avatar: any;
  postsCount: number;
  likesTotal: number;
  score: number;
};

const formatRelativeTime = (createdAt?: string | null) => {
  if (!createdAt) return 'Just now';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const extractTagsFromContent = (content?: string | null) => {
  if (!content) return [] as string[];
  const matches = content.match(/#([A-Za-z0-9_\-]+)/g) ?? [];
  const normalized = matches
    .map((item) => item.replace('#', '').trim())
    .filter(Boolean);
  return Array.from(new Set(normalized)).slice(0, 6);
};

const DiscoverScreen = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [topProfiles, setTopProfiles] = useState<TopProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    let { data, error } = await supabase
      .from('posts')
      .select(
        'id, user_id, title, content, created_at, likes_count, comments_count, tags, profiles:user_id(id, full_name, username, avatar_url)',
      )
      .order('created_at', { ascending: false })
      .limit(120);

    if (error?.message?.toLowerCase().includes('tags')) {
      const fallback = await supabase
        .from('posts')
        .select(
          'id, user_id, title, content, created_at, likes_count, comments_count, profiles:user_id(id, full_name, username, avatar_url)',
        )
        .order('created_at', { ascending: false })
        .limit(120);
      data = fallback.data as any;
      error = fallback.error;
    }

    if (error) {
      setPosts([]);
      return;
    }

    const mapped = (data ?? []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      likes_count: row.likes_count,
      comments_count: row.comments_count,
      tags: row.tags ?? null,
      profile: row.profiles ?? null,
    })) as PostItem[];

    setPosts(mapped);
  }, []);

  const loadTopProfiles = useCallback(async () => {
    const { data: postRows, error: postError } = await supabase
      .from('posts')
      .select('user_id, likes_count');

    if (postError || !postRows) {
      setTopProfiles([]);
      return;
    }

    const statsMap = new Map<string, { postsCount: number; likesTotal: number; score: number }>();
    postRows.forEach((row: any) => {
      const userId = row?.user_id;
      if (!userId) return;
      const current = statsMap.get(userId) ?? { postsCount: 0, likesTotal: 0, score: 0 };
      const likes = Number(row?.likes_count ?? 0);
      current.postsCount += 1;
      current.likesTotal += likes;
      current.score = current.postsCount + current.likesTotal;
      statsMap.set(userId, current);
    });

    const rankedIds = Array.from(statsMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 12)
      .map(([id]) => id);

    if (rankedIds.length === 0) {
      setTopProfiles([]);
      return;
    }

    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', rankedIds);

    const profileMap = new Map<string, any>((profileRows ?? []).map((row: any) => [row.id, row]));

    const orderedProfiles: TopProfile[] = rankedIds
      .map((id, index) => {
        const profile = profileMap.get(id);
        if (!profile) return null;
        const stats = statsMap.get(id)!;
        return {
          id,
          name: profile.full_name ?? profile.username ?? 'Student',
          avatar: profile.avatar_url ? { uri: profile.avatar_url } : getMaleAvatar(index % 5),
          postsCount: stats.postsCount,
          likesTotal: stats.likesTotal,
          score: stats.score,
        };
      })
      .filter(Boolean) as TopProfile[];

    setTopProfiles(orderedProfiles);
  }, []);

  const loadDiscover = useCallback(
    async (showLoader: boolean) => {
      if (showLoader) setLoading(true);
      await Promise.all([loadPosts(), loadTopProfiles()]);
      if (showLoader) setLoading(false);
    },
    [loadPosts, loadTopProfiles],
  );

  useFocusEffect(
    useCallback(() => {
      loadDiscover(true);
    }, [loadDiscover]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDiscover(false);
    setRefreshing(false);
  }, [loadDiscover]);

  const filteredPosts = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => {
      const author = (post.profile?.full_name ?? post.profile?.username ?? '').toLowerCase();
      return (
        (post.title ?? '').toLowerCase().includes(needle) ||
        (post.content ?? '').toLowerCase().includes(needle) ||
        author.includes(needle)
      );
    });
  }, [posts, searchText]);

  const renderTopProfile = ({ item }: { item: TopProfile }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.profileChip,
        {
          borderColor: theme.border,
          backgroundColor: theme.surfaceSoft,
        },
      ]}
      onPress={() =>
        navigation.navigate('UserProfile', {
          userId: item.id,
          name: item.name,
          avatar: item.avatar,
        })
      }
    >
      <Image source={item.avatar} style={styles.profileAvatar} />
      <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.profileMeta, { color: theme.textMuted }]}>
        {item.postsCount} posts • {item.likesTotal} likes
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: PostItem }) => {
    const authorName = item.profile?.full_name ?? item.profile?.username ?? 'Student';
    const authorAvatar = item.profile?.avatar_url ? { uri: item.profile.avatar_url } : getMaleAvatar(0);
    const tags = (item.tags ?? []).length > 0 ? (item.tags ?? []) : extractTagsFromContent(item.content);

    return (
      <View
        style={[
          styles.postCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            <Image source={authorAvatar} style={styles.authorAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.authorName, { color: theme.text }]}>{authorName}</Text>
              <Text style={[styles.authorMeta, { color: theme.textMuted }]}>
                {formatRelativeTime(item.created_at)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.postTitle, { color: theme.text }]}>{item.title?.trim() || 'Untitled Post'}</Text>
        <Text style={[styles.postBody, { color: theme.textMuted }]}>
          {item.content?.trim() || 'No content added.'}
        </Text>

        {tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.slice(0, 6).map((tag) => (
              <View
                key={`${item.id}-${tag}`}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: isDark ? '#213149' : '#E8F0F7',
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.postFooter, { borderTopColor: theme.border }]}>
          <View style={styles.footerItem}>
            <Icon name="thumb-up" size={15} color={theme.textMuted} />
            <Text style={[styles.footerText, { color: theme.textMuted }]}>{item.likes_count ?? 0}</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="chat-bubble-outline" size={15} color={theme.textMuted} />
            <Text style={[styles.footerText, { color: theme.textMuted }]}>{item.comments_count ?? 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Discover</Text>
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: theme.surfaceSoft }]}>
              <Icon name="search" size={18} color={theme.textMuted} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search posts, tags, people..."
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
        </View>

        {loading ? (
          <View style={[styles.loaderWrap, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            contentContainerStyle={[styles.listContent, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            ListHeaderComponent={
              <View
                style={[
                  styles.topProfilesCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.topProfilesHeader}>
                  <Text style={[styles.topProfilesTitle, { color: theme.text }]}>Top Profiles</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllSeniors')}>
                    <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                  </TouchableOpacity>
                </View>

                {topProfiles.length === 0 ? (
                  <Text style={[styles.emptyTopText, { color: theme.textMuted }]}>
                    No ranked profiles yet. Publish posts to populate this list.
                  </Text>
                ) : (
                  <FlatList
                    data={topProfiles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTopProfile}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.profileListContent}
                  />
                )}

                <Text style={[styles.rankingHint, { color: theme.textMuted }]}>
                  Ranking = total posts + total likes
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Icon name="inbox" size={38} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No posts yet</Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Create the first post from the + button.
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Icon name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  searchRow: { flexDirection: 'row' },
  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 14,
    paddingBottom: 100,
    gap: 10,
  },
  topProfilesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 6,
  },
  topProfilesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topProfilesTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileListContent: { gap: 10 },
  profileChip: {
    width: 132,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileMeta: {
    marginTop: 2,
    fontSize: 11,
  },
  rankingHint: {
    marginTop: 10,
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyTopText: {
    fontSize: 12,
  },
  postCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  postHeader: { marginBottom: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorAvatar: { width: 34, height: 34, borderRadius: 17 },
  authorName: { fontSize: 13, fontWeight: '700' },
  authorMeta: { marginTop: 1, fontSize: 10 },
  postTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  postBody: { fontSize: 13, lineHeight: 19 },
  tagRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  tagText: { fontSize: 11, fontWeight: '700' },
  postFooter: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 12, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 44 },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: '800' },
  emptySub: { marginTop: 4, fontSize: 12 },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
