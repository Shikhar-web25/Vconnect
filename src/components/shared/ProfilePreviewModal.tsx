import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageSourcePropType } from 'react-native';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';
const { width: SW } = Dimensions.get('window');

export interface ProfilePreviewUser {
    id: string;
    name: string;
    avatar: ImageSourcePropType;
    about?: string;
    batch?: string;
    category?: string;
}

interface ProfilePreviewModalProps {
    visible: boolean;
    user: ProfilePreviewUser | null;
    onClose: () => void;
    onMessage: (user: ProfilePreviewUser) => void;
    onViewProfile: () => void;
}

const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
    visible,
    user,
    onClose,
    onMessage,
    onViewProfile,
}) => {
    if (!user) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.previewOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.previewCard}>
                            {/* V-shaped accent on top */}
                            <View style={styles.previewVTop}>
                                <View style={styles.previewVSolid} />
                                <View style={styles.previewVTriangle} />
                            </View>
                            
                            {/* Avatar with glow */}
                            <View style={styles.previewAvatarGlow}>
                                <View style={styles.previewAvatarInner}>
                                    <Image source={user.avatar} style={styles.previewAvatar} />
                                </View>
                            </View>
                            
                            <Text style={styles.previewName}>{user.name}</Text>
                            <Text style={styles.previewAbout}>
                                {user.about || 'Hey there! I am using Vconnect'}
                            </Text>
                            
                            {user.batch && (
                                <View style={styles.previewTag}>
                                    <Ionicons name="school" size={12} color={DEEP} style={{ marginRight: 4 }} />
                                    <Text style={styles.previewTagText}>Batch {user.batch}</Text>
                                </View>
                            )}
                            
                            {user.category && (
                                <View style={[styles.previewTag, { backgroundColor: '#EEF2FF', marginTop: 6 }]}>
                                    <Ionicons name="book" size={12} color={ACCENT} style={{ marginRight: 4 }} />
                                    <Text style={[styles.previewTagText, { color: ACCENT }]}>{user.category}</Text>
                                </View>
                            )}
                            
                            {/* Actions */}
                            <View style={styles.previewActions}>
                                <TouchableOpacity
                                    style={styles.previewBtnPrimary}
                                    onPress={() => onMessage(user)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="chatbubble" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                    <Text style={styles.previewBtnPrimaryText}>Message</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.previewBtnSecondary}
                                    onPress={onViewProfile}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="person" size={16} color={DEEP} style={{ marginRight: 6 }} />
                                    <Text style={styles.previewBtnSecondaryText}>View Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 12, 40, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewCard: {
        width: SW * 0.78,
        backgroundColor: '#FFF',
        borderRadius: 28,
        alignItems: 'center',
        paddingBottom: 24,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    previewVTop: {
        width: '100%',
        height: 100,
        alignItems: 'center',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    previewVSolid: {
        width: '100%',
        height: 60,
        backgroundColor: DEEP,
    },
    previewVTriangle: {
        width: 0,
        height: 0,
        borderTopWidth: 40,
        borderTopColor: DEEP,
        borderLeftWidth: SW * 0.4,
        borderLeftColor: 'transparent',
        borderRightWidth: SW * 0.4,
        borderRightColor: 'transparent',
    },
    previewAvatarGlow: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(91,106,240,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -45,
        zIndex: 10,
        elevation: 12,
        shadowColor: ACCENT,
        shadowOpacity: 0.5,
        shadowRadius: 18,
    },
    previewAvatarInner: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    previewAvatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
    },
    previewName: {
        fontSize: 20,
        fontWeight: '800',
        color: TEXT_DARK,
        marginTop: 12,
    },
    previewAbout: {
        fontSize: 13,
        color: TEXT_MUTED,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    previewTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2FA',
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginTop: 10,
    },
    previewTagText: {
        fontSize: 11,
        fontWeight: '700',
        color: DEEP,
    },
    previewActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 18,
        paddingHorizontal: 20,
        width: '100%',
    },
    previewBtnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ACCENT,
        paddingVertical: 12,
        borderRadius: 14,
        elevation: 3,
        shadowColor: ACCENT,
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    previewBtnPrimaryText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    previewBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F2FA',
        paddingVertical: 12,
        borderRadius: 14,
    },
    previewBtnSecondaryText: {
        color: DEEP,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ProfilePreviewModal;
