import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const DmHeader = ({ name, unreadCount = 0 }: { name: string; unreadCount?: number }) => {
    return (
        <LinearGradient colors={['#4A6D8C', '#6B8CAE']} style={styles.gradientHeader}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.headerContent}>
                    <StatusBar barStyle="light-content" />
                    <Text style={styles.greetingText}>Hi {name}</Text>
                    <Text style={styles.unreadText}>
                        {String(unreadCount).padStart(2, '0')} UNREAD MESSAGES
                    </Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientHeader: {
        height: '25%', // Slightly shorter
        justifyContent: 'center',
    },
    safeArea: {
        flex: 1,
    },
    headerContent: {
        paddingHorizontal: 24,
        justifyContent: 'flex-end',
        flex: 1,
        paddingBottom: 60, // Space for overlap
    },
    greetingText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    unreadText: {
        fontSize: 13,
        color: '#E2E8F0',
        fontWeight: '600',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
});

export default DmHeader;
