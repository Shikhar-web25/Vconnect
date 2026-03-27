import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    StatusBar,
    Text,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { FixedHeader, FilterChips } from '../components/home/HomeHeader';
import QuestionCard from '../components/feed/QuestionCard';
import FloatingFAB from '../components/home/FloatingFAB';
import QuestionModal from '../components/feed/QuestionModal';
import CreatePostModal from '../components/home/CreatePostModal';
import ProfilePreviewModal, { ProfilePreviewUser } from '../components/shared/ProfilePreviewModal';
import { supabase } from '../../supabaseClient';
import { useAppTheme } from '../theme/AppThemeContext';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=12';
const ALL_POSTS = 'All Posts';

const POST_SELECT_VARIANTS = [
    'id, user_id, title, content, created_at, likes_count, comments_count, profiles (id, full_name, username, avatar_url, branch, year_of_study)',
    'id, user_id, title, content, created_at, likes_count, comments_count, profiles (id, full_name, username, avatar_url)',
    'id, user_id, content, created_at, likes_count, comments_count, profiles (id, full_name, username, avatar_url)',
];

const COMMENT_SELECT_VARIANTS = [
    'id, content, created_at, user_id, profiles (id, full_name, username, avatar_url)',
    'id, content, created_at, user_id',
];

type FeedComment = {
    id: string;
    userName: string;
    avatar: string;
    text: string;
    time: string;
};

type FeedPost = {
    id: string;
    userId?: string;
    userName: string;
    userAvatar: { uri: string };
    timePosted: string;
    category: string;
    questionTitle: string;
    questionPreview: string;
    fullAnswer: string;
    likeCount: number;
    commentCount: number;
    batch?: string;
};

type CurrentUser = {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    branch?: string | null;
    year_of_study?: number | null;
};

const formatTimeAgo = (isoDate?: string | null) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const normalizeProfile = (raw: any) => {
    const related = raw?.profiles ?? raw?.user ?? null;
    return Array.isArray(related) ? related[0] : related;
};

const mapPost = (row: any): FeedPost => {
    const profile = normalizeProfile(row);
    const content = `${row?.content ?? ''}`.trim();
    const title = `${row?.title ?? ''}`.trim() || content.split('\n')[0] || 'Untitled post';
    const preview = content || title;
    const authorName = profile?.full_name ?? profile?.username ?? 'Unknown';
    const authorAvatar = profile?.avatar_url ?? FALLBACK_AVATAR;
    const category = row?.category ?? profile?.branch ?? 'General';
    const year = profile?.year_of_study ? String(profile.year_of_study) : undefined;

    return {
        id: row.id,
        userId: row.user_id,
        userName: authorName,
        userAvatar: { uri: authorAvatar },
        timePosted: formatTimeAgo(row.created_at),
        category,
        questionTitle: title,
        questionPreview: preview,
        fullAnswer: preview,
        likeCount: Number(row?.likes_count ?? 0),
        commentCount: Number(row?.comments_count ?? 0),
        batch: year,
    };
};

const HomeScreen = () => {
    const { theme, isDark } = useAppTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [commentsByPostId, setCommentsByPostId] = useState<Record<string, FeedComment[]>>({});
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [posting, setPosting] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(ALL_POSTS);
    const [searchText, setSearchText] = useState('');
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [previewUser, setPreviewUser] = useState<ProfilePreviewUser | null>(null);
    const skeletonPulse = useRef(new Animated.Value(0.42)).current;

    useEffect(() => {
        loadCurrentUser();
        loadPosts();
    }, []);

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(skeletonPulse, {
                    toValue: 0.92,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(skeletonPulse, {
                    toValue: 0.42,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [skeletonPulse]);

    useEffect(() => {
        if (selectedQuestionId) {
            loadComments(selectedQuestionId);
        }
    }, [selectedQuestionId]);

    const loadCurrentUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const selectVariants = [
            'id, full_name, username, avatar_url, branch, year_of_study',
            'id, full_name, username, avatar_url',
        ];

        for (const selectValue of selectVariants) {
            const { data, error } = await supabase
                .from('profiles')
                .select(selectValue)
                .eq('id', user.id)
                .single();
            if (!error && data && typeof data === 'object' && 'id' in data) {
                setCurrentUser(data as CurrentUser);
                return;
            }
        }

        setCurrentUser({ id: user.id });
    };

    const loadPosts = async () => {
        setLoading(true);
        setErrorMessage(null);

        let rows: any[] | null = null;
        let lastError: any = null;

        for (const selectValue of POST_SELECT_VARIANTS) {
            const { data, error } = await supabase
                .from('posts')
                .select(selectValue)
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error) {
                rows = data ?? [];
                lastError = null;
                break;
            }
            lastError = error;
        }

        if (lastError) {
            setErrorMessage(lastError.message);
            setLoading(false);
            return;
        }

        setPosts((rows ?? []).map(mapPost));
        setLoading(false);
    };

    const loadComments = async (postId: string) => {
        let rows: any[] | null = null;

        for (const selectValue of COMMENT_SELECT_VARIANTS) {
            const { data, error } = await supabase
                .from('comments')
                .select(selectValue)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });
            if (!error) {
                rows = data ?? [];
                break;
            }
        }

        const mapped: FeedComment[] = (rows ?? []).map((row: any) => {
            const profile = normalizeProfile(row);
            return {
                id: row.id,
                userName: profile?.full_name ?? profile?.username ?? 'Unknown',
                avatar: profile?.avatar_url ?? FALLBACK_AVATAR,
                text: row.content ?? '',
                time: formatTimeAgo(row.created_at),
            };
        });

        setCommentsByPostId((prev) => ({
            ...prev,
            [postId]: mapped,
        }));
    };

    const fetchPostById = async (postId: string) => {
        for (const selectValue of POST_SELECT_VARIANTS) {
            const { data, error } = await supabase
                .from('posts')
                .select(selectValue)
                .eq('id', postId)
                .single();

            if (!error && data) {
                return data;
            }
        }

        return null;
    };

    const handleAddComment = async (postId: string, text: string) => {
        if (!currentUser) return null;

        const insertPayload = {
            post_id: postId,
            user_id: currentUser.id,
            content: text,
        };

        let inserted: any = null;

        for (const selectValue of COMMENT_SELECT_VARIANTS) {
            const { data, error } = await supabase
                .from('comments')
                .insert(insertPayload)
                .select(selectValue)
                .single();
            if (!error && data) {
                inserted = data;
                break;
            }
        }

        if (!inserted) return null;

        const profile = normalizeProfile(inserted);
        const comment: FeedComment = {
            id: inserted.id,
            userName: profile?.full_name ?? profile?.username ?? currentUser.full_name ?? currentUser.username ?? 'You',
            avatar: profile?.avatar_url ?? currentUser.avatar_url ?? FALLBACK_AVATAR,
            text: inserted.content ?? text,
            time: formatTimeAgo(inserted.created_at),
        };

        setCommentsByPostId((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] ?? []), comment],
        }));

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
                    : post,
            ),
        );

        return comment;
    };

    const handleCreatePost = async (post: { title: string; content: string; category: string }) => {
        if (posting) return;
        const title = post.title.trim();
        const content = post.content.trim();
        if (!title || !content) return;

        setPosting(true);
        setErrorMessage(null);

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setPosting(false);
            return;
        }

        const payloads = [
            { user_id: user.id, title, content, category: post.category },
            { user_id: user.id, title, content },
            { user_id: user.id, content: `${title}\n\n${content}` },
        ];

        let insertedPostId: string | null = null;
        let insertError: any = null;

        for (const payload of payloads) {
            const { data, error } = await supabase.from('posts').insert(payload).select('id').single();
            if (!error && data?.id) {
                insertedPostId = data.id;
                insertError = null;
                break;
            }
            insertError = error;
            if (!error) continue;
            const message = `${error.message ?? ''}`.toLowerCase();
            const canRetry =
                message.includes('column') ||
                message.includes('schema cache') ||
                message.includes('null value in column "title"');
            if (!canRetry) {
                break;
            }
        }

        if (!insertedPostId) {
            setErrorMessage(insertError?.message ?? 'Failed to post.');
            setPosting(false);
            return;
        }

        const insertedRow = await fetchPostById(insertedPostId);
        if (insertedRow) {
            const mapped = mapPost(insertedRow);
            setPosts((prev) => [{ ...mapped, category: post.category || mapped.category }, ...prev]);
        } else {
            const fallbackAuthor = currentUser?.full_name ?? currentUser?.username ?? 'You';
            const fallbackAvatar = currentUser?.avatar_url ?? FALLBACK_AVATAR;
            const fallbackPost: FeedPost = {
                id: insertedPostId,
                userId: user.id,
                userName: fallbackAuthor,
                userAvatar: { uri: fallbackAvatar },
                timePosted: 'Just now',
                category: post.category || currentUser?.branch || 'General',
                questionTitle: title,
                questionPreview: content,
                fullAnswer: content,
                likeCount: 0,
                commentCount: 0,
                batch: currentUser?.year_of_study ? String(currentUser.year_of_study) : undefined,
            };
            setPosts((prev) => [fallbackPost, ...prev]);
        }

        setShowCreateModal(false);
        setPosting(false);
    };

    const selectedQuestion = useMemo(() => {
        if (!selectedQuestionId) return null;
        const post = posts.find((q) => q.id === selectedQuestionId);
        if (!post) return null;
        return {
            ...post,
            comments: commentsByPostId[selectedQuestionId] ?? [],
        };
    }, [selectedQuestionId, posts, commentsByPostId]);

    const filteredQuestions = useMemo(() => {
        return posts.filter((post) => {
            const matchesCategory = selectedCategory === ALL_POSTS || post.category === selectedCategory;
            const search = searchText.trim().toLowerCase();
            const matchesSearch =
                search.length === 0 ||
                post.questionTitle.toLowerCase().includes(search) ||
                post.userName.toLowerCase().includes(search) ||
                post.questionPreview.toLowerCase().includes(search);
            return matchesCategory && matchesSearch;
        });
    }, [posts, searchText, selectedCategory]);

    const handleLike = useCallback((id: string) => {
        setLikedPosts((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleSave = useCallback((id: string) => {
        setSavedPosts((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleDelete = useCallback((id: string) => {
        setPosts((prev) => prev.filter((post) => post.id !== id));
        setSelectedQuestionId((current) => (current === id ? null : current));
    }, []);

    const handleAvatarPress = useCallback(
        (user: { id: string; name: string; avatar: any; category: string }) => {
            const post = posts.find((item) => item.userId === user.id) ?? posts.find((item) => item.id === user.id);
            if (!post) return;
            setPreviewUser({
                id: post.userId ?? post.id,
                name: post.userName,
                avatar: post.userAvatar,
                about: 'Hey there! I am using Vconnect',
                batch: post.batch ?? '2025',
                category: post.category,
            });
        },
        [posts],
    );

    const handleMessage = useCallback(
        (user: ProfilePreviewUser) => {
            setPreviewUser(null);
            navigation.navigate('ChatDetail', {
                chatId: user.id,
                name: user.name,
                avatar: user.avatar,
                userId: user.id,
            });
        },
        [navigation],
    );

    const handleViewProfile = useCallback(() => {
        if (!previewUser) {
            return;
        }
        const user = previewUser;
        setPreviewUser(null);
        navigation.navigate('UserProfile', {
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
            batch: user.batch,
            about: user.about,
            bio: user.about,
        });
    }, [navigation, previewUser]);

    const renderQuestion = useCallback(
        ({ item }: { item: FeedPost }) => (
            <QuestionCard
                key={item.id}
                id={item.id}
                userId={item.userId}
                userName={item.userName}
                userAvatar={item.userAvatar}
                timePosted={item.timePosted}
                category={item.category}
                questionTitle={item.questionTitle}
                questionPreview={item.questionPreview}
                likeCount={item.likeCount}
                commentCount={item.commentCount}
                isLiked={likedPosts.has(item.id)}
                isSaved={savedPosts.has(item.id)}
                batch={item.batch}
                onSeeMore={setSelectedQuestionId}
                onLike={handleLike}
                onSave={handleSave}
                onDelete={handleDelete}
                onAvatarPress={handleAvatarPress}
            />
        ),
        [handleAvatarPress, handleDelete, handleLike, handleSave, likedPosts, savedPosts],
    );

    const renderSkeletonCards = () =>
        Array.from({ length: 3 }, (_, index) => (
            <Animated.View
                key={`home-skeleton-${index}`}
                style={[styles.skeletonCard, { opacity: skeletonPulse }]}
            >
                <View style={styles.skeletonHeaderRow}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonHeaderTextWrap}>
                        <View style={styles.skeletonNameLine} />
                        <View style={styles.skeletonMetaLine} />
                    </View>
                </View>
                <View style={styles.skeletonTitleLine} />
                <View style={styles.skeletonBodyLineLg} />
                <View style={styles.skeletonBodyLineSm} />
            </Animated.View>
        ));

    const renderEmptyState = () => {
        if (loading) {
            return (
                    <View style={styles.emptyState}>
                        {renderSkeletonCards()}
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#64748B" />
                            <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading feed...</Text>
                        </View>
                    </View>
                );
            }

            if (errorMessage) {
                return (
                    <View style={styles.emptyState}>
                        <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
                    </View>
                );
            }

            if (posts.length > 0 && filteredQuestions.length === 0) {
                return (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No posts match this filter yet.</Text>
                    </View>
                );
            }

            return (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No posts yet. Be the first to ask something.</Text>
                </View>
            );
        };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
                translucent={false}
            />

            <FixedHeader onSearch={setSearchText} postCount={filteredQuestions.length} />

            <FlatList
                data={filteredQuestions}
                keyExtractor={(item) => item.id}
                renderItem={renderQuestion}
                ListHeaderComponent={
                    <FilterChips
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={7}
            />

            <FloatingFAB onPress={() => setShowCreateModal(true)} />

            <QuestionModal
                visible={!!selectedQuestion}
                data={selectedQuestion}
                postId={selectedQuestionId ?? undefined}
                onAddComment={handleAddComment}
                onClose={() => setSelectedQuestionId(null)}
            />

            <CreatePostModal
                visible={showCreateModal}
                onClose={() => {
                    if (!posting) {
                        setShowCreateModal(false);
                    }
                }}
                onSubmit={handleCreatePost}
            />

            <ProfilePreviewModal
                visible={!!previewUser}
                user={previewUser}
                onClose={() => setPreviewUser(null)}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8EAF6',
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyState: {
        paddingTop: 12,
        gap: 12,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingTop: 8,
    },
    loadingText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 18,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 18,
    },
    skeletonCard: {
        borderRadius: 20,
        backgroundColor: '#E8EEF5',
        padding: 14,
        borderWidth: 1,
        borderColor: '#DDE6F0',
    },
    skeletonHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeletonAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#CED9E6',
    },
    skeletonHeaderTextWrap: {
        marginLeft: 10,
        gap: 6,
        flex: 1,
    },
    skeletonNameLine: {
        width: '45%',
        height: 10,
        borderRadius: 8,
        backgroundColor: '#CED9E6',
    },
    skeletonMetaLine: {
        width: '30%',
        height: 8,
        borderRadius: 8,
        backgroundColor: '#CED9E6',
    },
    skeletonTitleLine: {
        marginTop: 14,
        width: '84%',
        height: 12,
        borderRadius: 8,
        backgroundColor: '#CED9E6',
    },
    skeletonBodyLineLg: {
        marginTop: 10,
        width: '94%',
        height: 10,
        borderRadius: 8,
        backgroundColor: '#CED9E6',
    },
    skeletonBodyLineSm: {
        marginTop: 8,
        width: '68%',
        height: 10,
        borderRadius: 8,
        backgroundColor: '#CED9E6',
    },
});

export default HomeScreen;
