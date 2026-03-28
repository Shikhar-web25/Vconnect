import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ACCENT = '#5B6AF0';

interface FloatingFABProps {
    onPress: () => void;
}

const FloatingFAB: React.FC<FloatingFABProps> = ({ onPress }) => {
    return (
        <TouchableOpacity
            style={styles.fab}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: ACCENT,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});

export default FloatingFAB;
