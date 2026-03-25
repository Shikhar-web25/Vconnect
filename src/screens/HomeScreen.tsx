import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import HomeHeader from '../components/home/HomeHeader';
import QuestionCard from '../components/feed/QuestionCard';
import FloatingFAB from '../components/home/FloatingFAB';
import QuestionModal from '../components/feed/QuestionModal';
import { supabase } from '../../supabaseClient';

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
    userAvatar: string;
    timePosted: string;
    category: string;
    questionTitle: string;
    questionPreview: string;
    fullAnswer: string;
    likeCount: number;
    commentCount: number;
};

const HomeScreen = () => {
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [commentsByPostId, setCommentsByPostId] = useState<Record<string, FeedComment[]>>({});
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [createVisible, setCreateVisible] = useState(false);
    const [newPostText, setNewPostText] = useState('');
    const [posting, setPosting] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: string; full_name?: string; username?: string; avatar_url?: string } | null>(null);

    useEffect(() => {
        loadCurrentUser();
        loadPosts();
    }, []);

    useEffect(() => {
        if (selectedQuestionId) {
            loadComments(selectedQuestionId);
        }
    }, [selectedQuestionId]);

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

    const mapPost = (row: any): FeedPost => {
        const relatedProfile = row?.profiles ?? row?.user ?? null;
        const profile = Array.isArray(relatedProfile) ? relatedProfile[0] : relatedProfile;
        const authorName = profile?.full_name ?? profile?.username ?? 'Unknown';
        const authorAvatar = profile?.avatar_url ?? 'https://i.pravatar.cc/150?img=12';
        const branch = profile?.branch ?? 'General';
        const content = row?.content ?? '';

        return {
            id: row.id,
            userId: row.user_id,
            userName: authorName,
            userAvatar: authorAvatar,
            timePosted: formatTimeAgo(row.created_at),
            category: branch,
            questionTitle: content,
            questionPreview: content,
            fullAnswer: content,
            likeCount: row.likes_count ?? 0,
            commentCount: row.comments_count ?? 0,
        };
    };

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', user.id)
            .single();
        if (data) {
            setCurrentUser(data);
        }
    };

    const loadPosts = async () => {
        setLoading(true);
        setErrorMessage(null);

        const { data, error } = await supabase
            .from('posts')
            .select('id, user_id, content, image_url, created_at, likes_count, comments_count, profiles (id, full_name, username, avatar_url, branch)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
        }

        const mapped = (data ?? []).map(mapPost);
        setPosts(mapped);
        setLoading(false);
    };

    const loadComments = async (postId: string) => {
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, profiles (id, full_name, username, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            return;
        }

        const mapped: FeedComment[] = (data ?? []).map((row: any) => {
            const relatedProfile = row?.profiles ?? row?.user ?? null;
            const profile = Array.isArray(relatedProfile) ? relatedProfile[0] : relatedProfile;
            return {
                id: row.id,
                userName: profile?.full_name ?? profile?.username ?? 'Unknown',
                avatar: profile?.avatar_url ?? 'https://i.pravatar.cc/150?img=12',
                text: row.content ?? '',
                time: formatTimeAgo(row.created_at),
            };
        });

        setCommentsByPostId((prev) => ({
            ...prev,
            [postId]: mapped,
        }));
    };

    const handleAddComment = async (postId: string, text: string) => {
        if (!currentUser) return null;
        const { data, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                user_id: currentUser.id,
                content: text,
            })
            .select('id, content, created_at, user_id, profiles (id, full_name, username, avatar_url)')
            .single();

        if (error || !data) return null;

        const relatedProfile = data?.profiles ?? null;
        const profile = Array.isArray(relatedProfile) ? relatedProfile[0] : relatedProfile;
        const comment: FeedComment = {
            id: data.id,
            userName: profile?.full_name ?? profile?.username ?? currentUser.full_name ?? currentUser.username ?? 'You',
            avatar: profile?.avatar_url ?? currentUser.avatar_url ?? 'https://i.pravatar.cc/150?img=12',
            text: data.content ?? text,
            time: formatTimeAgo(data.created_at),
        };

        setCommentsByPostId((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] ?? []), comment],
        }));

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, commentCount: (post.commentCount ?? 0) + 1 }
                    : post
            )
        );

        return comment;
    };

    const handleCreatePost = async () => {
        if (!newPostText.trim() || posting) return;
        setPosting(true);
        setErrorMessage(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setPosting(false);
            return;
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({
                user_id: user.id,
                content: newPostText.trim(),
                title: newPostText.trim(),
            })
            .select('id, user_id, content, image_url, created_at, likes_count, comments_count, profiles (id, full_name, username, avatar_url, branch)')
            .single();

        if (error || !data) {
            setErrorMessage(error?.message ?? 'Failed to post.');
            setPosting(false);
            return;
        }

        setPosts((prev) => [mapPost(data), ...prev]);
        setNewPostText('');
        setCreateVisible(false);
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

    return (
        <View style={styles.container}>
            {/* 
               The ScrollView has a blue background to match the header on pull-down (overscroll).
               The content container is styled to ensure the feed background remains light gray.
            */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                stickyHeaderIndices={[0]}
            >
                <HomeHeader />

                <View style={styles.feedWrapper}>
                    <View style={styles.feedContainer}>
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#4A6D8C" />
                                <Text style={styles.loadingText}>Loading posts...</Text>
                            </View>
                        )}

                        {!loading && errorMessage && (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        )}

                        {!loading && !errorMessage && posts.map((question) => (
                            <QuestionCard
                                key={question.id}
                                {...question}
                                onSeeMore={setSelectedQuestionId}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <FloatingFAB onPress={() => setCreateVisible(true)} />

            <QuestionModal
                visible={!!selectedQuestion}
                data={selectedQuestion}
                postId={selectedQuestionId ?? undefined}
                onAddComment={handleAddComment}
                onClose={() => setSelectedQuestionId(null)}
            />

            <Modal
                visible={createVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCreateVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.createCard}>
                        <Text style={styles.createTitle}>Create Post</Text>
                        <TextInput
                            style={styles.createInput}
                            placeholder="Share something with VIT Bhopal..."
                            placeholderTextColor="#94A3B8"
                            value={newPostText}
                            onChangeText={setNewPostText}
                            multiline
                        />
                        <View style={styles.createActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setCreateVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.postButton, !newPostText.trim() && styles.postButtonDisabled]}
                                onPress={handleCreatePost}
                                disabled={!newPostText.trim() || posting}
                            >
                                {posting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.postButtonText}>Post</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4A6D8C', // IMPORTANT: This fixes the top "white flash" on iOS bounce
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#4A6D8C', // Also ensures the bounce area is blue
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100, // Space for FAB
        backgroundColor: '#F5F7FA', // The main page background color
    },
    feedWrapper: {
        backgroundColor: '#F5F7FA', // Ensures content below header is gray
    },
    feedContainer: {
        paddingHorizontal: 20,
        marginTop: -10, // Slight overlap closer to header
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    loadingText: {
        marginLeft: 10,
        color: '#64748B',
        fontSize: 14,
    },
    errorText: {
        color: '#DC2626',
        paddingVertical: 16,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    createCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    createTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },
    createInput: {
        minHeight: 120,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 14,
        fontSize: 15,
        color: '#0F172A',
        textAlignVertical: 'top',
        backgroundColor: '#F8FAFC',
    },
    createActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    cancelButtonText: {
        color: '#475569',
        fontWeight: '600',
    },
    postButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#4A6D8C',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
    },
    postButtonDisabled: {
        backgroundColor: '#94A3B8',
    },
    postButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default HomeScreen;
