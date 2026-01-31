import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../theme/colors";
import MentorAvatar from "../components/discover/MentorAvatar";
import OpportunityCard from "../components/discover/OpportunityCard";

const DiscoverScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A6D8C" />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>

          <View style={styles.searchBox}>
            <Icon name="search" size={24} color="#64748B" />
            <TextInput
              placeholder="Mentors or opportunities..."
              placeholderTextColor="#94A3B8"
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
      </SafeAreaView>
    </View >
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A6D8C', // Premium Slate Blue
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Crisp white pill
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInput: {
    marginLeft: 12,
    color: "#0F172A", // Dark slate text
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  viewAll: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },
  mentorScroll: {
    paddingLeft: 20,
    paddingBottom: 24, // Space for avatar shadows if needed
  },
  feed: {
    backgroundColor: '#F8FAFC', // Very light slate gray
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 32,
    minHeight: 500, // Ensure it fills down
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  feedTitle: {
    color: '#0F172A', // Dark slate
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
});
