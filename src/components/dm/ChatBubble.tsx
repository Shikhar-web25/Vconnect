import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ChatBubbleProps {
    text: string;
    time: string;
    isMe: boolean;
    avatar?: string;
    reactions?: string[];
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, time, isMe, avatar, reactions }) => {
    return (
        <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
            {!isMe && avatar && (
                <Image source={{ uri: avatar }} style={styles.avatar} />
            )}

            <View style={[styles.bubbleWrapper, isMe ? styles.wrapperMe : styles.wrapperOther]}>
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
                        {text}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
                        {time}
                    </Text>
                </View>

                {/* Reactions */}
                {reactions && reactions.length > 0 && (
                    <View style={[styles.reactionContainer, isMe ? styles.reactionMe : styles.reactionOther]}>
                        <Text style={styles.reactionText}>{reactions.join(' ')}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4, // Tighter grouping
        paddingHorizontal: 16,
        width: '100%',
    },
    containerMe: {
        justifyContent: 'flex-end',
    },
    containerOther: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        borderColor: '#F8FAFC',
        borderWidth: 1,
        marginTop: 'auto', // Align bottom
    },
    bubbleWrapper: {
        maxWidth: '75%',
        position: 'relative',
    },
    wrapperMe: {
        alignItems: 'flex-end',
    },
    wrapperOther: {
        alignItems: 'flex-start',
    },
    bubble: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingBottom: 24, // Space for time
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bubbleMe: {
        backgroundColor: '#4A6D8C', // Primary brand color
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.2,
    },
    textMe: {
        color: '#FFFFFF',
    },
    textOther: {
        color: '#1E293B',
    },
    timeText: {
        fontSize: 10,
        position: 'absolute',
        bottom: 6,
        right: 12,
        fontWeight: '500',
    },
    timeMe: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    timeOther: {
        color: '#94A3B8',
    },
    reactionContainer: {
        position: 'absolute',
        bottom: -14,
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    reactionMe: {
        right: 0,
    },
    reactionOther: {
        left: 0,
    },
    reactionText: {
        fontSize: 12,
    },
});

export default ChatBubble;
