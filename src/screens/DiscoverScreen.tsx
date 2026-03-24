import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import MentorAvatar from "../components/discover/MentorAvatar";
import OpportunityCard from "../components/discover/OpportunityCard";
import { supabase } from "../../supabaseClient";

const DiscoverScreen = () => {
  const [mentors, setMentors] = useState<Array<{ id: string; name: string; image?: string }>>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    setLoadingMentors(true);
    const { data, error } = await supabase
      .from('mentors')
      .select('id, expertise, experience, year, description, profiles (id, full_name, username, avatar_url)')
      .order('year', { ascending: false })
      .limit(12);

    if (!error) {
      const mapped = (data ?? []).map((row: any) => {
        const profile = row?.profiles ?? null;
        const name = profile?.full_name ?? profile?.username ?? 'Mentor';
        return {
          id: row.id,
          name,
          image: profile?.avatar_url ?? undefined,
        };
      });
      setMentors(mapped);
    }
    setLoadingMentors(false);
  };

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
            {loadingMentors && (
              <View style={styles.mentorLoading}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.mentorLoadingText}>Loading mentors...</Text>
              </View>
            )}
            {!loadingMentors && mentors.map((mentor) => (
              <MentorAvatar
                key={mentor.id}
                name={mentor.name}
                image={mentor.image}
              />
            ))}
            {!loadingMentors && <MentorAvatar name="See More" />}
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
  mentorLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mentorLoadingText: {
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
