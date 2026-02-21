import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

import MentorAvatar from "../components/discover/MentorAvatar";
import OpportunityCard from "../components/discover/OpportunityCard";
import FloatingFAB from "../components/home/FloatingFAB";

const DiscoverScreen = () => {
  const navigation = useNavigation<any>();

  const profiles = [
    { name: "Dr. Alex", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sarah W.", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Marcus C.", image: "https://randomuser.me/api/portraits/men/75.jpg" },
    { name: "Lisa K.", image: "https://randomuser.me/api/portraits/women/65.jpg" },
  ];

  const opportunities = [
    {
      id: "1",
      type: "Internship",
      title: "Software Engineering Intern at Tech Corp",
      daysAgo: "2 days ago",
      image: "https://picsum.photos/400/200",
      description: "Join our development team and build scalable apps.",
    },
    {
      id: "2",
      type: "Research",
      title: "Summer Research Program: AI Ethics",
      daysAgo: "5 days ago",
      image: "https://picsum.photos/400/201",
      description: "Explore AI and human rights with funded research.",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A6D8C" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={24} color="#64748B" />
            <TextInput
              placeholder="Profiles or opportunities..."
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* MAIN LIST */}
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          ListHeaderComponent={
            <>
              {/* TOP PROFILES SECTION */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Profiles</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("AllSeniors")}
                >
                  <Text style={styles.viewAll}>View More</Text>
                </TouchableOpacity>
              </View>

              {/* HORIZONTAL PROFILE SCROLL */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingLeft: 20,
                  paddingRight: 10,
                }}
              >
                {profiles.map((p, i) => (
                  <View key={i} style={{ marginRight: 16 }}>
                    <MentorAvatar name={p.name} image={p.image} />
                  </View>
                ))}
              </ScrollView>

              {/* OPPORTUNITIES TITLE */}
              <View style={styles.feed}>
                <Text style={styles.feedTitle}>Opportunities</Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <OpportunityCard {...item} />
            </View>
          )}
        />

        {/* FLOATING BUTTON */}
        <FloatingFAB onPress={() => console.log("Add")} />
      </SafeAreaView>
    </View>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4A6D8C" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },

  searchContainer: {
    backgroundColor: "#4A6D8C",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  viewAll: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },

  feed: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  feedTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  cardWrapper: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
});