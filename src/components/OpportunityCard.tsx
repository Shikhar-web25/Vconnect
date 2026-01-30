import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../theme/colors";

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
          <Icon name="arrow-forward" size={14} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OpportunityCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    color: COLORS.muted,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 10,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readText: {
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
});
