import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

interface Comment {
    id: string;
    userName: string;
    avatar: string;
    text: string;
    time: string;
}

interface QuestionModalProps {
    visible: boolean;
    data: {
        userName: string;
        userAvatar: string;
        category: string;
        questionTitle: string;
        fullAnswer: string;
        comments?: Comment[];
    } | null;
    postId?: string;
    onAddComment?: (postId: string, text: string) => Promise<Comment | null>;
    onClose: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ visible, data, postId, onAddComment, onClose }) => {
    const [newComment, setNewComment] = useState('');
    const [localComments, setLocalComments] = useState<Comment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (data?.comments) {
            setLocalComments(data.comments);
        } else {
            setLocalComments([]);
        }
    }, [data]);

    // Reset comment input when modal closes
    useEffect(() => {
        if (!visible) {
            setNewComment('');
        }
    }, [visible]);

    if (!data) return null;

    const handleAddComment = async () => {
        const content = newComment.trim();
        if (!content || isSubmitting) return;

        if (onAddComment && postId) {
            setIsSubmitting(true);
            const inserted = await onAddComment(postId, content);
            if (inserted) {
                setLocalComments([...localComments, inserted]);
                setNewComment('');
                Keyboard.dismiss();
            }
            setIsSubmitting(false);
            return;
        }

        const comment: Comment = {
            id: Date.now().toString(),
            userName: 'You',
            avatar: 'https://i.pravatar.cc/150?img=12',
            text: content,
            time: 'Just now',
        };

        setLocalComments([...localComments, comment]);
        setNewComment('');
        Keyboard.dismiss();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={0}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.modalBackdrop}>
                            <BlurView
                                style={styles.absolute}
                                blurType="light"
                                blurAmount={10}
                                reducedTransparencyFallbackColor="white"
                            />
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={styles.modalContentWrapper}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={styles.userInfo}>
                                    <Image source={{ uri: data.userAvatar }} style={styles.avatarSmall} />
                                    <View>
                                        <Text style={styles.userName}>{data.userName}</Text>
                                        <Text style={styles.postMeta}>{data.category}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Icon name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <Text style={styles.modalTitle}>{data.questionTitle}</Text>
                                <View style={styles.divider} />

                                <Text style={styles.sectionTitle}>Answer</Text>
                                <Text style={styles.modalBody}>{data.fullAnswer}</Text>

                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>Comments ({localComments.length})</Text>
                                <View style={styles.commentsList}>
                                    {localComments.map((comment) => (
                                        <View key={comment.id} style={styles.commentItem}>
                                            <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                                            <View style={styles.commentContent}>
                                                <View style={styles.commentHeader}>
                                                    <Text style={styles.commentName}>{comment.userName}</Text>
                                                    <Text style={styles.commentTime}>{comment.time}</Text>
                                                </View>
                                                <Text style={styles.commentText}>{comment.text}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <View style={{ height: 20 }} />
                            </ScrollView>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Write a comment..."
                                    placeholderTextColor="#94A3B8"
                                    value={newComment}
                                    onChangeText={setNewComment}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled
                                    ]}
                                    onPress={handleAddComment}
                                    disabled={!newComment.trim() || isSubmitting}
                                >
                                    <Icon
                                        name="send"
                                        size={20}
                                        color={newComment.trim() && !isSubmitting ? "#fff" : "#CBD5E1"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    absolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    modalContentWrapper: {
        width: '100%',
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 10,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxHeight: '100%',
        flexShrink: 1, // Allow shrinking if parent constrains
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    postMeta: {
        fontSize: 13,
        color: '#64748B',
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
    },
    modalScroll: {
        flexGrow: 0,
        flexShrink: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 16,
        lineHeight: 28,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalBody: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
    },
    commentsList: {
        marginTop: 4,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderTopLeftRadius: 0,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
    },
    commentTime: {
        fontSize: 11,
        color: '#94A3B8',
    },
    commentText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#334155',
        marginRight: 12,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4A6D8C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#CBD5E1',
    },
});

export default QuestionModal;
