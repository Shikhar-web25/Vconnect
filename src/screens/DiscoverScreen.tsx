import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../theme/colors";
import MentorAvatar from "../components/MentorAvatar";
import OpportunityCard from "../components/OpportunityCard";

const DiscoverScreen = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>

        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="rgba(255,255,255,0.7)" />
          <TextInput
            placeholder="Mentors or opportunities..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TOP MENTORS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Mentors</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <MentorAvatar
            name="Dr. Alex"
            image="https://randomuser.me/api/portraits/men/32.jpg"
          />
          <MentorAvatar
            name="Sarah W."
            image="https://randomuser.me/api/portraits/women/44.jpg"
          />
          <MentorAvatar
            name="Marcus C."
            image="https://randomuser.me/api/portraits/men/75.jpg"
          />
          <MentorAvatar name="See More" />
        </ScrollView>

        {/* FEED */}
        <View style={styles.feed}>
          <Text style={styles.feedTitle}>Opportunities</Text>

          <OpportunityCard
            type="Internship"
            title="Software Engineering Intern at Tech Corp"
            daysAgo="2 days ago"
            image="https://picsum.photos/400/200"
            description="Join our fast-paced development team to build scalable cloud solutions and learn from industry leaders."
          />

          <OpportunityCard
            type="Research"
            title="Summer Research Program: AI Ethics"
            daysAgo="5 days ago"
            image="https://picsum.photos/400/201"
            description="Explore the intersection of artificial intelligence and human rights with funded research."
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 16,
  },
  searchInput: {
    marginLeft: 10,
    color: "#fff",
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAll: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  feed: {
    backgroundColor: COLORS.feedBg,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 20,
    marginTop: 24,
  },
  feedTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
