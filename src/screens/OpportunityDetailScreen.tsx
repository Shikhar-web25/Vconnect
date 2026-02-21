import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";

const OpportunityDetailScreen = ({ route }: any) => {
  const { item } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
      </View>
    </ScrollView>
  );
};

export default OpportunityDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 260 },
  content: { padding: 20 },
  type: { color: "#4A6D8C", fontWeight: "700" },
  title: { fontSize: 26, fontWeight: "800", marginVertical: 10 },
  desc: { lineHeight: 24, color: "#334155" },
});