import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatListItem from '../components/dm/ChatListItem';
import DmHeader from '../components/dm/DmHeader';
import { RootStackParamList } from '../navigation/AuthNavigator';
import { supabase } from '../../supabaseClient';

const DmsScreen = () => {
    const [chats, setChats] = useState<Array<{
        id: string;
        name: string;
        message: string;
        time: string;
        avatar: string;
        unreadCount?: number;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserName, setCurrentUserName] = useState('Student');

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        loadChats();
    }, []);

    const formatTime = (isoDate?: string | null) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const loadChats = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single();

        setCurrentUserName(profile?.full_name ?? profile?.username ?? 'Student');

        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('id, user1, user2, last_message, last_message_at')
            .or(`user1.eq.${user.id},user2.eq.${user.id}`)
            .order('last_message_at', { ascending: false })
            .limit(200);

        if (error || !conversations) {
            setLoading(false);
            return;
        }

        const otherIds = conversations.map((conv: any) =>
            conv.user1 === user.id ? conv.user2 : conv.user1
        );
        if (otherIds.length === 0) {
            setChats([]);
            setLoading(false);
            return;
        }

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', otherIds);

        const profileMap = new Map<string, any>();
        (profiles ?? []).forEach((p: any) => profileMap.set(p.id, p));

        const mapped = otherIds.map((id, index) => {
            const convo = conversations[index];
            const profileData = profileMap.get(id);
            return {
                id,
                name: profileData?.full_name ?? profileData?.username ?? 'Student',
                message: convo?.last_message ?? '',
                time: formatTime(convo?.last_message_at),
                avatar: profileData?.avatar_url ?? 'https://i.pravatar.cc/150?img=12',
                unreadCount: 0,
            };
        });

        setChats(mapped);
        setLoading(false);
    };

    const handlePress = (id: string) => {
        const chat = chats.find(c => c.id === id);
        if (chat) {
            navigation.navigate('ChatDetail', {
                chatId: chat.id,
                name: chat.name,
                avatar: chat.avatar
            });
        }
    };

    return (
        <View style={styles.container}>
            <DmHeader name={currentUserName} unreadCount={0} />

            <View style={styles.contentContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Chats</Text>
                    <Icon name="ellipsis-horizontal" size={24} color="#8E8E93" />
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search messages..."
                        placeholderTextColor="#8E8E93"
                    />
                </View>

                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ChatListItem
                            {...item}
                            onPress={handlePress}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        loading ? (
                            <View style={styles.emptyState}>
                                <ActivityIndicator size="small" color="#4A6D8C" />
                                <Text style={styles.emptyText}>Loading conversations...</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No messages yet.</Text>
                            </View>
                        )
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4A6D8C', // Matches top gradient start for safe area fill if needed
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -50,
        paddingHorizontal: 20,
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10, // Shadow for Android
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    searchIcon: {
        marginRight: 12,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        padding: 0,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 10,
        color: '#94A3B8',
        fontSize: 14,
    },
});

export default DmsScreen;
