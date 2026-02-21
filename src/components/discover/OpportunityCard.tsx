import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const OpportunityCard = ({
  type,
  title,
  daysAgo,
  description,
  image,
  parallaxTranslateY,
}: any) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("OpportunityDetail", {
          item: { type, title, daysAgo, description, image },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: image }}
          style={[
            styles.image,
            { transform: [{ translateY: parallaxTranslateY || 0 }] },
          ]}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default OpportunityCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },
  imageContainer: { height: 190, overflow: "hidden" },
  image: { width: "100%", height: 220 },
  content: { padding: 16 },
  type: { fontWeight: "700", color: "#4A6D8C" },
  title: { fontSize: 20, fontWeight: "700", marginVertical: 8 },
  desc: { color: "#475569" },
});