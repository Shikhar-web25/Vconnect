import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface Props {
    name: string;
    image?: string;
}

const MentorAvatar: React.FC<Props> = ({ name, image }) => {
    return (
        <View style={styles.container}>
            <View style={styles.avatarWrapper}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                    <Text style={styles.more}>⋯</Text>
                )}
            </View>
            <Text style={styles.name}>{name}</Text>
        </View>
    );
};

export default MentorAvatar;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginRight: 20,
    },
    avatarWrapper: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)", // Subtle semi-transparent ring
        padding: 3,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 32,
        backgroundColor: '#CBD5E1', // Fallback color
    },
    name: {
        marginTop: 8,
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "600",
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    more: {
        color: "#FFFFFF",
        fontSize: 24,
        marginTop: -4,
    },
});
