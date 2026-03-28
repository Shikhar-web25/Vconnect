import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { FixedHeader, FilterChips } from '../components/home/HomeHeader';
import QuestionCard from '../components/feed/QuestionCard';
import FloatingFAB from '../components/home/FloatingFAB';
import QuestionModal from '../components/feed/QuestionModal';
import CreatePostModal from '../components/home/CreatePostModal';
import ProfilePreviewModal, { ProfilePreviewUser } from '../components/shared/ProfilePreviewModal';
import { getMaleAvatar, getFemaleAvatar } from '../utils/avatar';

const BG = '#E8EAF6';

interface Question {
    id: string;
    userName: string;
    userAvatar: any;
    timePosted: string;
    category: string;
    questionTitle: string;
    questionPreview: string;
    fullAnswer: string;
    likeCount: number;
    commentCount: number;
    comments: Array<{
        id: string;
        userName: string;
        avatar: string;
        text: string;
        time: string;
    }>;
    batch?: string;
}

const initialQuestions: Question[] = [
    {
        id: '1',
        userName: 'Aryan Sharma',
        userAvatar: getMaleAvatar(0),
        timePosted: '2h ago',
        category: 'Computer Science',
        questionTitle: "How do I efficiently implement Dijkstra's algorithm for my graph theory assignment?",
        questionPreview:
            "The best approach is to use a priority queue (Min-Heap). You'll need to maintain a set of unvisited nodes and continuously update their distances...",
        fullAnswer:
            "The best approach is to use a priority queue (Min-Heap). You'll need to maintain a set of distances initialized to infinity, except for the start node which is 0. \n\n1. Initialize distances to all nodes as infinite, start node to 0.\n2. Add start node to priority queue.\n3. While queue is not empty, extract min distance node.\n4. Update neighbors if a shorter path is found.\n5. Repeat until destination reached or queue empty.\n\nMake sure to handle the case where the graph has negative weights (use Bellman-Ford instead if so).",
        likeCount: 124,
        commentCount: 42,
        comments: [
            {
                id: 'c1',
                userName: 'David Kim',
                avatar: 'https://i.pravatar.cc/150?img=11',
                text: 'Make sure to handle the edge case where the graph is disconnected!',
                time: '1h ago',
            },
            {
                id: 'c2',
                userName: 'Emily Chen',
                avatar: 'https://i.pravatar.cc/150?img=5',
                text: 'This helped me so much with my assignment, thanks!',
                time: '30m ago',
            },
        ],
        batch: '2025',
    },
    {
        id: '2',
        userName: 'Sarah Jenkins',
        userAvatar: getFemaleAvatar(0),
        timePosted: '5h ago',
        category: 'Chemistry',
        questionTitle: 'Tips for memorizing functional groups for the upcoming midterm?',
        questionPreview:
            'I found that drawing them out repeatedly and using mnemonic devices really helps. Try focusing on the carbon-oxygen bonds first...',
        fullAnswer:
            "I found that drawing them out repeatedly and using mnemonic devices really helps. Try grouping them by structure (e.g., carbonyls: aldehydes, ketones, carboxylic acids).\n\nFlashcards are your best friend here. Also, try to understand the properties that define each group rather than just rote memorization. For example, knowing that alcohols can hydrogen bond explains their higher boiling points.",
        likeCount: 89,
        commentCount: 15,
        comments: [
            {
                id: 'c1',
                userName: 'John Doe',
                avatar: 'https://i.pravatar.cc/150?img=3',
                text: 'I recommend using Anki for flashcards. It uses spaced repetition which is great for memorization.',
                time: '2h ago',
            },
        ],
        batch: '2024',
    },
    {
        id: '3',
        userName: 'Rohan Gupta',
        userAvatar: getMaleAvatar(3),
        timePosted: '8h ago',
        category: 'Physics',
        questionTitle: 'Can someone explain quantum entanglement in simple terms?',
        questionPreview:
            'Think of it as two particles being connected in such a way that measuring one instantly determines the state of the other...',
        fullAnswer:
            "Think of it as two particles being connected in such a way that measuring one instantly determines the state of the other, no matter how far apart they are. \n\nImagine you have a pair of gloves, one left and one right, in two separate boxes. You send one to Mars and keep one on Earth. The moment you open your box and see a left glove, you instantly know the one on Mars is a right glove. Quantum entanglement is like that, but with particle spins instead of gloves, and the correlation exists even before measurement.",
        likeCount: 256,
        commentCount: 67,
        comments: [
            {
                id: 'c1',
                userName: 'Astrophysics Fan',
                avatar: 'https://i.pravatar.cc/150?img=8',
                text: 'Spooky action at a distance!',
                time: '4h ago',
            },
            {
                id: 'c2',
                userName: 'Quantum Newbie',
                avatar: 'https://i.pravatar.cc/150?img=9',
                text: 'This glove analogy is perfect. Finally makes sense.',
                time: '1h ago',
            },
        ],
        batch: '2024',
    },
    {
        id: '4',
        userName: 'Kavya Desai',
        userAvatar: getFemaleAvatar(1),
        timePosted: '1d ago',
        category: 'Mathematics',
        questionTitle: 'Best resources for learning Linear Algebra?',
        questionPreview:
            "3Blue1Brown's Essence of Linear Algebra series on YouTube is absolutely fantastic. It gives you visual intuition...",
        fullAnswer:
            "3Blue1Brown's Essence of Linear Algebra series on YouTube is absolutely fantastic. It gives you visual intuition for concepts that textbooks often make abstract.\n\nFor practice problems, try MIT OpenCourseWare 18.06. Gilbert Strang's lectures are legendary. Also, the book 'Linear Algebra Done Right' by Sheldon Axler is great for understanding the theory deeply.",
        likeCount: 178,
        commentCount: 34,
        comments: [
            {
                id: 'c1',
                userName: 'Math Enthusiast',
                avatar: 'https://i.pravatar.cc/150?img=12',
                text: '3Blue1Brown changed my understanding of vectors completely!',
                time: '6h ago',
            },
        ],
        batch: '2025',
    },
];

const HomeScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    const [questions, setQuestions] = useState(initialQuestions);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All Posts');
    const [searchText, setSearchText] = useState('');
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewUser, setPreviewUser] = useState<ProfilePreviewUser | null>(null);

    const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

    // Filter questions by category and search
    const filteredQuestions = questions.filter((q) => {
        const matchesCategory = selectedCategory === 'All Posts' || q.category === selectedCategory;
        const matchesSearch =
            searchText === '' ||
            q.questionTitle.toLowerCase().includes(searchText.toLowerCase()) ||
            q.userName.toLowerCase().includes(searchText.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleLike = useCallback((id: string) => {
        setLikedPosts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleSave = useCallback((id: string) => {
        setSavedPosts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleDelete = useCallback((id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    }, []);

    const handleAvatarPress = useCallback((user: { id: string; name: string; avatar: any; category: string }) => {
        const question = questions.find((q) => q.id === user.id);
        setPreviewUser({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            about: 'Hey there! I am using Vconnect',
            batch: question?.batch || '2025',
            category: user.category,
        });
    }, [questions]);

    const handleMessage = useCallback((user: ProfilePreviewUser) => {
        setPreviewUser(null);
        navigation.navigate('ChatDetail', {
            chatId: user.id,
            name: user.name,
            avatar: user.avatar,
        });
    }, [navigation]);

    const handleViewProfile = useCallback(() => {
        setPreviewUser(null);
        // Navigate to Profile tab in the bottom tab navigator
        (navigation as any).navigate('Main', { screen: 'Profile' });
    }, [navigation]);

    const handleCreatePost = useCallback((post: { title: string; content: string; category: string }) => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            userName: 'Prateek',
            userAvatar: getMaleAvatar(0),
            timePosted: 'Just now',
            category: post.category,
            questionTitle: post.title,
            questionPreview: post.content.substring(0, 150) + (post.content.length > 150 ? '...' : ''),
            fullAnswer: post.content,
            likeCount: 0,
            commentCount: 0,
            comments: [],
            batch: '2025',
        };
        setQuestions((prev) => [newQuestion, ...prev]);
    }, []);

    const renderQuestion = useCallback(({ item }: { item: Question }) => (
        <QuestionCard
            key={item.id}
            {...item}
            isLiked={likedPosts.has(item.id)}
            isSaved={savedPosts.has(item.id)}
            onSeeMore={setSelectedQuestionId}
            onLike={handleLike}
            onSave={handleSave}
            onDelete={handleDelete}
            onAvatarPress={handleAvatarPress}
        />
    ), [likedPosts, savedPosts, handleLike, handleSave, handleDelete, handleAvatarPress]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} translucent={false} />
            
            {/* Fixed Header - stays at top */}
            <FixedHeader onSearch={setSearchText} postCount={filteredQuestions.length} />
            
            {/* Scrollable content - filters + posts */}
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
                onClose={() => setSelectedQuestionId(null)}
            />

            <CreatePostModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
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
        backgroundColor: BG,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
});

export default HomeScreen;
