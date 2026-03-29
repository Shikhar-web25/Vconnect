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

type RankedProfile = {
  id: string;
  name: string;
  avatar: any;
  postsCount: number;
  likesTotal: number;
  score: number;
};

const PROFILE_SELECT_VARIANTS = [
  'id, full_name, username, avatar_url',
  'id, username, avatar_url',
  'id, full_name, avatar_url',
  'id, avatar_url',
];

const AllSeniorsScreen = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<RankedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfiles = useCallback(async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }

    const { data: postRows, error: postError } = await supabase
      .from('posts')
      .select('user_id, likes_count');

    if (postError || !postRows) {
      setProfiles([]);
      if (showLoader) {
        setLoading(false);
      }
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

    let rankedIds = Array.from(statsMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .map(([id]) => id);

    if (rankedIds.length === 0) {
      let fallbackProfiles: any[] | null = null;
      for (const selectValue of PROFILE_SELECT_VARIANTS) {
        const fallback = await supabase.from('profiles').select(selectValue).limit(100);
        if (!fallback.error) {
          fallbackProfiles = fallback.data as any[] | null;
          break;
        }
      }

      const mapped = (fallbackProfiles ?? []).map((profile: any, index: number) => ({
        id: profile.id,
        name: profile.full_name ?? profile.username ?? 'Student',
        avatar: profile.avatar_url ? { uri: profile.avatar_url } : getMaleAvatar(index % 5),
        postsCount: 0,
        likesTotal: 0,
        score: 0,
      }));

      setProfiles(mapped);
      if (showLoader) {
        setLoading(false);
      }
      return;
    }

    rankedIds = rankedIds.slice(0, 200);

    let profileRows: any[] | null = null;
    for (const selectValue of PROFILE_SELECT_VARIANTS) {
      const profileResult = await supabase.from('profiles').select(selectValue).in('id', rankedIds);
      if (!profileResult.error) {
        profileRows = profileResult.data as any[] | null;
        break;
      }
    }

    const profileMap = new Map<string, any>((profileRows ?? []).map((row: any) => [row.id, row]));
    const mapped: RankedProfile[] = rankedIds
      .map((id, index) => {
        const profile = profileMap.get(id);
        if (!profile) return null;
        const stats = statsMap.get(id) ?? { postsCount: 0, likesTotal: 0, score: 0 };
        return {
          id,
          name: profile.full_name ?? profile.username ?? 'Student',
          avatar: profile.avatar_url ? { uri: profile.avatar_url } : getMaleAvatar(index % 5),
          postsCount: stats.postsCount,
          likesTotal: stats.likesTotal,
          score: stats.score,
        };
      })
      .filter(Boolean) as RankedProfile[];

    setProfiles(mapped);
    if (showLoader) {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfiles(true);
    }, [loadProfiles]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfiles(false);
    setRefreshing(false);
  }, [loadProfiles]);

  const filteredProfiles = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return profiles;
    return profiles.filter((profile) => profile.name.toLowerCase().includes(needle));
  }, [profiles, searchQuery]);

  const renderProfile = ({ item, index }: { item: RankedProfile; index: number }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('UserProfile', {
          userId: item.id,
          name: item.name,
          avatar: item.avatar,
        })
      }
    >
      <Text style={[styles.rank, { color: theme.primary }]}>#{index + 1}</Text>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.textWrap}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {item.postsCount} posts • {item.likesTotal} likes
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.surfaceSoft }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.86}
          >
            <Icon name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Top Profiles</Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>Live ranking from real posts + likes</Text>
          </View>
        </View>

        <View style={[styles.searchBox, { backgroundColor: theme.surfaceSoft, borderColor: theme.border }]}>
          <Icon name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search profiles..."
            placeholderTextColor={theme.textMuted}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.8}>
              <Icon name="close" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredProfiles}
            keyExtractor={(item) => item.id}
            renderItem={renderProfile}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Icon name="group" size={34} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No profiles yet</Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Once users create posts, ranking will appear here.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default AllSeniorsScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.25)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 19, fontWeight: '800' },
  headerSub: { marginTop: 2, fontSize: 12, fontWeight: '500' },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 22,
    gap: 9,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 34,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  textWrap: { flex: 1 },
  name: { fontSize: 14, fontWeight: '800' },
  meta: { marginTop: 2, fontSize: 12, fontWeight: '600' },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 42,
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: '800' },
  emptySub: { marginTop: 4, fontSize: 12, textAlign: 'center' },
});
