import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Props {
    type: string;
    title: string;
    description: string;
    image: string;
    daysAgo: string;
}

const OpportunityCard: React.FC<Props> = ({
    type,
    title,
    description,
    image,
    daysAgo,
}) => {
    return (
        <View style={styles.card}>
            <Image source={{ uri: image }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.tag}>{type}</Text>
                    <Text style={styles.time}>{daysAgo}</Text>
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.desc} numberOfLines={2}>
                    {description}
                </Text>

                <TouchableOpacity style={styles.readMore}>
                    <Text style={styles.readText}>Read More</Text>
                    <Icon name="arrow-forward" size={16} color="#4A6D8C" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OpportunityCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        marginBottom: 24, // More separation
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 12 }, // Deeper shadow for "float"
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
        // Removed border for cleaner look
    },
    image: {
        width: "100%",
        height: 200, // Cinematic height
    },
    content: {
        padding: 24, // More breathing room
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    tag: {
        backgroundColor: "#E0F2FE", // Sky 100
        color: "#0284C7", // Sky 600
        fontSize: 11,
        fontWeight: "700",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 10,
        overflow: 'hidden',
    },
    time: {
        fontSize: 12,
        color: "#94A3B8", // Slate 400
        fontWeight: "500",
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B", // Slate 800
        marginBottom: 8,
        lineHeight: 26,
    },
    desc: {
        fontSize: 15,
        color: "#64748B", // Slate 500
        marginBottom: 16,
        lineHeight: 22,
    },
    readMore: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    readText: {
        color: "#4A6D8C", // Brand color
        fontWeight: "700",
        fontSize: 14,
        letterSpacing: 0.5,
    },
});
