import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileBadges = () => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesScrollView}
            contentContainerStyle={styles.badgesContainer}
        >
            <View style={styles.badgeCard}>
                <View style={[styles.badgeIcon, { backgroundColor: '#E0E7FF' }]}>
                    <Icon name="school" size={24} color="#4F46E5" />
                </View>
                <Text style={styles.badgeText}>MENTOR</Text>
            </View>

            <View style={styles.badgeCard}>
                <View style={[styles.badgeIcon, { backgroundColor: '#E0F2FE' }]}>
                    <Icon name="star" size={24} color="#0EA5E9" />
                </View>
                <Text style={[styles.badgeText, { textAlign: 'center' }]}>TOP{'\n'}CONTRIBUTOR</Text>
            </View>

            <View style={styles.badgeCard}>
                <View style={[styles.badgeIcon, { backgroundColor: '#F3F4F6' }]}>
                    <Icon name="code-tags" size={24} color="#4B5563" />
                </View>
                <Text style={styles.badgeText}>OPEN SOURCE</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    badgesScrollView: {
        marginTop: -40, // Pull up to overlap the header area
        paddingLeft: 20,
        paddingBottom: 10,
        height: 140,
        overflow: 'visible',
    },
    badgesContainer: {
        paddingRight: 20,
    },
    badgeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        width: 130,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    badgeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4A6D8C',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});

export default ProfileBadges;
