import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface ChatListItemProps {
    id: string;
    name: string;
    message: string;
    time: string;
    unreadCount?: number;
    avatar: string;
    onPress: (id: string) => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
    id,
    name,
    message,
    time,
    unreadCount,
    avatar,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress(id)}>
            <Image source={{ uri: avatar }} style={styles.avatar} />

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.time}>{time}</Text>
                </View>

                <View style={styles.messageRow}>
                    <Text style={styles.message} numberOfLines={1}>
                        {message}
                    </Text>
                    {unreadCount && unreadCount > 0 ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9', // Subtle separator
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#F8FAFC',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A', // Darker slate
        letterSpacing: 0.3,
    },
    time: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        fontSize: 15,
        color: '#64748B', // Muted slate
        flex: 1,
        marginRight: 12,
        lineHeight: 20,
    },
    badge: {
        backgroundColor: '#3B82F6', // Brighter blue
        borderRadius: 12,
        height: 22,
        minWidth: 22,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

export default ChatListItem;
