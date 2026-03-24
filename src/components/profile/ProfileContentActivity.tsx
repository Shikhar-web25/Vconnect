import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileMenuItem } from './ProfileMenuItem';

const ProfileContentActivity = ({
    postsCount = 0,
    savedCount = 0,
}: {
    postsCount?: number;
    savedCount?: number;
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>CONTENT & ACTIVITY</Text>

            <View style={styles.menuCard}>
                <ProfileMenuItem
                    icon="text-box-outline"
                    iconColor="#0284C7"
                    iconBg="#E0F2FE"
                    label="Published Posts"
                    rightElement={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{postsCount}</Text>
                            </View>
                        </View>
                    }
                />

                <View style={styles.divider} />

                <ProfileMenuItem
                    icon="bookmark"
                    iconColor="#4F46E5"
                    iconBg="#E0E7FF"
                    label="Saved Knowledge"
                    rightElement={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{savedCount}</Text>
                            </View>
                        </View>
                    }
                />
            </View>

            <Text style={styles.sectionHeader}>SYSTEM</Text>

            <View style={[styles.menuCard, { marginBottom: 40 }]}>
                <ProfileMenuItem
                    icon="cog"
                    iconColor="#64748B"
                    iconBg="#F1F5F9"
                    label="Account Settings"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16,
    },
    countBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 8,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0284C7',
    },
});

export default ProfileContentActivity;
