import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    Text,
    ImageBackground
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatDetailHeader from '../components/dm/ChatDetailHeader';
import ChatBubble from '../components/dm/ChatBubble';
import { RootStackParamList } from '../navigation/AuthNavigator';

type ChatDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

interface Message {
    id: string;
    text: string;
    time: string;
    isMe: boolean;
}

const ChatDetailScreen = () => {
    const route = useRoute<ChatDetailScreenRouteProp>();
    const { chatId, name, avatar } = route.params;
    const [inputText, setInputText] = useState('');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "I've reviewed your graph theory logic. The implementation of Dijkstra's looks solid, but check the edge cases for negative weights.",
            time: '19:45',
            isMe: false,
        },
        {
            id: '2',
            text: "Thanks! I'll re-check the Bellman-Ford approach for the negative cycles then. Did you see the update on the research notes?",
            time: '19:48',
            isMe: true,
        },
        {
            id: '3',
            text: "Yes, much better clarity now. Let's discuss it in the lab tomorrow.",
            time: '19:50',
            isMe: false
        },
        {
            id: '4',
            text: "Perfect. See you at 10 AM! 🚀",
            time: '19:51',
            isMe: true
        }
    ]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <View style={styles.container}>
            <ChatDetailHeader name={name} avatar={avatar} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <View style={styles.chatBackground}>
                    <View style={styles.datePillContainer}>
                        <View style={styles.datePill}>
                            <Text style={styles.dateText}>TODAY, 19:45</Text>
                        </View>
                    </View>

                    <FlatList
                        style={{ flex: 1 }}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ChatBubble
                                text={item.text}
                                time={item.time}
                                isMe={item.isMe}
                                avatar={avatar}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="add" size={24} color="#64748B" />
                        </TouchableOpacity>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type a message..."
                                placeholderTextColor="#94A3B8"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity style={styles.emojiButton}>
                                <Icon name="emoticon-happy-outline" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSend}
                        >
                            <Ionicons name="send" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4A6D8C', // Match header
    },
    keyboardView: {
        flex: 1,
    },
    chatBackground: {
        flex: 1,
        backgroundColor: '#F1F5F9', // Clean light gray/slate background
    },
    datePillContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    datePill: {
        backgroundColor: 'rgba(71, 85, 105, 0.1)', // Subtle dark pill
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },
    dateText: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    listContent: {
        paddingHorizontal: 8, // More padding
        paddingBottom: 20,
        paddingTop: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        backgroundColor: '#FFFFFF', // White background for input area
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 8,
    },
    attachButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        minHeight: 46,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
        padding: 0,
        fontWeight: '400',
    },
    emojiButton: {
        marginLeft: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4A6D8C', // Brand color
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A6D8C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default ChatDetailScreen;
