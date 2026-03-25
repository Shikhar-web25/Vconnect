import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface QuestionCardProps {
    id: string;
    userName: string;
    userAvatar: string;
    timePosted: string;
    category: string;
    questionTitle: string;
    questionPreview: string;
    likeCount?: number;
    commentCount?: number;
    onSeeMore: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    userName,
    userAvatar,
    timePosted,
    category,
    questionTitle,
    questionPreview,
    likeCount = 0,
    commentCount = 0,
    onSeeMore,
}) => {
    return (
        <View style={styles.card}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: userAvatar }} style={styles.avatar} />
                    <View>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.postMeta}>
                            posted {timePosted} in <Text style={styles.category}>{category}</Text>
                        </Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Icon name="dots-horizontal" size={24} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <Text style={styles.title}>{questionTitle}</Text>
            <Text style={styles.body} numberOfLines={3}>
                {questionPreview}
            </Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Actions Row */}
            <View style={styles.actionsRow}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Icon name="thumb-up" size={18} color="#64748B" />
                        <Text style={styles.statText}>{likeCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Icon name="comment" size={18} color="#64748B" />
                        <Text style={styles.statText}>{commentCount}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => onSeeMore(id)}
                >
                    <Text style={styles.detailsText}>Details</Text>
                    <Icon name="chevron-right" size={16} color="#4A6D8C" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        backgroundColor: '#F1F5F9', // Fallback color
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    postMeta: {
        fontSize: 12,
        color: '#94A3B8',
    },
    category: {
        color: '#4A6D8C',
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
        lineHeight: 26,
    },
    body: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 22,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    detailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailsText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4A6D8C',
    },
});

export default QuestionCard;
