import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#4A6D8C";
const BG = "#f1f5f9";
const CARD_BG = "#ffffff";
const TEXT_MAIN = "#0f172a";
const TEXT_MUTED = "#64748b";
const BORDER = "#e2e8f0";
const ACCENT = "#FFFFF0";          // Ivory
const ACCENT_BORDER = "#C8C87A";   // Ivory border
const ACCENT_TEXT = "#4A4A00";     // Dark text for ivory bg

// ─── Tag options (mirrors the app's categories) ───────────────────────────────
const TAG_OPTIONS = [
  { label: "Research",    color: "#4A6D8C" },
  { label: "AI",          color: "#6366f1" },
  { label: "Internship",  color: "#F59E0B" },
  { label: "Tech",        color: "#3b82f6" },
  { label: "Scholarship", color: "#10B981" },
  { label: "STEM",        color: "#8b5cf6" },
  { label: "Volunteer",   color: "#EF4444" },
  { label: "Health",      color: "#ec4899" },
  { label: "Design",      color: "#EC4899" },
  { label: "Features",    color: "#4ECDC4" },
  { label: "Marketing",   color: "#f97316" },
  { label: "Career",      color: "#06b6d4" },
];

const MAX_BULLETS = 5;
const MAX_TAGS = 3;

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();

  // ── Form state ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bullets, setBullets] = useState<string[]>([""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  // ── Animated progress bar ──
  const progressAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: step === 1 ? 0.5 : 1,
      useNativeDriver: false,
      damping: 18,
      stiffness: 120,
    }).start();
  }, [step]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // ── Bullet helpers ──
  const updateBullet = (text: string, idx: number) => {
    setBullets(prev => prev.map((b, i) => (i === idx ? text : b)));
  };

  const addBullet = () => {
    if (bullets.length < MAX_BULLETS) setBullets(prev => [...prev, ""]);
  };

  const removeBullet = (idx: number) => {
    if (bullets.length === 1) { setBullets([""]); return; }
    setBullets(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Tag toggle ──
  const toggleTag = (label: string) => {
    setSelectedTags(prev =>
      prev.includes(label)
        ? prev.filter(t => t !== label)
        : prev.length < MAX_TAGS
        ? [...prev, label]
        : prev
    );
  };

  // ── Validation ──
  const isStep1Valid = title.trim().length > 0 && description.trim().length > 0;

  const handlePublish = () => {
    Alert.alert(
      "Post Published! 🎉",
      "Your blog post is now live on Discover.",
      [{ text: "Okay", onPress: () => navigation.goBack() }]
    );
  };

  const handleDiscard = () => {
    if (!title && !description) { navigation.goBack(); return; }
    Alert.alert("Discard post?", "Your draft will be lost.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
    ]);
  };

  const filledBullets = bullets.filter(b => b.trim());

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleDiscard}>
            <Icon name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {step === 1 ? "Create Post" : "Preview"}
            </Text>
            <Text style={styles.headerSub}>Step {step} of 2</Text>
          </View>

          {step === 1 ? (
            <TouchableOpacity
              style={[styles.headerActionBtn, !isStep1Valid && styles.headerActionBtnDisabled]}
              onPress={() => isStep1Valid && setStep(2)}
              disabled={!isStep1Valid}
            >
              <Text style={[styles.headerActionText, !isStep1Valid && { opacity: 0.45 }]}>
                Next
              </Text>
              <Icon name="arrow-forward" size={16} color={isStep1Valid ? "#fff" : "rgba(255,255,255,0.45)"} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
              <Icon name="send" size={15} color={ACCENT_TEXT} />
              <Text style={styles.publishBtnText}>Publish</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Progress bar ── */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* ── Step pills ── */}
        <View style={styles.stepRow}>
          {(["Content", "Preview"] as const).map((label, i) => {
            const active = step === i + 1;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.stepPill, active && styles.stepPillActive]}
                onPress={() => { if (i === 1 && !isStep1Valid) return; setStep((i + 1) as 1 | 2); }}
              >
                <View style={[styles.stepNum, active && styles.stepNumActive]}>
                  <Text style={[styles.stepNumText, active && styles.stepNumTextActive]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ══════════════════ STEP 1 — CONTENT ══════════════════ */}
        {step === 1 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Icon name="title" size={15} color={PRIMARY} />
                <Text style={styles.sectionLabel}>Post Title <Text style={styles.required}>*</Text></Text>
              </View>
              <TextInput
                style={styles.titleInput}
                placeholder="Give your post a catchy title..."
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                multiline
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Icon name="notes" size={15} color={PRIMARY} />
                <Text style={styles.sectionLabel}>Description <Text style={styles.required}>*</Text></Text>
              </View>
              <TextInput
                style={styles.descInput}
                placeholder="Write a compelling description of your post..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                maxLength={400}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/400</Text>
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Icon name="bolt" size={15} color={PRIMARY} />
                <Text style={styles.sectionLabel}>Tags</Text>
                <Text style={styles.sectionHint}>(up to {MAX_TAGS})</Text>
              </View>
              <View style={styles.tagsWrap}>
                {TAG_OPTIONS.map((t) => {
                  const sel = selectedTags.includes(t.label);
                  return (
                    <TouchableOpacity
                      key={t.label}
                      style={[
                        styles.tagChip,
                        sel && { backgroundColor: t.color, borderColor: t.color },
                        !sel && selectedTags.length >= MAX_TAGS && styles.tagChipDisabled,
                      ]}
                      onPress={() => toggleTag(t.label)}
                      activeOpacity={0.75}
                    >
                      {sel && <Icon name="check" size={11} color="#fff" />}
                      <Text style={[styles.tagChipText, sel && { color: "#fff" }]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Bullet points */}
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Icon name="format-list-bulleted" size={15} color={PRIMARY} />
                <Text style={styles.sectionLabel}>Key Highlights</Text>
                <Text style={styles.sectionHint}>(up to {MAX_BULLETS})</Text>
              </View>
              <Text style={styles.sectionDesc}>Add short bullet points that summarize the key details.</Text>

              {bullets.map((b, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <TextInput
                    style={styles.bulletInput}
                    placeholder={`Highlight ${i + 1}...`}
                    placeholderTextColor="#94a3b8"
                    value={b}
                    onChangeText={t => updateBullet(t, i)}
                    maxLength={80}
                  />
                  <TouchableOpacity onPress={() => removeBullet(i)} style={styles.bulletRemove}>
                    <Icon name="remove-circle-outline" size={19} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}

              {bullets.length < MAX_BULLETS && (
                <TouchableOpacity style={styles.addBulletBtn} onPress={addBullet}>
                  <Icon name="add-circle-outline" size={18} color={PRIMARY} />
                  <Text style={styles.addBulletText}>Add highlight</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ══════════════════ STEP 2 — PREVIEW ══════════════════ */}
        {step === 2 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.previewHint}>
              This is how your post will appear in the feed.
            </Text>

            {/* ── Simulated card ── */}
            <View style={styles.previewCard}>

              {/* Card header */}
              <View style={styles.previewCardHeader}>
                <View style={styles.previewAuthorRow}>
                  <Image
                    source={{ uri: "https://randomuser.me/api/portraits/lego/1.jpg" }}
                    style={styles.previewAvatar}
                  />
                  <View>
                    <Text style={styles.previewAuthorName}>You</Text>
                    <Text style={styles.previewMeta}>Just now · Draft</Text>
                  </View>
                </View>
                <Icon name="more-vert" size={19} color="#94a3b8" />
              </View>

              {/* Card body */}
              <View style={styles.previewCardBody}>
                <Text style={styles.previewTitle}>{title || "Your post title will appear here"}</Text>
                <Text style={styles.previewDescription}>
                  {description || "Your description will appear here..."}
                </Text>

                {selectedTags.length > 0 && (
                  <View style={styles.previewTagsRow}>
                    {selectedTags.map((tag, i) => (
                      <View key={i} style={styles.previewTag}>
                        <Icon name="bolt" size={11} color={PRIMARY} />
                        <Text style={styles.previewTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {filledBullets.length > 0 && (
                  <View style={styles.previewBullets}>
                    {filledBullets.map((b, i) => (
                      <View key={i} style={styles.previewBulletRow}>
                        <View style={styles.previewBulletDot} />
                        <Text style={styles.previewBulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Card footer */}
              <View style={styles.previewCardFooter}>
                <View style={styles.previewVoteGroup}>
                  <Icon name="thumb-up" size={15} color="#64748b" />
                  <Text style={styles.previewVoteCount}>0</Text>
                  <View style={styles.previewVoteDivider} />
                  <Icon name="thumb-down" size={15} color="#64748b" />
                </View>
                <View style={styles.previewFooterDivider} />
                <View style={styles.previewFooterAction}>
                  <Icon name="chat-bubble-outline" size={15} color={PRIMARY} />
                  <Text style={[styles.previewFooterLabel, { color: PRIMARY }]}>0</Text>
                </View>
                <View style={styles.previewFooterAction}>
                  <Icon name="share" size={15} color="#94a3b8" />
                  <Text style={styles.previewFooterLabel}>Share</Text>
                </View>
              </View>
            </View>

            {/* ── Edit reminder ── */}
            <TouchableOpacity style={styles.editReminderBtn} onPress={() => setStep(1)}>
              <Icon name="edit" size={16} color={PRIMARY} />
              <Text style={styles.editReminderText}>Go back and edit</Text>
            </TouchableOpacity>

            {/* ── Publish CTA (big) ── */}
            <TouchableOpacity style={styles.bigPublishBtn} onPress={handlePublish} activeOpacity={0.88}>
              <Icon name="send" size={20} color={ACCENT_TEXT} />
              <Text style={styles.bigPublishBtnText}>Publish to Discover</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

      </SafeAreaView>
    </View>
  );
};

export default CreatePostScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 14,
    backgroundColor: PRIMARY,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    marginTop: 1,
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerActionBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: ACCENT,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnText: {
    color: ACCENT_TEXT,
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Progress bar ──
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: 3,
    backgroundColor: ACCENT,
    borderRadius: 2,
  },

  // ── Step pills ──
  stepRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: PRIMARY,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  stepPillActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumActive: {
    backgroundColor: ACCENT,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
  },
  stepNumTextActive: {
    color: ACCENT_TEXT,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  stepLabelActive: {
    color: "#fff",
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

  // ── Section ──
  section: {
    marginBottom: 22,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_MAIN,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  required: {
    color: "#ef4444",
  },
  sectionHint: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  sectionDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 10,
    lineHeight: 17,
  },

  // ── Inputs ──
  titleInput: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_MAIN,
    lineHeight: 22,
  },
  descInput: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: TEXT_MAIN,
    lineHeight: 21,
    minHeight: 110,
  },
  charCount: {
    fontSize: 10,
    color: TEXT_MUTED,
    textAlign: "right",
    marginTop: 5,
  },

  // ── Tags ──
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  tagChipDisabled: {
    opacity: 0.4,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  // ── Bullets ──
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: PRIMARY,
    flexShrink: 0,
  },
  bulletInput: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 13,
    color: TEXT_MAIN,
  },
  bulletRemove: {
    padding: 2,
  },
  addBulletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 10,
  },
  addBulletText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY,
  },

  // ── Preview ──
  previewHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  previewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  previewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  previewAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  previewAuthorName: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_MAIN,
  },
  previewMeta: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  previewCardBody: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MAIN,
    marginBottom: 5,
  },
  previewDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  previewTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9,
  },
  previewTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 3,
  },
  previewTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: PRIMARY,
  },
  previewBullets: {
    marginTop: 9,
    gap: 5,
  },
  previewBulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  previewBulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  previewBulletText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  previewCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 14,
  },
  previewVoteGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 6,
  },
  previewVoteCount: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MUTED,
    minWidth: 16,
    textAlign: "center",
  },
  previewVoteDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#cbd5e1",
  },
  previewFooterDivider: {
    width: 1,
    height: 16,
    backgroundColor: BORDER,
  },
  previewFooterAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  previewFooterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  // ── Preview CTAs ──
  editReminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: CARD_BG,
  },
  editReminderText: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY,
  },
  bigPublishBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: ACCENT,
    borderWidth: 1.5,
    borderColor: ACCENT_BORDER,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#C8C87A",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 6,
  },
  bigPublishBtnText: {
    color: ACCENT_TEXT,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});