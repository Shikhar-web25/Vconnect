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
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
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
const SCREEN_HEIGHT = Dimensions.get("window").height;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  name: string;
  image: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
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

// ─── CommentModal ─────────────────────────────────────────────────────────────
interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const CommentModal = ({ visible, onClose, title, comments, onAddComment }: CommentModalProps) => {
  const [text, setText] = useState("");
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText("");
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={commentStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[commentStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={commentStyles.header}>
          <TouchableOpacity onPress={onClose} style={commentStyles.backBtn}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={commentStyles.headerTitle} numberOfLines={1}>Comments</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={commentStyles.postPreview}>
          <Text style={commentStyles.postPreviewText} numberOfLines={1}>{title}</Text>
        </View>

        <ScrollView style={commentStyles.list} showsVerticalScrollIndicator={false}>
          {comments.length === 0 ? (
            <View style={commentStyles.emptyState}>
              <Icon name="chat-bubble-outline" size={36} color="#cbd5e1" />
              <Text style={commentStyles.emptyText}>No comments yet. Be the first!</Text>
            </View>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={commentStyles.commentRow}>
                <Image source={{ uri: c.avatar }} style={commentStyles.commentAvatar} />
                <View style={commentStyles.commentBubble}>
                  <View style={commentStyles.commentMeta}>
                    <Text style={commentStyles.commentAuthor}>{c.author}</Text>
                    <Text style={commentStyles.commentTime}>{c.time}</Text>
                  </View>
                  <Text style={commentStyles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={10}
        >
          <View style={commentStyles.inputRow}>
            <TextInput
              style={commentStyles.input}
              placeholder="Write a comment..."
              placeholderTextColor="#94a3b8"
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity
              style={[commentStyles.sendBtn, !text.trim() && commentStyles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim()}
            >
              <Icon name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const commentStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#475569",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    color: "#fff", fontSize: 13, fontWeight: "800",
    letterSpacing: 1.1, textTransform: "uppercase",
    flex: 1, textAlign: "center",
  },
  postPreview: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  postPreviewText: { fontSize: 12, color: TEXT_MUTED, fontWeight: "500" },
  list: { paddingHorizontal: 16, paddingTop: 10, minHeight: 120 },
  emptyState: { alignItems: "center", paddingVertical: 36, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  commentRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, marginTop: 2 },
  commentBubble: {
    flex: 1, backgroundColor: "#f1f5f9",
    borderRadius: 12, padding: 10,
  },
  commentMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  commentAuthor: { fontSize: 12, fontWeight: "700", color: TEXT_MAIN },
  commentTime: { fontSize: 10, color: TEXT_MUTED },
  commentText: { fontSize: 13, color: "#334155", lineHeight: 18 },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: BORDER,
    backgroundColor: "#fff", paddingBottom: 28,
  },
  input: {
    flex: 1, backgroundColor: "#f1f5f9", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: TEXT_MAIN, maxHeight: 80,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#94a3b8" },
});

// ─── ShareSheet ───────────────────────────────────────────────────────────────
interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  post: Opportunity | null;
}

const ShareSheet = ({ visible, onClose, post }: ShareSheetProps) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 160,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) dragY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.8) {
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
        }
      },
    })
  ).current;

  const translateY = Animated.add(slideAnim, dragY);

  const shareOptions = [
    { icon: "chat-bubble", label: "Message",    color: "#10b981", bg: "#d1fae5" },
    { icon: "email",       label: "Email",       color: "#3b82f6", bg: "#dbeafe" },
    { icon: "link",        label: "Copy Link",   color: "#8b5cf6", bg: "#ede9fe" },
    { icon: "groups",      label: "Community",   color: PRIMARY,   bg: "#e0eaf3" },
  ];

  const handleOption = (label: string) => {
    if (label === "Copy Link") {
      Alert.alert("Link copied!", "The post link has been copied to your clipboard.");
    } else {
      Alert.alert("Shared!", `Post shared via ${label}.`);
    }
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={shareStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[shareStyles.sheet, { transform: [{ translateY }] }]}>

        {/* Drag handle area */}
        <View {...panResponder.panHandlers}>
          <View style={shareStyles.handleWrap}>
            <View style={shareStyles.handle} />
          </View>

          {/* Header with back button */}
          <View style={shareStyles.header}>
            <TouchableOpacity style={shareStyles.backBtn} onPress={onClose}>
              <Icon name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={shareStyles.headerTitle}>Share Post</Text>
            <View style={{ width: 32 }} />
          </View>
        </View>

        {/* Post preview */}
        {post && (
          <View style={shareStyles.postPreview}>
            <Icon name="article" size={15} color={TEXT_MUTED} />
            <Text style={shareStyles.postPreviewText} numberOfLines={2}>{post.title}</Text>
          </View>
        )}

        {/* Share options grid */}
        <View style={shareStyles.optionsGrid}>
          {shareOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={shareStyles.optionItem}
              onPress={() => handleOption(opt.label)}
              activeOpacity={0.75}
            >
              <View style={[shareStyles.optionIcon, { backgroundColor: opt.bg }]}>
                <Icon name={opt.icon} size={22} color={opt.color} />
              </View>
              <Text style={shareStyles.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel */}
        <TouchableOpacity style={shareStyles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={shareStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const shareStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    backgroundColor: "#475569",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 0,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#475569",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    color: "#fff", fontSize: 13, fontWeight: "800",
    letterSpacing: 1.1, textTransform: "uppercase",
    flex: 1, textAlign: "center",
  },
  postPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  postPreviewText: { flex: 1, fontSize: 12, color: TEXT_MUTED, fontWeight: "500", lineHeight: 18 },
  optionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  optionItem: { alignItems: "center", gap: 8 },
  optionIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  optionLabel: { fontSize: 12, fontWeight: "600", color: TEXT_MAIN },
  cancelBtn: {
    marginHorizontal: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#475569" },
});

// ─── PostMenuSheet ────────────────────────────────────────────────────────────
interface PostMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onHide: () => void;
  onReport: () => void;
  postTitle: string;
}

const PostMenuSheet = ({ visible, onClose, onHide, onReport, postTitle }: PostMenuSheetProps) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 160,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // ── FIX: PanResponder added to PostMenuSheet ──
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) dragY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.8) {
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
        }
      },
    })
  ).current;

  const translateY = Animated.add(slideAnim, dragY);

  const menuItems = [
    {
      icon: "visibility-off",
      label: "Hide post",
      sublabel: "See fewer posts like this",
      color: "#334155",
      onPress: () => { onClose(); setTimeout(onHide, 250); },
    },
    {
      icon: "flag",
      label: "Report post",
      sublabel: "We won't tell who reported it",
      color: "#ef4444",
      onPress: () => { onClose(); setTimeout(onReport, 250); },
    },
  ];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={menuStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[menuStyles.sheet, { transform: [{ translateY }] }]}>

        {/* Drag handle — attached to panResponder */}
        <View {...panResponder.panHandlers}>
          <View style={menuStyles.handleWrap}>
            <View style={menuStyles.handle} />
          </View>
        </View>

        {/* Post preview */}
        <View style={menuStyles.previewRow}>
          <Icon name="article" size={16} color={TEXT_MUTED} />
          <Text style={menuStyles.previewText} numberOfLines={1}>{postTitle}</Text>
        </View>

        {/* Menu items */}
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[menuStyles.menuRow, i < menuItems.length - 1 && menuStyles.menuRowBorder]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[menuStyles.menuIconWrap, { backgroundColor: item.color === "#ef4444" ? "#fef2f2" : "#f1f5f9" }]}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <View style={menuStyles.menuTextGroup}>
              <Text style={[menuStyles.menuLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={menuStyles.menuSublabel}>{item.sublabel}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}

        {/* Cancel */}
        <TouchableOpacity style={menuStyles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={menuStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const menuStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#cbd5e1" },
  previewRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 10, marginBottom: 4,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  previewText: { flex: 1, fontSize: 12, color: TEXT_MUTED, fontWeight: "500" },
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, gap: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  menuIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  menuTextGroup: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "700" },
  menuSublabel: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  cancelBtn: {
    marginHorizontal: 20, marginTop: 10,
    backgroundColor: "#f1f5f9", borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#475569" },
});

// ─── Category data ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "1", label: "Freelance Projects", count: 42, color: "#4ECDC4" },
  { id: "2", label: "Startup Advice",     count: 31, color: "#45B7AA" },
  { id: "3", label: "Mentorship Tips",    count: 27, color: "#9B7FD4" },
  { id: "4", label: "Research",           count: 18, color: "#4A6D8C" },
  { id: "5", label: "Internships",        count: 35, color: "#F59E0B" },
  { id: "6", label: "Scholarships",       count: 22, color: "#10B981" },
  { id: "7", label: "Volunteering",       count: 14, color: "#EF4444" },
  { id: "8", label: "Design & UX",        count: 19, color: "#EC4899" },
];

// ─── FilterSheet ──────────────────────────────────────────────────────────────
interface FilterSheetProps {
  visible: boolean;
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
}

const FilterSheet = ({ visible, selected, onToggle, onClear, onApply, onClose }: FilterSheetProps) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      dragY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) dragY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.8) {
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
        }
      },
    })
  ).current;

  const translateY = Animated.add(slideAnim, dragY);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={filterStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[filterStyles.sheet, { transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers}>
          <View style={filterStyles.handleWrap}>
            <View style={filterStyles.handle} />
          </View>
          <View style={filterStyles.sheetHeader}>
            <TouchableOpacity style={filterStyles.backBtn} onPress={onClose} activeOpacity={0.7}>
              <Icon name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text style={filterStyles.sheetTitle}>Browse Categories</Text>
            {selected.length > 0
              ? <TouchableOpacity onPress={onClear}>
                  <Text style={filterStyles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              : <View style={{ width: 60 }} />
            }
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={filterStyles.list}>
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[filterStyles.row, isSelected && filterStyles.rowSelected]}
                onPress={() => onToggle(cat.id)}
                activeOpacity={0.7}
              >
                <View style={[filterStyles.dot, { backgroundColor: cat.color }]} />
                <Text style={[filterStyles.rowLabel, isSelected && filterStyles.rowLabelSelected]}>
                  {cat.label}
                </Text>
                <View style={filterStyles.rowRight}>
                  <View style={[filterStyles.badge, { backgroundColor: "#4A6D8C" }]}>
                    <Text style={filterStyles.badgeText}>{cat.count}</Text>
                  </View>
                  {isSelected
                    ? <View style={[filterStyles.checkCircle, { backgroundColor: cat.color }]}>
                        <Icon name="check" size={13} color="#fff" />
                      </View>
                    : <Icon name="chevron-right" size={20} color="#94a3b8" />
                  }
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={filterStyles.footer}>
          <TouchableOpacity style={filterStyles.applyBtn} onPress={onApply} activeOpacity={0.85}>
            <Text style={filterStyles.applyBtnText}>
              Apply{selected.length > 0 ? ` (${selected.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const filterStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: SCREEN_HEIGHT * 0.68,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  handleWrap: {
    backgroundColor: "#475569",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#475569",
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 13, fontWeight: "800", color: "#ffffff",
    letterSpacing: 1.1, textTransform: "uppercase",
    flex: 1, textAlign: "center",
  },
  clearAll: { fontSize: 13, fontWeight: "600", color: "#ef4444" },
  list: { paddingHorizontal: 20, paddingTop: 6 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9", gap: 12,
    borderRadius: 10, paddingHorizontal: 4,
  },
  rowSelected: { backgroundColor: "#f8fafc" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1e293b" },
  rowLabelSelected: { fontWeight: "700", color: "#0f172a" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: { minWidth: 30, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, alignItems: "center" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  footer: { paddingHorizontal: 20, paddingTop: 16 },
  applyBtn: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ─── Default seed comments ────────────────────────────────────────────────────
const SEED_COMMENTS: Record<string, Comment[]> = {
  "1": [
    { id: "c1", author: "Sarah W.", avatar: "https://randomuser.me/api/portraits/women/44.jpg", text: "This platform looks amazing! Can't wait to explore.", time: "5d ago" },
    { id: "c2", author: "Marcus C.", avatar: "https://randomuser.me/api/portraits/men/75.jpg", text: "Great initiative! Looking forward to connecting.", time: "4d ago" },
  ],
  "2": [
    { id: "c3", author: "Elena", avatar: "https://randomuser.me/api/portraits/women/68.jpg", text: "AI ethics research is so important right now. Applied!", time: "4d ago" },
  ],
  "3": [],
  "4": [
    { id: "c4", author: "James", avatar: "https://randomuser.me/api/portraits/men/46.jpg", text: "Incredible scholarship opportunity. Sharing this with my network.", time: "1d ago" },
  ],
  "5": [],
  "6": [
    { id: "c5", author: "Dr. Alex", avatar: "https://randomuser.me/api/portraits/men/43.jpg", text: "Already working on my submission for this!", time: "3d ago" },
  ],
};

// ─── OpportunityCard ──────────────────────────────────────────────────────────
interface OpportunityCardProps extends Opportunity {
  onCommentPress: () => void;
  onMenuPress: () => void;
  onSharePress: () => void;
}

const OpportunityCard = ({
  title, daysAgo, description, author, authorAvatar,
  likes = 0, comments = 0, tags = [], bullets = [],
  onCommentPress, onMenuPress, onSharePress,
}: OpportunityCardProps) => {
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
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={onMenuPress}>
          <Icon name="more-vert" size={19} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
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

      <View style={styles.cardFooter}>
        <View style={styles.voteGroup}>
          <TouchableOpacity onPress={handleLike} style={styles.voteBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Icon name="thumb-up" size={16} color={liked ? PRIMARY : "#64748b"} />
          </TouchableOpacity>
          <Text style={[styles.voteCount, liked && { color: PRIMARY }]}>{likeCount}</Text>
          <View style={styles.voteDivider} />
          <TouchableOpacity onPress={handleDislike} style={styles.voteBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Icon name="thumb-down" size={16} color={disliked ? "#ef4444" : "#64748b"} />
          </TouchableOpacity>
        </View>
        <View style={styles.footerDivider} />
        <TouchableOpacity style={styles.footerAction} onPress={onCommentPress}>
          <Icon name="chat-bubble-outline" size={16} color={PRIMARY} />
          <Text style={[styles.footerActionLabel, { color: PRIMARY }]}>{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction} onPress={onSharePress}>
          <Icon name="share" size={16} color="#94a3b8" />
          <Text style={styles.footerActionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const DiscoverScreen = () => {
  const navigation = useNavigation<any>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePost, setActivePost] = useState<Opportunity | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(SEED_COMMENTS);
  const [commentCountMap, setCommentCountMap] = useState<Record<string, number>>({
    "1": 2, "2": 1, "3": 0, "4": 1, "5": 0, "6": 1,
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPost, setMenuPost] = useState<Opportunity | null>(null);

  // ── NEW: Share sheet state ──
  const [shareVisible, setShareVisible] = useState(false);
  const [sharePost, setSharePost] = useState<Opportunity | null>(null);

  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const openComments = (post: Opportunity) => {
    setActivePost(post);
    setCommentModalVisible(true);
  };

  const openMenu = (post: Opportunity) => {
    setMenuPost(post);
    setMenuVisible(true);
  };

  // ── NEW: open custom ShareSheet instead of native Share ──
  const handleShare = (post: Opportunity) => {
    setSharePost(post);
    setShareVisible(true);
  };

  const handleHidePost = () => {
    if (!menuPost) return;
    setHiddenPostIds(prev => new Set([...prev, menuPost.id]));
    Alert.alert("Post hidden", "You'll see fewer posts like this.", [
      { text: "Undo", onPress: () => setHiddenPostIds(prev => { const next = new Set(prev); next.delete(menuPost.id); return next; }) },
      { text: "OK" },
    ]);
  };

  const handleReportPost = () => {
    if (!menuPost) return;
    Alert.alert("Report post", "Why are you reporting this post?", [
      { text: "Spam", onPress: () => Alert.alert("Reported", "Thanks for letting us know.") },
      { text: "Misleading info", onPress: () => Alert.alert("Reported", "Thanks for letting us know.") },
      { text: "Inappropriate content", onPress: () => Alert.alert("Reported", "Thanks for letting us know.") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAddComment = (text: string) => {
    if (!activePost) return;
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: "You",
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      text,
      time: "Just now",
    };
    setCommentsMap(prev => ({ ...prev, [activePost.id]: [...(prev[activePost.id] ?? []), newComment] }));
    setCommentCountMap(prev => ({ ...prev, [activePost.id]: (prev[activePost.id] ?? 0) + 1 }));
  };

  const profiles: Profile[] = [
    { name: "Dr. Alex",  image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sarah W.",  image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Marcus C.", image: "https://randomuser.me/api/portraits/men/75.jpg" },
    { name: "Lisa K.",   image: "https://randomuser.me/api/portraits/women/65.jpg" },
    { name: "James",     image: "https://randomuser.me/api/portraits/men/46.jpg" },
    { name: "Elena",     image: "https://randomuser.me/api/portraits/women/68.jpg" },
  ];

  const opportunities: Opportunity[] = [
    { id: "1", title: "🎉 Welcome to Discover 🎉", daysAgo: "6 days ago", description: "Hi there! 👋 Welcome to Discover. This is a community-driven platform built for sharing and growing together.", author: "intasham", authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg", likes: 13, comments: 2, tags: ["Features"], bullets: ["Connect with local mentors", "Engagement through collaborative feeds"] },
    { id: "2", title: "🔬 Summer Research Program: AI Ethics", daysAgo: "5 days ago", description: "Explore AI and human rights with funded research opportunities this summer.", author: "Dr. Alex", authorAvatar: "https://randomuser.me/api/portraits/men/43.jpg", likes: 28, comments: 1, tags: ["Research", "AI"], bullets: ["Fully funded program", "Open to all undergraduates"] },
    { id: "3", title: "💼 Software Engineering Internship at TechCorp", daysAgo: "2 days ago", description: "Join our dev team to build scalable applications used by millions worldwide.", author: "Sarah W.", authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg", likes: 41, comments: 0, tags: ["Internship", "Tech"], bullets: ["Paid position", "Remote friendly", "Mentorship included"] },
    { id: "4", title: "📚 Scholarship: Women in STEM 2025", daysAgo: "1 day ago", description: "Applications now open for the annual Women in STEM scholarship worth $5,000.", author: "Lisa K.", authorAvatar: "https://randomuser.me/api/portraits/women/65.jpg", likes: 56, comments: 1, tags: ["Scholarship", "STEM"], bullets: ["Deadline: March 31", "Open internationally"] },
    { id: "5", title: "🌍 NGO Volunteer Program — Global Health", daysAgo: "3 days ago", description: "Make an impact this summer with our global health volunteer program in 12 countries.", author: "Marcus C.", authorAvatar: "https://randomuser.me/api/portraits/men/75.jpg", likes: 34, comments: 0, tags: ["Volunteer", "Health"], bullets: ["3–6 month commitment", "Travel stipend provided"] },
    { id: "6", title: "🎨 UX Design Challenge — Win $2,000", daysAgo: "4 days ago", description: "Submit your best UX work for a chance to win cash prizes and get hired by top studios.", author: "Elena", authorAvatar: "https://randomuser.me/api/portraits/women/68.jpg", likes: 22, comments: 1, tags: ["Design", "Competition"], bullets: ["Open to students & grads", "Top 3 get cash prizes"] },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.searchFilterRow}>
            <View style={styles.headerSearchBar}>
              <Icon name="search" size={18} color="#94a3b8" />
              <TextInput
                placeholder="Find your next opportunity..."
                placeholderTextColor="#94a3b8"
                style={styles.headerSearchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => setFilterVisible(true)}>
              <Icon name="tune" size={20} color={PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={opportunities.filter(o => !hiddenPostIds.has(o.id))}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <>
              <View style={styles.communityCard}>
                <View style={styles.profilesHeader}>
                  <Text style={styles.profilesTitle}>Top Profiles</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("AllSeniors")}>
                    <Text style={styles.viewAll}>View All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profilesScroll}>
                  {profiles.map((p, i) => <ProfileAvatar key={i} name={p.name} image={p.image} />)}
                </ScrollView>
              </View>
              <Text style={styles.opportunitiesTitle}>Opportunity</Text>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <OpportunityCard
                {...item}
                comments={commentCountMap[item.id] ?? item.comments ?? 0}
                onCommentPress={() => openComments(item)}
                onMenuPress={() => openMenu(item)}
                onSharePress={() => handleShare(item)}
              />
            </View>
          )}
        />

        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigation.navigate("CreatePost")}>
          <Icon name="add" size={28} color="#fff" />
        </TouchableOpacity>

      </SafeAreaView>

      <FilterSheet
        visible={filterVisible}
        selected={selectedCategories}
        onToggle={toggleCategory}
        onClear={() => setSelectedCategories([])}
        onApply={() => setFilterVisible(false)}
        onClose={() => setFilterVisible(false)}
      />

      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        title={activePost?.title ?? ""}
        comments={activePost ? (commentsMap[activePost.id] ?? []) : []}
        onAddComment={handleAddComment}
      />

      <PostMenuSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onHide={handleHidePost}
        onReport={handleReportPost}
        postTitle={menuPost?.title ?? ""}
      />

      {/* ── NEW: Custom Share Sheet ── */}
      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        post={sharePost}
      />
    </View>
  );
};

export default DiscoverScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY },
  header: {
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16,
    backgroundColor: PRIMARY, alignItems: "flex-start",
  },
  headerTitle: { color: "#fff", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, textAlign: "left", marginBottom: 12 },
  searchFilterRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 10 },
  headerSearchBar: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "#ffffff", borderRadius: 25,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3,
  },
  headerSearchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: "#0f172a", paddingVertical: 0 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#ffffff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3,
  },
  listContent: { backgroundColor: BG, paddingBottom: 100, paddingTop: 12 },
  communityCard: {
    backgroundColor: CARD_BG, marginHorizontal: 14, borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1,
  },
  profilesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  profilesTitle: { fontSize: 11, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.4 },
  viewAll: { fontSize: 12, fontWeight: "600", color: PRIMARY },
  profilesScroll: { gap: 14, paddingVertical: 2 },
  avatarWrapper: { alignItems: "center", width: 50 },
  avatarRing: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: `${PRIMARY}40`, padding: 2 },
  avatarImage: { width: "100%", height: "100%", borderRadius: 20 },
  avatarName: { marginTop: 5, fontSize: 10, fontWeight: "500", color: TEXT_MUTED, textAlign: "center" },
  opportunitiesTitle: { fontSize: 18, fontWeight: "700", color: TEXT_MAIN, paddingHorizontal: 16, paddingBottom: 10 },
  cardWrapper: { paddingHorizontal: 14 },
  card: {
    backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  cardAuthorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardAvatar: { width: 34, height: 34, borderRadius: 17 },
  cardAvatarPlaceholder: { backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center" },
  cardAuthorName: { fontSize: 13, fontWeight: "700", color: TEXT_MAIN },
  cardMeta: { fontSize: 10, color: TEXT_MUTED, marginTop: 1 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: TEXT_MAIN, marginBottom: 5 },
  cardDescription: { fontSize: 13, lineHeight: 19, color: "#475569" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, gap: 3 },
  tagText: { fontSize: 10, fontWeight: "700", color: PRIMARY },
  bulletList: { marginTop: 9, gap: 5 },
  bulletItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: PRIMARY },
  bulletText: { fontSize: 12, color: TEXT_MUTED },
  cardFooter: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 14, paddingVertical: 10, gap: 14 },
  voteGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, gap: 6 },
  voteBtn: { padding: 0 },
  voteDivider: { width: 1, height: 14, backgroundColor: "#cbd5e1" },
  voteCount: { fontSize: 12, fontWeight: "700", color: TEXT_MUTED, minWidth: 16, textAlign: "center" },
  footerDivider: { width: 1, height: 16, backgroundColor: BORDER },
  footerAction: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerActionLabel: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
  fab: {
    position: "absolute", bottom: 30, right: 24,
    width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY,
    alignItems: "center", justifyContent: "center",
    shadowColor: PRIMARY, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 8,
  },
});