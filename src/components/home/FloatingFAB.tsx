import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FloatingFAB = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress}>
            <Icon name="plus" size={32} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4A6D8C',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4A6D8C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default FloatingFAB;
