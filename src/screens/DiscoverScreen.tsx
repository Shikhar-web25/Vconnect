import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#4A6D8C";
const CARD_BG = "#ffffff";
const BG = "#f1f5f9";
const TEXT_MAIN = "#0f172a";
const TEXT_MUTED = "#64748b";
const BORDER = "#e2e8f0";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  name: string;
  image: string;
}

interface Opportunity {
  id: string;
  title: string;
  daysAgo: string;
  description: string;
  author?: string;
  authorAvatar?: string;
  likes?: number;
  comments?: number;
  tags?: string[];
  bullets?: string[];
}

// ─── ProfileAvatar ─────────────────────────────────────────────────────────
const ProfileAvatar = ({ name, image }: Profile) => (
  <View style={styles.avatarWrapper}>
    <View style={styles.avatarRing}>
      <Image source={{ uri: image }} style={styles.avatarImage} />
    </View>
    <Text style={styles.avatarName} numberOfLines={1}>
      {name.split(" ")[0]}
    </Text>
  </View>
);

// ─── OpportunityCard ───────────────────────────────────────────────────────
const OpportunityCard = ({
  title,
  daysAgo,
  description,
  author,
  authorAvatar,
  likes = 0,
  comments = 0,
  tags = [],
  bullets = [],
}: Opportunity) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (liked) { setLiked(false); setLikeCount(c => c - 1); }
    else { setLiked(true); if (disliked) setDisliked(false); setLikeCount(c => c + 1); }
  };
  const handleDislike = () => {
    if (disliked) { setDisliked(false); }
    else { setDisliked(true); if (liked) { setLiked(false); setLikeCount(c => c - 1); } }
  };

  return (
    <View style={styles.card}>

      {/* ── Author row ── */}
      <View style={styles.cardHeader}>
        <View style={styles.cardAuthorRow}>
          {authorAvatar
            ? <Image source={{ uri: authorAvatar }} style={styles.cardAvatar} />
            : <View style={[styles.cardAvatar, styles.cardAvatarPlaceholder]}>
                <Icon name="person" size={16} color="#fff" />
              </View>
          }
          <View>
            <Text style={styles.cardAuthorName}>{author ?? "Anonymous"}</Text>
            <Text style={styles.cardMeta}>{daysAgo} · Edited</Text>
          </View>
        </View>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="more-vert" size={19} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      <View style={styles.cardBody}>

        {/* Title */}
        <Text style={styles.cardTitle}>{title}</Text>

        {/* Description */}
        <Text style={styles.cardDescription}>{description}</Text>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Icon name="bolt" size={11} color={PRIMARY} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bullets */}
        {bullets.length > 0 && (
          <View style={styles.bulletList}>
            {bullets.map((b, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Footer: votes + comments + share all in one row ── */}
      <View style={styles.cardFooter}>

        {/* 👍 👎 pill — both icons side by side */}
        <View style={styles.voteGroup}>
          <TouchableOpacity onPress={handleLike} style={styles.voteBtn}>
            <Icon name="thumb-up" size={16} color={liked ? PRIMARY : "#64748b"} />
          </TouchableOpacity>
          <Text style={[styles.voteCount, liked && { color: PRIMARY }]}>{likeCount}</Text>
          <TouchableOpacity onPress={handleDislike} style={styles.voteBtn}>
            <Icon name="thumb-down" size={16} color={disliked ? "#ef4444" : "#64748b"} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.footerDivider} />

        {/* Comments */}
        <TouchableOpacity style={styles.footerAction}>
          <Icon name="chat-bubble-outline" size={16} color="#94a3b8" />
          <Text style={styles.footerActionLabel}>{comments}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.footerAction}>
          <Icon name="share" size={16} color="#94a3b8" />
          <Text style={styles.footerActionLabel}>Share</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

// ─── Screen ────────────────────────────────────────────────────────────────
const DiscoverScreen = () => {
  const navigation = useNavigation<any>();

  const profiles: Profile[] = [
    { name: "Dr. Alex",  image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sarah W.",  image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Marcus C.", image: "https://randomuser.me/api/portraits/men/75.jpg" },
    { name: "Lisa K.",   image: "https://randomuser.me/api/portraits/women/65.jpg" },
    { name: "James",     image: "https://randomuser.me/api/portraits/men/46.jpg" },
    { name: "Elena",     image: "https://randomuser.me/api/portraits/women/68.jpg" },
  ];

  const opportunities: Opportunity[] = [
    {
      id: "1",
      title: "🎉 Welcome to Discover 🎉",
      daysAgo: "6 days ago",
      description: "Hi there! 👋 Welcome to Discover. This is a community-driven platform built for sharing and growing together.",
      author: "intasham",
      authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
      likes: 13,
      comments: 12,
      tags: ["Features"],
      bullets: ["Connect with local mentors", "Engagement through collaborative feeds"],
    },
    {
      id: "2",
      title: "🔬 Summer Research Program: AI Ethics",
      daysAgo: "5 days ago",
      description: "Explore AI and human rights with funded research opportunities this summer.",
      author: "Dr. Alex",
      authorAvatar: "https://randomuser.me/api/portraits/men/43.jpg",
      likes: 28,
      comments: 7,
      tags: ["Research", "AI"],
      bullets: ["Fully funded program", "Open to all undergraduates"],
    },
    {
      id: "3",
      title: "💼 Software Engineering Internship at TechCorp",
      daysAgo: "2 days ago",
      description: "Join our dev team to build scalable applications used by millions worldwide.",
      author: "Sarah W.",
      authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      likes: 41,
      comments: 19,
      tags: ["Internship", "Tech"],
      bullets: ["Paid position", "Remote friendly", "Mentorship included"],
    },
    {
      id: "4",
      title: "📚 Scholarship: Women in STEM 2025",
      daysAgo: "1 day ago",
      description: "Applications now open for the annual Women in STEM scholarship worth $5,000.",
      author: "Lisa K.",
      authorAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
      likes: 56,
      comments: 23,
      tags: ["Scholarship", "STEM"],
      bullets: ["Deadline: March 31", "Open internationally"],
    },
    {
      id: "5",
      title: "🌍 NGO Volunteer Program — Global Health",
      daysAgo: "3 days ago",
      description: "Make an impact this summer with our global health volunteer program in 12 countries.",
      author: "Marcus C.",
      authorAvatar: "https://randomuser.me/api/portraits/men/75.jpg",
      likes: 34,
      comments: 11,
      tags: ["Volunteer", "Health"],
      bullets: ["3–6 month commitment", "Travel stipend provided"],
    },
    {
      id: "6",
      title: "🎨 UX Design Challenge — Win $2,000",
      daysAgo: "4 days ago",
      description: "Submit your best UX work for a chance to win cash prizes and get hired by top studios.",
      author: "Elena",
      authorAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
      likes: 22,
      comments: 9,
      tags: ["Design", "Competition"],
      bullets: ["Open to students & grads", "Top 3 get cash prizes"],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* Blue header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>

        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <>
              {/* Compact Search */}
              <View style={styles.searchRow}>
                <Icon name="search" size={18} color="#94a3b8" />
                <TextInput
                  placeholder="Search for opportunities..."
                  placeholderTextColor="#94a3b8"
                  style={styles.searchInput}
                />
              </View>

              {/* Community Feed + Top Profiles */}
              <View style={styles.communityCard}>
                <Text style={styles.communityLabel}>Community Feed</Text>
                <View style={styles.profilesHeader}>
                  <Text style={styles.profilesTitle}>Top Profiles</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("AllSeniors")}>
                    <Text style={styles.viewAll}>View All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.profilesScroll}
                >
                  {profiles.map((p, i) => (
                    <ProfileAvatar key={i} name={p.name} image={p.image} />
                  ))}
                </ScrollView>
              </View>

              {/* Section heading */}
              <Text style={styles.opportunitiesTitle}>Opportunity</Text>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <OpportunityCard {...item} />
            </View>
          )}
        />

        {/* FAB — same style as HomeScreen's FloatingFAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => console.log("Create Post")}
        >
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
};

export default DiscoverScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  // Blue header only
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: PRIMARY,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  listContent: {
    backgroundColor: BG,
    paddingBottom: 100, // same as HomeScreen
  },

  // ── Search ──
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: TEXT_MAIN,
    paddingVertical: 0,
  },

  // ── Community card ──
  communityCard: {
    backgroundColor: CARD_BG,
    marginHorizontal: 14,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  communityLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  profilesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  profilesTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
  },
  profilesScroll: {
    gap: 14,
    paddingVertical: 2,
  },
  avatarWrapper: {
    alignItems: "center",
    width: 50,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: `${PRIMARY}40`,
    padding: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  avatarName: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "500",
    color: TEXT_MUTED,
    textAlign: "center",
  },

  // ── Section heading ──
  opportunitiesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_MAIN,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  // ── Card ──
  cardWrapper: {
    paddingHorizontal: 14,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },

  // Author row at top
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cardAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  cardAvatarPlaceholder: {
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAuthorName: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_MAIN,
  },
  cardMeta: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 1,
  },

  // Body
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MAIN,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: PRIMARY,
  },
  bulletList: {
    marginTop: 9,
    gap: 5,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  bulletText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  // ── Footer: all actions in one horizontal row ──
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 14,
  },
  // 👍 👎 pill — both buttons + count inside a rounded pill
  voteGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
  },
  voteBtn: {
    padding: 0,
  },
  voteCount: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
    minWidth: 16,
    textAlign: "center",
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: BORDER,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  // ── FAB — matches HomeScreen FloatingFAB style ──
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
});