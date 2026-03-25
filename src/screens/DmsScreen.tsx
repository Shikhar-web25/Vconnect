import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatListItem from '../components/dm/ChatListItem';
import DmHeader from '../components/dm/DmHeader';
import { RootStackParamList } from '../navigation/AuthNavigator';

const DmsScreen = () => {
    // Mock Data based on the image
    const chats = [
        {
            id: '1',
            name: 'Rafael Mante',
            message: "I've reviewed your graph theory logic...",
            time: '19:45',
            avatar: 'https://i.pravatar.cc/150?img=11',
            unreadCount: 0,
        },
        {
            id: '2',
            name: 'Katherine Bernhard',
            message: '✓ Let\'s schedule the organic chem...',
            time: '19:40',
            avatar: 'https://i.pravatar.cc/150?img=5',
            unreadCount: 2,
        },
        {
            id: '3',
            name: 'Terrence Lemke',
            message: 'Your integration parts are correct now.',
            time: '19:32',
            avatar: 'https://i.pravatar.cc/150?img=3',
            unreadCount: 0,
        },
        {
            id: '4',
            name: 'Alyssa Wisozk-Kihn',
            message: 'Did you see the new notes?',
            time: '18:15',
            avatar: 'https://i.pravatar.cc/150?img=1', // Placeholder color avatar in image, utilizing available image for now
            unreadCount: 1,
        },
    ];

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
            <DmHeader />

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
});

export default DmsScreen;
