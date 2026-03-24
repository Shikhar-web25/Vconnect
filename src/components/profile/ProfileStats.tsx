import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const ProfileStats = ({
    questionsAsked = 0,
    answersProvided = 0,
}: {
    questionsAsked?: number;
    answersProvided?: number;
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>ENGAGEMENT ACTIVITY</Text>

            <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.blueCard]}>
                    <Icon name="message-text-outline" size={28} color="#fff" style={styles.statIcon} />
                    <Text style={styles.statNumberLight}>{questionsAsked}</Text>
                    <Text style={styles.statLabelLight}>QUESTIONS ASKED</Text>
                </View>

                <View style={[styles.statCard, styles.whiteCard]}>
                    <Icon name="message-reply-text-outline" size={28} color="#4A6D8C" style={styles.statIcon} />
                    <Text style={styles.statNumberDark}>{answersProvided}</Text>
                    <Text style={styles.statLabelDark}>ANSWERS PROVIDED</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 10,
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 50) / 2,
        padding: 20,
        borderRadius: 16,
        height: 160,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    blueCard: {
        backgroundColor: '#4A6D8C',
    },
    whiteCard: {
        backgroundColor: '#fff',
    },
    statIcon: {
        marginBottom: 20,
    },
    statNumberLight: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabelLight: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.5,
    },
    statNumberDark: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    statLabelDark: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        letterSpacing: 0.5,
    },
});

export default ProfileStats;
