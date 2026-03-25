import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatDetailHeaderProps {
    name: string;
    avatar: string;
    isOnline?: boolean;
}

const ChatDetailHeader: React.FC<ChatDetailHeaderProps> = ({ name, avatar, isOnline = true }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.leftContainer}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="chevron-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                            {isOnline && <View style={styles.onlineIndicator} />}
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.name}>{name}</Text>
                            <Text style={styles.status}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4A6D8C', // Matches the design
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: 16, // More breathing room
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 10,
    },
    safeArea: {
        backgroundColor: '#4A6D8C',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 14,
    },
    avatar: {
        width: 44, // Slightly larger
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4ADE80',
        borderWidth: 2,
        borderColor: '#4A6D8C',
    },
    infoContainer: {
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    status: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 20,
        padding: 4,
    },
});

export default ChatDetailHeader;
