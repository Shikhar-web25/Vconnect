import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import HomeHeader from '../components/home/HomeHeader';
import QuestionCard from '../components/feed/QuestionCard';
import FloatingFAB from '../components/home/FloatingFAB';
import QuestionModal from '../components/feed/QuestionModal';

const HomeScreen = () => {
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

    const questions = [
        {
            id: '1',
            userName: 'Alex Johnson',
            userAvatar: 'https://i.pravatar.cc/150?img=33',
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
                    time: '1h ago'
                },
                {
                    id: 'c2',
                    userName: 'Emily Chen',
                    avatar: 'https://i.pravatar.cc/150?img=5',
                    text: 'This helped me so much with my assignment, thanks!',
                    time: '30m ago'
                }
            ]
        },
        {
            id: '2',
            userName: 'Sarah Williams',
            userAvatar: 'https://i.pravatar.cc/150?img=45',
            timePosted: '5h ago',
            category: 'Organic Chemistry',
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
                    time: '2h ago'
                }
            ]
        },
        {
            id: '3',
            userName: 'Michael Chen',
            userAvatar: 'https://i.pravatar.cc/150?img=12',
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
                    time: '4h ago'
                },
                {
                    id: 'c2',
                    userName: 'Quantum Newbie',
                    avatar: 'https://i.pravatar.cc/150?img=9',
                    text: 'This glove analogy is perfect. Finally makes sense.',
                    time: '1h ago'
                }
            ]
        },
    ];

    const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

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
                        {questions.map((question) => (
                            <QuestionCard
                                key={question.id}
                                {...question}
                                onSeeMore={setSelectedQuestionId}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <FloatingFAB onPress={() => console.log('Create Post')} />

            <QuestionModal
                visible={!!selectedQuestion}
                data={selectedQuestion}
                onClose={() => setSelectedQuestionId(null)}
            />
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
});

export default HomeScreen;
