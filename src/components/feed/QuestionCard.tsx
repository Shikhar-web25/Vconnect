import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    Easing,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageSourcePropType } from 'react-native';
import { useAppTheme } from '../../theme/AppThemeContext';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';

interface QuestionCardProps {
    id: string;
    userId?: string;
    userName: string;
    userAvatar: ImageSourcePropType;
    timePosted: string;
    category: string;
    questionTitle: string;
    questionPreview: string;
    likeCount?: number;
    commentCount?: number;
    isLiked?: boolean;
    isSaved?: boolean;
    onSeeMore: (id: string) => void;
    onLike: (id: string) => void;
    onSave: (id: string) => void;
    onDelete?: (id: string) => void;
    canDelete?: boolean;
    onAvatarPress: (user: { id: string; name: string; avatar: ImageSourcePropType; category: string }) => void;
    batch?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    userId,
    userName,
    userAvatar,
    timePosted,
    category,
    questionTitle,
    questionPreview,
    likeCount = 0,
    commentCount = 0,
    isLiked = false,
    isSaved = false,
    onSeeMore,
    onLike,
    onSave,
    onDelete,
    canDelete = false,
    onAvatarPress,
    batch,
}) => {
    const { theme, isDark } = useAppTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const saveScaleAnim = useRef(new Animated.Value(1)).current;
    const [showOptions, setShowOptions] = useState(false);

    const handleLike = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 100,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start();
        onLike(id);
    };

    const handleSave = () => {
        Animated.sequence([
            Animated.timing(saveScaleAnim, {
                toValue: 1.3,
                duration: 100,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.timing(saveScaleAnim, {
                toValue: 1,
                duration: 100,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
        ]).start();
        onSave(id);
    };

    const handleAvatarPress = () => {
        onAvatarPress({
            id: userId ?? id,
            name: userName,
            avatar: userAvatar,
            category,
        });
    };

    const handleDelete = () => {
        setShowOptions(false);
        onDelete?.(id);
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={handleAvatarPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarRing}>
                        <Image source={userAvatar} style={styles.avatar} />
                    </View>
                    <View>
                        <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
                        <Text style={[styles.postMeta, { color: theme.textMuted }]}>
                            posted {timePosted} in <Text style={[styles.category, { color: theme.primary }]}>{category}</Text>
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.moreBtn, { backgroundColor: theme.surfaceSoft }]}
                    onPress={() => setShowOptions(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Content - Clickable to open details */}
            <TouchableOpacity onPress={() => onSeeMore(id)} activeOpacity={0.8}>
                <Text style={[styles.title, { color: theme.text }]}>{questionTitle}</Text>
                <Text style={[styles.body, { color: theme.textMuted }]} numberOfLines={3}>
                    {questionPreview}
                </Text>
            </TouchableOpacity>

            {/* Actions Row */}
            <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
                {/* Like Button */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Ionicons
                            name={isLiked ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isLiked ? '#EF4444' : theme.textMuted}
                        />
                    </Animated.View>
                    <Text style={[styles.actionText, { color: theme.textMuted }, isLiked && styles.actionTextLiked]}>
                        {likeCount + (isLiked ? 1 : 0)}
                    </Text>
                </TouchableOpacity>

                {/* Comment Button */}
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onSeeMore(id)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={theme.textMuted} />
                    <Text style={[styles.actionText, { color: theme.textMuted }]}>{commentCount}</Text>
                </TouchableOpacity>

                {/* Save Button - Right most */}
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}
                    activeOpacity={0.7}
                >
                    <Animated.View style={{ transform: [{ scale: saveScaleAnim }] }}>
                        <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={isSaved ? theme.primary : theme.textMuted}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Options Modal */}
            <Modal
                transparent
                visible={showOptions}
                animationType="fade"
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
                    <View style={[styles.modalOverlay, { backgroundColor: theme.modalBackdrop }]}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.optionSheet, { backgroundColor: theme.surface }]}>
                                <View style={[styles.optionHandle, { backgroundColor: theme.border }]} />
                                <Text style={[styles.optionTitle, { color: theme.text }]}>{userName}'s Post</Text>
                                
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setShowOptions(false);
                                        onSeeMore(id);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.optionIcon, { backgroundColor: isDark ? '#213149' : '#EEF0FA' }]}>
                                        <Ionicons name="eye" size={20} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.optionText, { color: theme.text }]}>View Post</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={handleSave}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.optionIcon, { backgroundColor: isDark ? '#20352B' : '#F0FDF4' }]}>
                                        <Ionicons
                                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                            size={20}
                                            color="#22C55E"
                                        />
                                    </View>
                                    <Text style={[styles.optionText, { color: theme.text }]}>
                                        {isSaved ? 'Unsave Post' : 'Save Post'}
                                    </Text>
                                </TouchableOpacity>

                                {canDelete && onDelete ? (
                                    <TouchableOpacity
                                        style={styles.optionItem}
                                        onPress={handleDelete}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.optionIcon, { backgroundColor: isDark ? '#3C1E23' : '#FEE2E2' }]}>
                                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        </View>
                                        <Text style={[styles.optionText, { color: '#EF4444' }]}>
                                            Delete Post
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}

                                <TouchableOpacity
                                    style={[styles.cancelBtn, { backgroundColor: theme.surfaceSoft }]}
                                    onPress={() => setShowOptions(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(91,106,240,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 2,
    },
    postMeta: {
        fontSize: 12,
        color: TEXT_MUTED,
    },
    category: {
        color: ACCENT,
        fontWeight: '600',
    },
    moreBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F2FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 8,
        lineHeight: 24,
    },
    body: {
        fontSize: 14,
        color: TEXT_MUTED,
        lineHeight: 21,
        marginBottom: 16,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F2FA',
        gap: 24,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_MUTED,
    },
    actionTextLiked: {
        color: '#EF4444',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    // Options Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(30,26,46,0.5)',
        justifyContent: 'flex-end',
    },
    optionSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 36,
    },
    optionHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT_DARK,
        textAlign: 'center',
        marginBottom: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    optionIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    cancelBtn: {
        marginTop: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
    },
});

export default QuestionCard;
