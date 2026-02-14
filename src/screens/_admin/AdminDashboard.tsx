import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { supabase } from "../../../supabaseClient";
import { Search, Shield, User, Activity, Ban, CheckCircle, X } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Profile = {
  id: string;
  email: string;
  role: string;
  role_level: number;
  is_banned: boolean;
  full_name?: string;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// Matrix Rain Particle
// ---------------------------------------------------------------------------
const MatrixParticle: React.FC<{ delay: number; column: number }> = ({ delay, column }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT + 100,
            duration: 8000 + Math.random() * 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const chars = "01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const char = chars[Math.floor(Math.random() * chars.length)];

  return (
    <Animated.Text
      style={[
        styles.matrixChar,
        {
          left: column * 20,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {char}
    </Animated.Text>
  );
};

// ---------------------------------------------------------------------------
// Glitch Text Effect
// ---------------------------------------------------------------------------
const GlitchText: React.FC<{ text: string }> = ({ text }) => {
  const glitchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glitchAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
      ])
    ).start();
  }, []);

  const glitchTranslate = glitchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <View style={styles.glitchContainer}>
      <Text style={styles.glitchTitle}>{text}</Text>
      <Animated.Text
        style={[
          styles.glitchTitle,
          styles.glitchLayer1,
          { transform: [{ translateX: glitchTranslate }] },
        ]}
      >
        {text}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.glitchTitle,
          styles.glitchLayer2,
          { transform: [{ translateX: Animated.multiply(glitchTranslate, -1) }] },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Scan Line Overlay
// ---------------------------------------------------------------------------
const ScanLine: React.FC = () => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.scanLine,
        { transform: [{ translateY }] },
      ]}
    />
  );
};

// ---------------------------------------------------------------------------
// Stats Card
// ---------------------------------------------------------------------------
const StatsCard: React.FC<{ icon: any; label: string; value: number; color: string }> = ({
  icon: Icon,
  label,
  value,
  color,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statsCard,
        { borderColor: color, transform: [{ scale: pulseAnim }] },
      ]}
    >
      <Icon size={24} color={color} />
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// User Detail Modal
// ---------------------------------------------------------------------------
const UserDetailModal: React.FC<{
  visible: boolean;
  user: Profile | null;
  onClose: () => void;
  onRoleChange: (userId: string, newLevel: number) => void;
}> = ({ visible, user, onClose, onRoleChange }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  if (!user) return null;

  const roleOptions = [
    { label: "User", level: 0, color: "#64748B" },
    { label: "Moderator", level: 5, color: "#3B82F6" },
    { label: "Admin", level: 8, color: "#8B5CF6" },
    { label: "Super Admin", level: 10, color: "#EF4444" },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <Shield size={24} color="#00FF41" />
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Email</Text>
            <Text style={styles.modalValue}>{user.email}</Text>

            <Text style={styles.modalLabel}>Full Name</Text>
            <Text style={styles.modalValue}>{user.full_name || "N/A"}</Text>

            <Text style={styles.modalLabel}>Current Role</Text>
            <Text style={[styles.modalValue, { color: "#00FF41" }]}>
              {user.role} (Level {user.role_level})
            </Text>

            <Text style={styles.modalLabel}>Change Role</Text>
            <View style={styles.roleOptions}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.level}
                  style={[
                    styles.roleOption,
                    {
                      borderColor: option.color,
                      backgroundColor:
                        user.role_level === option.level
                          ? `${option.color}33`
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "Change Role",
                      `Set ${user.email} to ${option.label}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Confirm",
                          onPress: () => onRoleChange(user.id, option.level),
                        },
                      ]
                    );
                  }}
                >
                  <Text style={[styles.roleOptionText, { color: option.color }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main Admin Dashboard
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUsers();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter(
          (u) =>
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role,role_level,is_banned,full_name,created_at")
      .order("role_level", { ascending: false });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setUsers(data || []);
      setFilteredUsers(data || []);
    }

    setLoading(false);
  };

  const toggleBan = async (user: Profile) => {
    Alert.alert(user.is_banned ? "Unban user?" : "Ban user?", user.email, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: user.is_banned ? "default" : "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("profiles")
            .update({ is_banned: !user.is_banned })
            .eq("id", user.id);

          if (error) {
            Alert.alert("Failed", error.message);
          } else {
            loadUsers();
          }
        },
      },
    ]);
  };

  const changeRole = async (userId: string, newLevel: number) => {
    const roleMap: { [key: number]: string } = {
      0: "user",
      5: "moderator",
      8: "admin",
      10: "super_admin",
    };

    const { error } = await supabase
      .from("profiles")
      .update({ role: roleMap[newLevel], role_level: newLevel })
      .eq("id", userId);

    if (error) {
      Alert.alert("Failed", error.message);
    } else {
      setModalVisible(false);
      loadUsers();
    }
  };

  const stats = {
    total: users.length,
    banned: users.filter((u) => u.is_banned).length,
    admins: users.filter((u) => u.role_level >= 8).length,
    active: users.filter((u) => !u.is_banned).length,
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, SCREEN_WIDTH + 200],
  });

  const renderUser = ({ item }: { item: Profile }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const cardScale = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.98],
    });

    const getRoleBadgeColor = (level: number) => {
      if (level >= 10) return "#EF4444";
      if (level >= 8) return "#8B5CF6";
      if (level >= 5) return "#3B82F6";
      return "#64748B";
    };

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedUser(item);
          setModalVisible(true);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: getRoleBadgeColor(item.role_level),
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.cardShimmer,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />

          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <Text style={styles.email}>{item.email}</Text>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: getRoleBadgeColor(item.role_level) },
                ]}
              >
                <Text style={styles.roleBadgeText}>
                  {item.role.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.meta}>Level {item.role_level}</Text>

            {item.is_banned && (
              <View style={styles.bannedBadge}>
                <Ban size={12} color="#FF5252" />
                <Text style={styles.banned}>BANNED</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: item.is_banned ? "#2E7D32" : "#C62828",
                borderColor: item.is_banned ? "#4CAF50" : "#FF5252",
              },
            ]}
            onPress={() => toggleBan(item)}
          >
            {item.is_banned ? (
              <CheckCircle size={16} color="#FFF" />
            ) : (
              <Ban size={16} color="#FFF" />
            )}
            <Text style={styles.buttonText}>
              {item.is_banned ? "Unban" : "Ban"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00FF41" />
        <Text style={styles.loadingText}>ACCESSING MAINFRAME...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Matrix rain background */}
      <View style={styles.matrixContainer} pointerEvents="none">
        {Array.from({ length: Math.floor(SCREEN_WIDTH / 20) }).map((_, i) => (
          <MatrixParticle key={i} delay={i * 200} column={i} />
        ))}
      </View>

      {/* Scan line overlay */}
      <ScanLine />

      {/* Header with glitch effect */}
      <View style={styles.header}>
        <GlitchText text="SUPER ADMIN TERMINAL" />
        <Shield size={20} color="#00FF41" style={{ marginLeft: 8 }} />
      </View>

      {/* Stats cards */}
      <View style={styles.statsRow}>
        <StatsCard icon={User} label="Total" value={stats.total} color="#00FF41" />
        <StatsCard icon={CheckCircle} label="Active" value={stats.active} color="#3B82F6" />
        <StatsCard icon={Ban} label="Banned" value={stats.banned} color="#EF4444" />
        <StatsCard icon={Shield} label="Admins" value={stats.admins} color="#8B5CF6" />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#00FF41" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH USERS..."
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refresh} onPress={loadUsers}>
        <Activity size={16} color="#00FF41" />
        <Text style={styles.refreshText}>REFRESH</Text>
      </TouchableOpacity>

      {/* User list */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      {/* User detail modal */}
      <UserDetailModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => setModalVisible(false)}
        onRoleChange={changeRole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000",
  },

  matrixContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  matrixChar: {
    position: "absolute",
    fontSize: 14,
    fontFamily: "monospace",
    color: "#00FF41",
    fontWeight: "700",
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#00FF41",
    opacity: 0.3,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },

  glitchContainer: {
    position: "relative",
  },

  glitchTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00FF41",
    fontFamily: "monospace",
    letterSpacing: 2,
  },

  glitchLayer1: {
    position: "absolute",
    color: "#FF00FF",
    opacity: 0.8,
    left: 0,
  },

  glitchLayer2: {
    position: "absolute",
    color: "#00FFFF",
    opacity: 0.8,
    left: 0,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statsCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    backgroundColor: "#111",
  },

  statsValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 4,
  },

  statsLabel: {
    fontSize: 10,
    color: "#AAA",
    marginTop: 2,
    textTransform: "uppercase",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#00FF41",
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 44,
    color: "#FFF",
    fontSize: 14,
    fontFamily: "monospace",
  },

  refresh: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00FF41",
  },

  refreshText: {
    color: "#00FF41",
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: "monospace",
  },

  card: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },

  cardShimmer: {
    position: "absolute",
    top: 0,
    left: -200,
    width: 200,
    height: "100%",
    backgroundColor: "rgba(0, 255, 65, 0.1)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  email: {
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    fontFamily: "monospace",
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },

  roleBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },

  meta: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "monospace",
  },

  bannedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  banned: {
    color: "#FF5252",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "700",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  loadingText: {
    color: "#00FF41",
    marginTop: 12,
    fontFamily: "monospace",
    fontSize: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#00FF41",
    paddingBottom: 40,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#00FF41",
    marginLeft: 12,
    fontFamily: "monospace",
  },

  modalClose: {
    padding: 4,
  },

  modalBody: {
    padding: 20,
  },

  modalLabel: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 16,
    marginBottom: 4,
    textTransform: "uppercase",
    fontFamily: "monospace",
  },

  modalValue: {
    fontSize: 16,
    color: "#FFF",
    fontFamily: "monospace",
  },

  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
  },

  roleOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});