import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MenuItemProps {
    icon: string;
    iconColor: string;
    iconBg: string;
    label: string;
    rightElement?: React.ReactNode;
}

export const ProfileMenuItem: React.FC<MenuItemProps> = ({ icon, iconColor, iconBg, label, rightElement }) => {
    return (
        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.smallIcon, { backgroundColor: iconBg }]}>
                    <Icon name={icon} size={20} color={iconColor} />
                </View>
                <Text style={styles.menuText}>{label}</Text>
            </View>
            {rightElement || <Icon name="chevron-right" size={24} color="#CBD5E1" />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    smallIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
});
