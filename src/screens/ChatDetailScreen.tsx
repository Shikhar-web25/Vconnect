import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { getMaleAvatar } from '../utils/avatar';
import { supabase } from '../../supabaseClient';
import { useAppTheme } from '../theme/AppThemeContext';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const SENT = '#5B6AF0';
const TEXT_DARK = '#1A1A2E';
const DOODLE = require('./doodle.png');

type ChatDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  status: 'sending' | 'sent' | 'failed';
  isRead?: boolean;
}

const STATUS_H = StatusBar.currentHeight || 0;
const HEADER_PT = Platform.OS === 'android' ? STATUS_H + 10 : 50;
const HEADER_TOTAL = HEADER_PT + 12 + 38;

const toImageSource = (value: any): ImageSourcePropType => {
  if (typeof value === 'string' && value.trim()) return { uri: value };
  if (typeof value === 'number') return value;
  return getMaleAvatar(0);
};

const ChatDetailScreen = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChatDetailScreenRouteProp>();
  const { chatId, name, avatar, userId } = route.params || {
    chatId: '',
    name: 'User',
    avatar: null,
    userId: undefined,
  };
  const displayAvatar = toImageSource(avatar);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attachVisible, setAttachVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const formatTime = (isoDate?: string | null) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const appendMessage = useCallback((row: any, userId: string) => {
    const mapped: Message = {
      id: row.id,
      text: row.message_text ?? '',
      time: formatTime(row.created_at),
      isMe: row.sender_id === userId,
      status: 'sent',
      isRead: Boolean(row.read_status),
    };
    setMessages((prev) => (prev.some((item) => item.id === mapped.id) ? prev : [...prev, mapped]));
  }, []);

  const markConversationAsRead = useCallback(
    async (viewerId: string) => {
      if (!viewerId || !chatId) return;
      await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('receiver_id', viewerId)
        .eq('sender_id', chatId)
        .eq('read_status', false);
    },
    [chatId],
  );

  const loadConversation = useCallback(
    async (userIdOverride?: string) => {
      let userId = userIdOverride;
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? undefined;
      }
      if (!userId || !chatId) return;
      setCurrentUserId(userId);

      let data: any[] | null = null;
      let error: any = null;

      const primary = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, message_text, created_at, read_status')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${userId})`,
        )
        .order('created_at', { ascending: true });
      data = primary.data as any[] | null;
      error = primary.error;

      if (error?.message?.toLowerCase().includes('read_status')) {
        const fallback = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id, message_text, created_at')
          .or(
            `and(sender_id.eq.${userId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${userId})`,
          )
          .order('created_at', { ascending: true });
        data = fallback.data as any[] | null;
        error = fallback.error;
      }

      if (error) {
        return;
      }

      const mapped: Message[] = (data ?? []).map((row: any) => ({
        id: row.id,
        text: row.message_text ?? '',
        time: formatTime(row.created_at),
        isMe: row.sender_id === userId,
        status: 'sent',
        isRead: Boolean(row.read_status),
      }));
      setMessages(mapped);
      await markConversationAsRead(userId);
    },
    [chatId, markConversationAsRead],
  );

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () =>
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    let realtimeChannel: any = null;

    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted || !user || !chatId) return;

      setCurrentUserId(user.id);
      await loadConversation(user.id);

      realtimeChannel = supabase
        .channel(`chat-room-${user.id}-${chatId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload: any) => {
            const row = payload?.new;
            if (!row) return;
            const matchesConversation =
              (row.sender_id === user.id && row.receiver_id === chatId) ||
              (row.sender_id === chatId && row.receiver_id === user.id);
            if (!matchesConversation) return;
            appendMessage(row, user.id);
            if (row.sender_id === chatId && row.receiver_id === user.id) {
              markConversationAsRead(user.id);
            }
          },
        )
        .subscribe();
    };

    initialize();

    return () => {
      mounted = false;
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [appendMessage, chatId, loadConversation, markConversationAsRead]);

  const sendMessage = useCallback(async (overrideText?: string, existingLocalId?: string) => {
    const content = (overrideText ?? inputText).trim();
    if (!content || !currentUserId || !chatId) return;
    const localId = existingLocalId ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const localTime = formatTime(new Date().toISOString());

    if (existingLocalId) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === existingLocalId
            ? { ...item, status: 'sending', time: localTime }
            : item,
        ),
      );
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: localId,
          text: content,
          time: localTime,
          isMe: true,
          status: 'sending',
        },
      ]);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }

    let { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: chatId,
        message_text: content,
        read_status: false,
      })
      .select('id, sender_id, receiver_id, message_text, created_at, read_status')
      .single();

    if (error?.message?.toLowerCase().includes('read_status')) {
      const fallback = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: chatId,
          message_text: content,
        })
        .select('id, sender_id, receiver_id, message_text, created_at')
        .single();
      data = fallback.data as any;
      error = fallback.error;
    }

    if (error || !data) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === localId ? { ...item, status: 'failed' } : item,
        ),
      );
      return;
    }

    const [user1, user2] = currentUserId < chatId ? [currentUserId, chatId] : [chatId, currentUserId];
    await supabase.from('conversations').upsert(
      {
        user1,
        user2,
        last_message: content,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'user1,user2' },
    );

    setMessages((prev) =>
      prev.map((item) =>
        item.id === localId
          ? {
              id: data.id,
              text: data.message_text ?? content,
              time: formatTime(data.created_at),
              isMe: true,
              status: 'sent',
              isRead: Boolean(data.read_status),
            }
          : item,
      ),
    );
  }, [chatId, currentUserId, inputText]);

  const retryMessage = useCallback(
    (message: Message) => {
      if (message.status !== 'failed') return;
      sendMessage(message.text, message.id);
    },
    [sendMessage],
  );

  const goToProfile = useCallback(() => {
    setMenuVisible(false);
    navigation.navigate('UserProfile', {
      userId: userId ?? chatId,
      name,
      avatar: displayAvatar,
      about: 'Hey there! I am using Vconnect',
      bio: 'Living the college life',
    });
  }, [chatId, displayAvatar, name, navigation, userId]);

  const onAttachment = useCallback(() => {
    setAttachVisible(false);
    setComingSoon(true);
  }, []);

  const renderMsg = useCallback(
    ({ item }: { item: Message }) => (
      <View style={[styles.msgRow, item.isMe ? styles.rowR : styles.rowL]}>
        <View style={[styles.bubble, item.isMe ? styles.bubbleSent : styles.bubbleReceived]}>
          <Text style={[styles.msgText, item.isMe ? styles.msgTextSent : styles.msgTextReceived]}>
            {item.text}
          </Text>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, item.isMe ? styles.timeSent : styles.timeReceived]}>
              {item.time}
            </Text>
            {item.isMe && item.status === 'sending' ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.75)" style={{ marginLeft: 4 }} />
            ) : null}
            {item.isMe && item.status === 'sent' ? (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : 'checkmark'}
                size={14}
                color="rgba(255,255,255,0.65)"
                style={{ marginLeft: 4 }}
              />
            ) : null}
            {item.isMe && item.status === 'failed' ? (
              <TouchableOpacity onPress={() => retryMessage(item)} activeOpacity={0.8}>
                <Ionicons name="alert-circle" size={14} color="#FCA5A5" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    ),
    [retryMessage],
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerProfile} onPress={goToProfile} activeOpacity={0.7}>
          <View style={styles.avatarRing}>
            <Image source={displayAvatar} style={styles.headerAv} />
          </View>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 6 }} onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_TOTAL : HEADER_TOTAL}
      >
        <ImageBackground source={DOODLE} style={styles.chatArea} imageStyle={styles.doodleImage} resizeMode="repeat">
          <View style={styles.doodleTint} />

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(i) => i.id}
            renderItem={renderMsg}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            style={{ flex: 1 }}
          />

          <View style={styles.inputOuter}>
            <View style={styles.floatingInput}>
              <TouchableOpacity style={styles.plusBtn} onPress={() => setAttachVisible(true)} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={26} color={ACCENT} />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Message..."
                placeholderTextColor="#A0AEC0"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity style={styles.emojiBtn} onPress={() => setComingSoon(true)}>
                <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#A0AEC0" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, inputText.trim() ? styles.sendActive : null]}
                onPress={() => sendMessage()}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="send"
                  size={16}
                  color={inputText.trim() ? '#FFF' : '#C0C8D8'}
                  style={{ marginLeft: 1 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>

      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay}>
            <View style={[styles.menu, { top: 90, right: 16 }]}>
              <TouchableOpacity style={styles.menuItem} onPress={goToProfile}>
                <Ionicons name="person-circle-outline" size={22} color={ACCENT} style={{ marginRight: 12 }} />
                <Text style={styles.menuText}>View Profile</Text>
              </TouchableOpacity>
              <View style={styles.menuDiv} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMessages([]);
                  setMenuVisible(false);
                }}
              >
                <Ionicons name="trash-outline" size={22} color="#EF4444" style={{ marginRight: 12 }} />
                <Text style={[styles.menuText, { color: '#EF4444' }]}>Clear Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent visible={attachVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setAttachVisible(false)}>
          <View style={[styles.overlay, { justifyContent: 'flex-end' }]}>
            <TouchableWithoutFeedback>
              <View style={styles.attachSheet}>
                <View style={styles.attachHandle} />
                <Text style={styles.attachTitle}>Share Content</Text>
                <View style={styles.attachRow}>
                  <TouchableOpacity style={styles.attachOpt} onPress={onAttachment} activeOpacity={0.7}>
                    <View style={[styles.attachIcon, { backgroundColor: ACCENT }]}>
                      <Ionicons name="document" size={26} color="#FFF" />
                    </View>
                    <Text style={styles.attachText}>Document</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachOpt} onPress={onAttachment} activeOpacity={0.7}>
                    <View style={[styles.attachIcon, { backgroundColor: '#EC4899' }]}>
                      <Ionicons name="image" size={26} color="#FFF" />
                    </View>
                    <Text style={styles.attachText}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachOpt} onPress={onAttachment} activeOpacity={0.7}>
                    <View style={[styles.attachIcon, { backgroundColor: '#F59E0B' }]}>
                      <Ionicons name="camera" size={26} color="#FFF" />
                    </View>
                    <Text style={styles.attachText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent visible={comingSoon} animationType="fade" onRequestClose={() => setComingSoon(false)}>
        <TouchableWithoutFeedback onPress={() => setComingSoon(false)}>
          <View style={styles.csOverlay}>
            <View style={styles.csCard}>
              <View style={styles.csIconWrap}>
                <Ionicons name="rocket-outline" size={32} color={ACCENT} />
              </View>
              <Text style={styles.csTitle}>Coming Soon</Text>
              <Text style={styles.csSub}>
                This feature will be available in the next update. Stay tuned!
              </Text>
              <TouchableOpacity style={styles.csBtn} onPress={() => setComingSoon(false)} activeOpacity={0.8}>
                <Text style={styles.csBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EAF6' },
  header: {
    paddingTop: HEADER_PT,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: DEEP,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    zIndex: 10,
  },
  headerProfile: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 4 },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(91,106,240,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 2,
  },
  headerAv: { width: 36, height: 36, borderRadius: 18 },
  headerName: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  chatArea: { flex: 1, backgroundColor: '#E8EAF6' },
  doodleImage: { opacity: 0.55 },
  doodleTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(200, 210, 245, 0.30)',
  },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  rowL: { justifyContent: 'flex-start' },
  rowR: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleReceived: { backgroundColor: '#F0F2FA', borderBottomLeftRadius: 4 },
  bubbleSent: { backgroundColor: SENT, borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextReceived: { color: '#2D3748' },
  msgTextSent: { color: '#FFF' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3 },
  timeText: { fontSize: 10, fontWeight: '500' },
  timeSent: { color: 'rgba(255,255,255,0.55)' },
  timeReceived: { color: '#94A3B8' },
  inputOuter: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
  },
  floatingInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 6,
    minHeight: 52,
    elevation: 10,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  plusBtn: { paddingHorizontal: 8, paddingVertical: 10 },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    maxHeight: 100,
  },
  emojiBtn: { paddingHorizontal: 6, paddingVertical: 10 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF0F8',
    marginRight: 2,
  },
  sendActive: { backgroundColor: ACCENT, elevation: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(30,26,46,0.4)' },
  menu: { position: 'absolute', backgroundColor: '#FFF', borderRadius: 18, width: 185, paddingVertical: 8, elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  menuText: { fontSize: 15, fontWeight: '600', color: '#334155' },
  menuDiv: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  attachSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    elevation: 12,
  },
  attachHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  attachTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK, textAlign: 'center', marginBottom: 20 },
  attachRow: { flexDirection: 'row', justifyContent: 'space-around' },
  attachOpt: { alignItems: 'center' },
  attachIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
  },
  attachText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  csOverlay: { flex: 1, backgroundColor: 'rgba(15,12,40,0.75)', justifyContent: 'center', alignItems: 'center' },
  csCard: { width: Dimensions.get('window').width * 0.72, backgroundColor: '#FFF', borderRadius: 24, padding: 28, alignItems: 'center' },
  csIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF0FA', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  csTitle: { fontSize: 20, fontWeight: '800', color: DEEP, marginBottom: 8 },
  csSub: { fontSize: 14, color: '#8892A6', textAlign: 'center', lineHeight: 20, marginBottom: 20, fontWeight: '500' },
  csBtn: { backgroundColor: ACCENT, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 14 },
  csBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default ChatDetailScreen;
