import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    LayoutAnimation,
    UIManager,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { getMaleAvatar, getFemaleAvatar } from '../utils/avatar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const BG = '#E8EAF6';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';
const { width: SW } = Dimensions.get('window');

const FILTERS = ['All', 'Unread', 'Pinned'] as const;

const initialChats = [
    { id: '1',  name: 'Aryan Sharma',    message: 'Hey! What are you up to?',                time: '2m ago',    unreadCount: 2, pinned: false, avatar: getMaleAvatar(0),   batch: '2025', about: 'Campus wanderer' },
    { id: '2',  name: 'Sarah Jenkins',   message: 'That lecture was so good today',           time: '15m ago',   unreadCount: 0, pinned: true,  avatar: getFemaleAvatar(0), batch: '2024', about: 'Bookworm' },
    { id: '3',  name: 'Kavya Desai',     message: 'Are you coming to the fest?',              time: '1h ago',    unreadCount: 3, pinned: true,  avatar: getFemaleAvatar(1), batch: '2025', about: 'Living for music' },
    { id: '4',  name: 'Lucas Rocha',     message: 'Thanks for the notes!',                    time: '3h ago',    unreadCount: 0, pinned: false, avatar: getMaleAvatar(1),   batch: '2026', about: 'Future engineer' },
    { id: '5',  name: 'Ishaan Verma',    message: 'That meme was hilarious',                  time: '5h ago',    unreadCount: 1, pinned: false, avatar: getMaleAvatar(2),   batch: '2024', about: 'Meme lord' },
    { id: '6',  name: 'Elena Rodriguez', message: 'See you at the cafeteria!',                time: 'Yesterday', unreadCount: 0, pinned: false, avatar: getFemaleAvatar(2), batch: '2025', about: 'Coffee addict' },
    { id: '7',  name: 'Rohan Gupta',     message: 'Did you watch the match last night?',      time: 'Yesterday', unreadCount: 0, pinned: false, avatar: getMaleAvatar(3),   batch: '2024', about: 'Sports fanatic' },
    { id: '8',  name: 'Emily Chen',      message: 'Happy Birthday!',                          time: 'Yesterday', unreadCount: 0, pinned: false, avatar: getFemaleAvatar(3), batch: '2026', about: 'Art and vibes' },
    { id: '9',  name: 'Neha Patil',      message: "Let's catch up this weekend!",             time: 'Monday',    unreadCount: 0, pinned: false, avatar: getFemaleAvatar(4), batch: '2025', about: 'Explorer' },
    { id: '10', name: 'David Kim',       message: 'Have you tried the new cafe?',             time: 'Monday',    unreadCount: 0, pinned: false, avatar: getMaleAvatar(4),   batch: '2024', about: 'Foodie' },
    { id: '11', name: 'Siddharth Rao',   message: 'Can you share your playlist?',             time: 'Sunday',    unreadCount: 0, pinned: false, avatar: getMaleAvatar(0),   batch: '2026', about: 'Music is life' },
    { id: '12', name: 'Sophia Muller',   message: 'That movie was amazing btw',               time: 'Sunday',    unreadCount: 0, pinned: false, avatar: getFemaleAvatar(0), batch: '2025', about: 'Cinema lover' },
    { id: '13', name: 'Ananya Iyer',     message: 'Tomorrow same time?',                      time: 'Saturday',  unreadCount: 2, pinned: false, avatar: getFemaleAvatar(1), batch: '2024', about: 'Dancer' },
    { id: '14', name: "Liam O'Connor",   message: "Let's plan the trip!",                     time: 'Saturday',  unreadCount: 0, pinned: false, avatar: getMaleAvatar(1),   batch: '2025', about: 'Adventure seeker' },
    { id: '15', name: 'Vikram Singh',    message: 'Great talk today!',                        time: 'Friday',    unreadCount: 0, pinned: true,  avatar: getMaleAvatar(2),   batch: '2024', about: 'Tech enthusiast' },
];

// ─── CHAT ITEM ───────────────────────────────────────────
const ChatItem = React.memo(({ item, onPress, onLongPress, onAvatarPress }: any) => {
    const hasUnread = item.unreadCount > 0;
    return (
        <TouchableOpacity style={styles.chatItem} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.6}>
            {hasUnread ? <View style={styles.unreadBar} /> : <View style={styles.unreadBarPlaceholder} />}
            <TouchableOpacity onPress={() => onAvatarPress(item)} activeOpacity={0.8}>
                <View style={styles.avatarRing}>
                    <Image source={item.avatar} style={styles.chatAvatar} />
                </View>
            </TouchableOpacity>
            <View style={styles.chatInfo}>
                <View style={styles.nameTimeRow}>
                    <View style={styles.nameRow}>
                        {item.pinned ? <Ionicons name="pin" size={11} color={ACCENT} style={{ marginRight: 3, transform: [{ rotate: '45deg' }] }} /> : null}
                        <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text style={[styles.chatTime, hasUnread && { color: ACCENT }]}>{item.time}</Text>
                </View>
                <Text style={[styles.chatMsg, hasUnread && styles.chatMsgUnread]} numberOfLines={1}>{item.message}</Text>
            </View>
            {hasUnread ? (
                <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{item.unreadCount}</Text></View>
            ) : null}
        </TouchableOpacity>
    );
});

// ─── MAIN SCREEN ─────────────────────────────────────────
const DmsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [searchText, setSearchText] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [chats, setChats] = useState(initialChats);
    const [optionChat, setOptionChat] = useState<typeof initialChats[0] | null>(null);
    const [previewUser, setPreviewUser] = useState<typeof initialChats[0] | null>(null);

    const filteredChats = useMemo(() => {
        return chats.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(searchText.toLowerCase()) || c.message.toLowerCase().includes(searchText.toLowerCase());
            const matchFilter = activeFilter === 'All' || (activeFilter === 'Unread' ? c.unreadCount > 0 : c.pinned);
            return matchSearch && matchFilter;
        });
    }, [chats, searchText, activeFilter]);

    const handlePress = useCallback((c: typeof initialChats[0]) => {
        navigation.navigate('ChatDetail', { chatId: c.id, name: c.name, avatar: c.avatar });
    }, [navigation]);

    const handleDelete = useCallback((id: string) => {
        setOptionChat(null);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setChats(prev => prev.filter(c => c.id !== id));
    }, []);

    const handleTogglePin = useCallback((id: string) => {
        setOptionChat(null);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    }, []);

    const goToProfile = useCallback(() => {
        navigation.navigate('UserProfile', {
            name: 'Prateek', avatar: getMaleAvatar(0),
            about: 'Hey there! I am using Vconnect', bio: 'Living the college life', contributions: 87,
        });
    }, [navigation]);

    const viewFullProfile = useCallback((user: typeof initialChats[0]) => {
        setPreviewUser(null);
        navigation.navigate('UserProfile', {
            name: user.name, avatar: user.avatar,
            about: user.about, bio: user.about, contributions: Math.floor(Math.random() * 100) + 20,
        });
    }, [navigation]);

    const messageUser = useCallback((user: typeof initialChats[0]) => {
        setPreviewUser(null);
        navigation.navigate('ChatDetail', { chatId: user.id, name: user.name, avatar: user.avatar });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} translucent={false} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerCard}>
                    <View>
                        <Text style={styles.headerTitle}>Messages</Text>
                        <Text style={styles.headerSub}>{filteredChats.length} CONVERSATIONS</Text>
                    </View>
                    <TouchableOpacity onPress={goToProfile} activeOpacity={0.8}>
                        <View style={styles.profileRing}>
                            <Image source={getMaleAvatar(0)} style={styles.profileAvatar} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.glassSearch}>
                    <Ionicons name="search-outline" size={18} color={ACCENT} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search messages..."
                        placeholderTextColor="#A0AEC0"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={18} color={TEXT_MUTED} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Filters */}
                <View style={styles.filterRow}>
                    {FILTERS.map(f => {
                        const active = activeFilter === f;
                        return (
                            <TouchableOpacity key={f} style={[styles.chip, active && styles.chipActive]} onPress={() => setActiveFilter(f)} activeOpacity={0.7}>
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Chat List */}
                <FlatList
                    data={filteredChats}
                    keyExtractor={i => i.id}
                    renderItem={({ item }) => (
                        <ChatItem
                            item={item}
                            onPress={() => handlePress(item)}
                            onLongPress={() => setOptionChat(item)}
                            onAvatarPress={(u: typeof initialChats[0]) => setPreviewUser(u)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={5}
                    windowSize={7}
                    removeClippedSubviews
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Ionicons name="chatbubble-ellipses-outline" size={56} color="#C7CAE0" />
                            <Text style={styles.emptyText}>No conversations found</Text>
                        </View>
                    }
                />
            </View>

            {/* ─── PROFILE PREVIEW MODAL (blurred/translucent bg) ─── */}
            <Modal transparent visible={!!previewUser} animationType="fade" onRequestClose={() => setPreviewUser(null)}>
                <TouchableWithoutFeedback onPress={() => setPreviewUser(null)}>
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
                                        <Image source={previewUser?.avatar} style={styles.previewAvatar} />
                                    </View>
                                </View>
                                <Text style={styles.previewName}>{previewUser?.name}</Text>
                                <Text style={styles.previewAbout}>{previewUser?.about}</Text>
                                <View style={styles.previewTag}>
                                    <Ionicons name="school" size={12} color={DEEP} style={{ marginRight: 4 }} />
                                    <Text style={styles.previewTagText}>Batch {previewUser?.batch}</Text>
                                </View>
                                {/* Actions */}
                                <View style={styles.previewActions}>
                                    <TouchableOpacity
                                        style={styles.previewBtnPrimary}
                                        onPress={() => previewUser && messageUser(previewUser)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="chatbubble" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.previewBtnPrimaryText}>Message</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.previewBtnSecondary}
                                        onPress={() => previewUser && viewFullProfile(previewUser)}
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

            {/* ─── OPTIONS BOTTOM SHEET ─── */}
            <Modal transparent visible={!!optionChat} animationType="fade" onRequestClose={() => setOptionChat(null)}>
                <TouchableWithoutFeedback onPress={() => setOptionChat(null)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.optionSheet}>
                                <View style={styles.optionHandle} />
                                <Text style={styles.optionTitle}>{optionChat?.name}</Text>
                                <TouchableOpacity style={styles.optionItem} onPress={() => optionChat && handleTogglePin(optionChat.id)} activeOpacity={0.7}>
                                    <View style={[styles.optionIcon, { backgroundColor: '#EEF0FA' }]}>
                                        <Ionicons name={optionChat?.pinned ? 'pin-outline' : 'pin'} size={20} color={ACCENT} />
                                    </View>
                                    <Text style={styles.optionText}>{optionChat?.pinned ? 'Unpin Chat' : 'Pin Chat'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionItem} onPress={() => optionChat && handleDelete(optionChat.id)} activeOpacity={0.7}>
                                    <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.optionText, { color: '#EF4444' }]}>Delete Chat</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setOptionChat(null)} activeOpacity={0.7}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: BG },
    container: { flex: 1 },
    headerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 14 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: TEXT_DARK, letterSpacing: -0.5 },
    headerSub: { fontSize: 10, fontWeight: '700', color: TEXT_MUTED, marginTop: 3, letterSpacing: 1.2 },
    profileRing: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(91,106,240,0.15)',
        justifyContent: 'center', alignItems: 'center', padding: 3,
    },
    profileAvatar: { width: 42, height: 42, borderRadius: 21 },
    glassSearch: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F0F2FA',
        borderRadius: 18, paddingHorizontal: 16, height: 46,
        marginHorizontal: 20, marginBottom: 12,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: TEXT_DARK, fontWeight: '500' },
    filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, gap: 8 },
    chip: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0F2FA' },
    chipActive: { backgroundColor: ACCENT, elevation: 3, shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 6 },
    chipText: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED },
    chipTextActive: { color: '#FFF', fontWeight: '700' },
    listContent: { paddingHorizontal: 16, paddingBottom: 20 },
    // Chat items — WHITE cards
    chatItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 14, paddingRight: 16, paddingLeft: 0,
        marginBottom: 6,
    },
    unreadBar: { width: 4, height: 42, backgroundColor: ACCENT, borderTopRightRadius: 4, borderBottomRightRadius: 4, marginRight: 12 },
    unreadBarPlaceholder: { width: 4, marginRight: 12, backgroundColor: 'transparent' },
    avatarRing: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: 'rgba(91,106,240,0.12)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    chatAvatar: { width: 44, height: 44, borderRadius: 22 },
    chatInfo: { flex: 1 },
    nameTimeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    chatName: { fontSize: 15, fontWeight: '600', color: TEXT_DARK, flex: 1 },
    chatNameUnread: { fontWeight: '700' },
    chatTime: { fontSize: 11, color: TEXT_MUTED, fontWeight: '500' },
    chatMsg: { fontSize: 13, color: TEXT_MUTED, fontWeight: '400' },
    chatMsgUnread: { color: '#6B7280', fontWeight: '500' },
    unreadBadge: { backgroundColor: ACCENT, borderRadius: 12, minWidth: 22, height: 22, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
    unreadBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
    emptyWrap: { alignItems: 'center', paddingTop: 80 },
    emptyText: { color: TEXT_MUTED, fontSize: 15, fontWeight: '600', marginTop: 12 },
    // ─── Profile Preview Modal ───
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 12, 40, 0.85)',
        justifyContent: 'center', alignItems: 'center',
    },
    previewCard: {
        width: SW * 0.78,
        backgroundColor: '#FFF',
        borderRadius: 28,
        alignItems: 'center',
        paddingBottom: 24,
        elevation: 20,
    },
    // V-shape accent on top of preview card — goes BEHIND avatar
    previewVTop: {
        width: '100%', height: 100,
        alignItems: 'center',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    previewVSolid: {
        width: '100%', height: 60,
        backgroundColor: DEEP,
    },
    previewVTriangle: {
        width: 0, height: 0,
        borderTopWidth: 40, borderTopColor: DEEP,
        borderLeftWidth: SW * 0.4, borderLeftColor: 'transparent',
        borderRightWidth: SW * 0.4, borderRightColor: 'transparent',
    },
    previewAvatarGlow: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: 'rgba(91,106,240,0.2)',
        justifyContent: 'center', alignItems: 'center',
        marginTop: -45, // Backed off slightly so V tip is visible below it
        zIndex: 10,
        elevation: 12,
        shadowColor: ACCENT, shadowOpacity: 0.5, shadowRadius: 18,
    },
    previewAvatarInner: {
        width: 84, height: 84, borderRadius: 42,
        backgroundColor: '#FFF',
        justifyContent: 'center', alignItems: 'center',
        padding: 2,
    },
    previewAvatar: { width: 78, height: 78, borderRadius: 39 },
    previewName: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginTop: 12 },
    previewAbout: { fontSize: 13, color: TEXT_MUTED, fontWeight: '500', marginTop: 4, textAlign: 'center', paddingHorizontal: 24 },
    previewTag: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F0F2FA', paddingVertical: 5, paddingHorizontal: 14,
        borderRadius: 16, marginTop: 10,
    },
    previewTagText: { fontSize: 11, fontWeight: '700', color: DEEP },
    previewActions: { flexDirection: 'row', gap: 10, marginTop: 18, paddingHorizontal: 20, width: '100%' },
    previewBtnPrimary: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 14,
    },
    previewBtnPrimaryText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    previewBtnSecondary: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F0F2FA', paddingVertical: 12, borderRadius: 14,
    },
    previewBtnSecondaryText: { color: DEEP, fontSize: 14, fontWeight: '700' },
    // ─── Options Bottom Sheet ───
    modalOverlay: { flex: 1, backgroundColor: 'rgba(30,26,46,0.4)', justifyContent: 'flex-end' },
    optionSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
    optionHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
    optionTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, textAlign: 'center', marginBottom: 20 },
    optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    optionIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    optionText: { fontSize: 16, fontWeight: '600', color: '#334155' },
    cancelBtn: { marginTop: 10, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    cancelText: { fontSize: 16, fontWeight: '700', color: '#64748B' },
});

export default DmsScreen;