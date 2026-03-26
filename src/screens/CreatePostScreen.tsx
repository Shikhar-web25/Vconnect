import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../supabaseClient';

const PRIMARY = '#4A6D8C';
const BG = '#F1F5F9';
const CARD = '#FFFFFF';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

const DEFAULT_TAGS = [
  'Research',
  'Internship',
  'Scholarship',
  'Volunteer',
  'Event',
  'Hackathon',
  'Career',
  'Announcements',
];

const normalizeTag = (value: string) =>
  value
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();

  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const availableTags = useMemo(
    () => Array.from(new Set([...DEFAULT_TAGS, ...customTags])),
    [customTags],
  );

  const addHighlight = () => {
    if (highlights.length >= 6) return;
    setHighlights((prev) => [...prev, '']);
  };

  const removeHighlight = (index: number) => {
    if (highlights.length === 1) {
      setHighlights(['']);
      return;
    }
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const updateHighlight = (value: string, index: number) => {
    setHighlights((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const normalized = normalizeTag(customTagInput);
    if (!normalized) return;
    const display = normalized
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('-');

    if (!availableTags.some((tag) => tag.toLowerCase() === display.toLowerCase())) {
      setCustomTags((prev) => [...prev, display]);
    }
    if (!selectedTags.some((tag) => tag.toLowerCase() === display.toLowerCase())) {
      setSelectedTags((prev) => [...prev, display]);
    }
    setCustomTagInput('');
  };

  const normalizedTags = selectedTags.map(normalizeTag).filter(Boolean);
  const cleanedHighlights = highlights.map((item) => item.trim()).filter(Boolean);

  const buildContent = (appendHashtags: boolean) => {
    const lines: string[] = [];
    if (description.trim()) lines.push(description.trim());
    if (cleanedHighlights.length > 0) {
      lines.push('');
      cleanedHighlights.forEach((item) => lines.push(`• ${item}`));
    }
    if (appendHashtags && normalizedTags.length > 0) {
      lines.push('');
      lines.push(normalizedTags.map((tag) => `#${tag}`).join(' '));
    }
    return lines.join('\n').trim();
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please add a post title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description required', 'Please add post content before publishing.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Not logged in', 'Please log in again and retry.');
      return;
    }

    setPublishing(true);

    const basePayload: Record<string, any> = {
      user_id: user.id,
      title: title.trim(),
      content: buildContent(false),
      likes_count: 0,
      comments_count: 0,
    };

    let { error } = await supabase.from('posts').insert({
      ...basePayload,
      tags: normalizedTags,
    });

    if (error?.message?.toLowerCase().includes('tags')) {
      const fallback = await supabase.from('posts').insert({
        ...basePayload,
        content: buildContent(true),
      });
      error = fallback.error;
    }

    setPublishing(false);

    if (error) {
      Alert.alert('Publish failed', error.message);
      return;
    }

    Alert.alert('Posted', 'Your discover post is now live.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const canGoPreview = title.trim().length > 0 && description.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Icon name="arrow-back" size={21} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{step === 1 ? 'Create Post' : 'Preview Post'}</Text>
            <Text style={styles.headerSubtitle}>Step {step} of 2</Text>
          </View>

          {step === 1 ? (
            <TouchableOpacity
              style={[styles.headerAction, !canGoPreview && styles.headerActionDisabled]}
              disabled={!canGoPreview}
              onPress={() => setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.headerActionText}>Preview</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.headerAction} onPress={handlePublish} activeOpacity={0.85} disabled={publishing}>
              {publishing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.headerActionText}>Post</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {step === 1 ? (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>Post Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Write a strong title"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                maxLength={120}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your post in detail"
                placeholderTextColor="#94A3B8"
                style={[styles.input, styles.multiline]}
                multiline
                textAlignVertical="top"
                maxLength={1200}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.label}>Tags</Text>
                <Text style={styles.smallHint}>Select existing or add your own</Text>
              </View>
              <View style={styles.tagsWrap}>
                {availableTags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      activeOpacity={0.85}
                      style={[styles.tagButton, selected && styles.tagButtonSelected]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagButtonText, selected && styles.tagButtonTextSelected]}>#{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.addTagRow}>
                <TextInput
                  value={customTagInput}
                  onChangeText={setCustomTagInput}
                  placeholder="Add new tag"
                  placeholderTextColor="#94A3B8"
                  style={styles.addTagInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.addTagBtn} onPress={addCustomTag} activeOpacity={0.85}>
                  <Icon name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.label}>Highlights (Optional)</Text>
                <TouchableOpacity onPress={addHighlight} activeOpacity={0.8}>
                  <Text style={styles.addHighlightText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {highlights.map((item, index) => (
                <View key={`hl-${index}`} style={styles.highlightRow}>
                  <View style={styles.bulletDot} />
                  <TextInput
                    value={item}
                    onChangeText={(value) => updateHighlight(value, index)}
                    placeholder={`Highlight ${index + 1}`}
                    placeholderTextColor="#94A3B8"
                    style={styles.highlightInput}
                  />
                  <TouchableOpacity onPress={() => removeHighlight(index)} activeOpacity={0.75}>
                    <Icon name="close" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.previewHint}>This is how your post will look on Discover.</Text>

            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={styles.previewAvatar}>
                  <Icon name="person" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewAuthor}>You</Text>
                  <Text style={styles.previewMeta}>Just now</Text>
                </View>
              </View>

              <Text style={styles.previewTitle}>{title.trim() || 'Untitled Post'}</Text>
              <Text style={styles.previewDescription}>{description.trim()}</Text>

              {selectedTags.length > 0 ? (
                <View style={styles.previewTagsWrap}>
                  {selectedTags.map((tag) => (
                    <View key={`preview-${tag}`} style={styles.previewTag}>
                      <Text style={styles.previewTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {cleanedHighlights.length > 0 ? (
                <View style={styles.previewHighlightsWrap}>
                  {cleanedHighlights.map((item, index) => (
                    <View key={`preview-hl-${index}`} style={styles.previewHighlightRow}>
                      <View style={styles.previewDot} />
                      <Text style={styles.previewHighlightText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.previewFooter}>
                <View style={styles.previewFooterItem}>
                  <Icon name="thumb-up" size={15} color={TEXT_MUTED} />
                  <Text style={styles.previewFooterText}>0</Text>
                </View>
                <View style={styles.previewFooterItem}>
                  <Icon name="chat-bubble-outline" size={15} color={TEXT_MUTED} />
                  <Text style={styles.previewFooterText}>0</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.backEditBtn} onPress={() => setStep(1)} activeOpacity={0.85}>
              <Icon name="edit" size={16} color={PRIMARY} />
              <Text style={styles.backEditText}>Back to edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} activeOpacity={0.88} disabled={publishing}>
              {publishing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.publishBtnText}>Publish to Discover</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PRIMARY },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSubtitle: { marginTop: 1, color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  headerAction: {
    minWidth: 72,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
  },
  headerActionDisabled: { opacity: 0.5 },
  headerActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  body: { flex: 1, backgroundColor: BG },
  bodyContent: { padding: 16, paddingBottom: 34, gap: 14 },
  section: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  smallHint: { fontSize: 11, color: TEXT_MUTED },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#D6DEED',
    paddingHorizontal: 12,
    color: TEXT_DARK,
    backgroundColor: '#F8FAFF',
  },
  multiline: {
    minHeight: 110,
    height: 110,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: '#D6DEED',
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: '#F8FAFF',
  },
  tagButtonSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#E8F0F7',
  },
  tagButtonText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  tagButtonTextSelected: {
    color: '#1B4B7E',
  },
  addTagRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  addTagInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6DEED',
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 12,
    color: TEXT_DARK,
  },
  addTagBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHighlightText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '700',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  highlightInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6DEED',
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 10,
    color: TEXT_DARK,
  },
  previewHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 4,
  },
  previewCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE6F1',
    padding: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  previewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAuthor: { fontSize: 13, color: TEXT_DARK, fontWeight: '700' },
  previewMeta: { fontSize: 10, color: TEXT_MUTED },
  previewTitle: {
    fontSize: 17,
    color: TEXT_DARK,
    fontWeight: '800',
    marginBottom: 6,
  },
  previewDescription: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    fontWeight: '500',
  },
  previewTagsWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewTag: {
    borderRadius: 999,
    backgroundColor: '#E8F0F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  previewTagText: {
    color: '#1B4B7E',
    fontSize: 12,
    fontWeight: '800',
  },
  previewHighlightsWrap: {
    marginTop: 10,
    gap: 6,
  },
  previewHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  previewDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: PRIMARY,
  },
  previewHighlightText: {
    flex: 1,
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  previewFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    flexDirection: 'row',
    gap: 16,
  },
  previewFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewFooterText: { fontSize: 12, color: TEXT_MUTED, fontWeight: '700' },
  backEditBtn: {
    marginTop: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backEditText: { color: PRIMARY, fontSize: 13, fontWeight: '700' },
  publishBtn: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  publishBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
