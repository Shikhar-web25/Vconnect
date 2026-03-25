import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileMenuItem } from './ProfileMenuItem';

const ProfileMenu = () => {
    return (
        <View style={styles.menuCard}>
            <ProfileMenuItem
                icon="chart-bar"
                iconColor="#0284C7"
                iconBg="#E0F2FE"
                label="Full Reputation Analytics"
            />

            <View style={styles.divider} />

            <ProfileMenuItem
                icon="history"
                iconColor="#4F46E5"
                iconBg="#E0E7FF"
                label="Contribution History"
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default ProfileMenu;
