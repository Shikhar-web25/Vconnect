import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const OpportunityDetailScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const item = route?.params?.item;

  // Safety fallback if no item passed
  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>No details available.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>‹</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        {/* Content */}
        <View style={styles.content}>
          {item.type && <Text style={styles.type}>{item.type}</Text>}
          {item.title && <Text style={styles.title}>{item.title}</Text>}
          {item.description && (
            <Text style={styles.desc}>{item.description}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OpportunityDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Back Button
  backBtn: {
    position: "absolute",
    top: Platform.OS === "android" ? 16 : 12,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtnText: {
    fontSize: 26,
    color: "#1e293b",
    lineHeight: 30,
    fontWeight: "400",
  },

  // Image
  image: {
    width: "100%",
    height: 260,
  },
  imagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#e2e8f0",
  },

  // Content
  content: {
    padding: 20,
  },
  type: {
    color: "#5e7da0",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
    lineHeight: 32,
  },
  desc: {
    lineHeight: 24,
    color: "#334155",
    fontSize: 15,
  },

  // Fallback
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  fallbackText: {
    fontSize: 16,
    color: "#64748b",
  },
  backLink: {
    fontSize: 15,
    color: "#5e7da0",
    fontWeight: "600",
  },
});