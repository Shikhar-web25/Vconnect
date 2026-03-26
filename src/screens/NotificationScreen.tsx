import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMaleAvatar, getFemaleAvatar } from '../utils/avatar';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const BG = '#E8EAF6';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';
const { width: SW } = Dimensions.get('window');

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'reply';

interface Notification {
    id: string;
    type: NotificationType;
    user: {
        name: string;
        avatar: any;
    };
    content: string;
    time: string;
    read: boolean;
    postTitle?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'like',
        user: { name: 'Aryan Sharma', avatar: getMaleAvatar(0) },
        content: 'liked your post',
        postTitle: 'How to implement Dijkstra\'s algorithm?',
        time: '2m ago',
        read: false,
    },
    {
        id: '2',
        type: 'comment',
        user: { name: 'Sarah Jenkins', avatar: getFemaleAvatar(0) },
        content: 'commented on your post',
        postTitle: 'Tips for memorizing functional groups',
        time: '15m ago',
        read: false,
    },
    {
        id: '3',
        type: 'follow',
        user: { name: 'Kavya Desai', avatar: getFemaleAvatar(1) },
        content: 'started following you',
        time: '1h ago',
        read: false,
    },
    {
        id: '4',
        type: 'mention',
        user: { name: 'Lucas Rocha', avatar: getMaleAvatar(1) },
        content: 'mentioned you in a comment',
        postTitle: 'Quantum entanglement explained',
        time: '2h ago',
        read: true,
    },
    {
        id: '5',
        type: 'like',
        user: { name: 'Emily Chen', avatar: getFemaleAvatar(3) },
        content: 'liked your comment',
        time: '3h ago',
        read: true,
    },
    {
        id: '6',
        type: 'reply',
        user: { name: 'Rohan Gupta', avatar: getMaleAvatar(3) },
        content: 'replied to your comment',
        postTitle: 'Best resources for learning React Native?',
        time: '5h ago',
        read: true,
    },
    {
        id: '7',
        type: 'comment',
        user: { name: 'Neha Patil', avatar: getFemaleAvatar(4) },
        content: 'commented on your post',
        postTitle: 'Study group for finals?',
        time: 'Yesterday',
        read: true,
    },
    {
        id: '8',
        type: 'follow',
        user: { name: 'David Kim', avatar: getMaleAvatar(4) },
        content: 'started following you',
        time: 'Yesterday',
        read: true,
    },
];

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'like':
            return { name: 'heart', color: '#EF4444', bg: '#FEE2E2' };
        case 'comment':
            return { name: 'chatbubble', color: '#3B82F6', bg: '#DBEAFE' };
        case 'follow':
            return { name: 'person-add', color: '#8B5CF6', bg: '#EDE9FE' };
        case 'mention':
            return { name: 'at', color: '#F59E0B', bg: '#FEF3C7' };
        case 'reply':
            return { name: 'arrow-undo', color: '#22C55E', bg: '#DCFCE7' };
        default:
            return { name: 'notifications', color: ACCENT, bg: '#E0E7FF' };
    }
};

const NotificationItem = React.memo(({ item, onPress }: { item: Notification; onPress: () => void }) => {
    const iconInfo = getNotificationIcon(item.type);
    
    return (
        <TouchableOpacity
            style={[styles.notifItem, !item.read && styles.notifItemUnread]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {!item.read && <View style={styles.unreadDot} />}
            
            <View style={styles.avatarContainer}>
                <Image source={item.user.avatar} style={styles.avatar} />
                <View style={[styles.iconBadge, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons name={iconInfo.name as any} size={12} color={iconInfo.color} />
                </View>
            </View>
            
            <View style={styles.notifContent}>
                <Text style={styles.notifText}>
                    <Text style={styles.userName}>{item.user.name}</Text>
                    {' '}{item.content}
                </Text>
                {item.postTitle && (
                    <Text style={styles.postTitle} numberOfLines={1}>
                        "{item.postTitle}"
                    </Text>
                )}
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );
});

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={BG} translucent={false} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllBtn}
                        onPress={markAllAsRead}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="checkmark-done" size={22} color={ACCENT} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
                    onPress={() => setFilter('unread')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
                        Unread
                    </Text>
                    {unreadCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem
                            item={item}
                            onPress={() => markAsRead(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No notifications</Text>
                            <Text style={styles.emptyText}>
                                {filter === 'unread'
                                    ? "You're all caught up!"
                                    : "You don't have any notifications yet"}
                            </Text>
                        </View>
                    }
                />
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: TEXT_DARK,
    },
    countBadge: {
        backgroundColor: ACCENT,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginLeft: 10,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    markAllBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
        gap: 10,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#FFF',
    },
    filterTabActive: {
        backgroundColor: ACCENT,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: TEXT_MUTED,
    },
    filterTextActive: {
        color: '#FFF',
    },
    filterBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
    },
    notifItemUnread: {
        backgroundColor: '#F0F4FF',
        borderLeftWidth: 3,
        borderLeftColor: ACCENT,
    },
    unreadDot: {
        position: 'absolute',
        top: 20,
        left: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ACCENT,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    iconBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    notifContent: {
        flex: 1,
    },
    notifText: {
        fontSize: 14,
        color: TEXT_DARK,
        lineHeight: 20,
    },
    userName: {
        fontWeight: '700',
    },
    postTitle: {
        fontSize: 13,
        color: ACCENT,
        fontWeight: '500',
        marginTop: 4,
    },
    timeText: {
        fontSize: 12,
        color: TEXT_MUTED,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F2FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: TEXT_MUTED,
        textAlign: 'center',
    },
});

export default NotificationScreen;
