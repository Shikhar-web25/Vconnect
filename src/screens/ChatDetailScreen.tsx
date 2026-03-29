import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Alert,
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
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { getMaleAvatar } from '../utils/avatar';
import { supabase } from '../../supabaseClient';
import { useAppTheme } from '../theme/AppThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmojiPicker from 'rn-emoji-keyboard';

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

const GIF_LIBRARY = [
  'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
  'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
  'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif',
  'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
  'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  'https://media.giphy.com/media/fxsqOYnIMEefC/giphy.gif',
  'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
  'https://media.giphy.com/media/9J7tdYltWyXIY/giphy.gif',
  'https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif',
  'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif',
];

const STICKER_LIBRARY = [
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f44d.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f44f.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f525.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f680.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f389.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4af.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f60e.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/2764.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f44c.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f973.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f64c.png',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f929.png',
];

const parseMediaMessage = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[gif]')) {
    return { type: 'gif' as const, url: trimmed.slice(5).trim() };
  }
  if (trimmed.startsWith('[sticker]')) {
    return { type: 'sticker' as const, url: trimmed.slice(9).trim() };
  }
  return { type: 'text' as const, text: raw };
};

const toImageSource = (value: any): ImageSourcePropType => {
  if (typeof value === 'string' && value.trim()) return { uri: value };
  if (typeof value === 'number') return value;
  return getMaleAvatar(0);
};

const ChatDetailScreen = () => {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
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
  const [starredMessageIds, setStarredMessageIds] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attachVisible, setAttachVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [mediaPickerTab, setMediaPickerTab] = useState<'gif' | 'sticker'>('gif');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const starredIdSet = useMemo(() => new Set(starredMessageIds), [starredMessageIds]);

  const formatTime = (isoDate?: string | null) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const appendMessage = useCallback((row: any, userId: string) => {
    const bodyText = row.message_text ?? row.content ?? '';
    const mapped: Message = {
      id: row.id,
      text: bodyText,
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

  const loadStarredMessages = useCallback(async (viewerId: string, messageIds: string[]) => {
    if (!viewerId || messageIds.length === 0) {
      setStarredMessageIds([]);
      return;
    }
    const { data, error } = await supabase
      .from('message_stars')
      .select('message_id')
      .eq('user_id', viewerId)
      .in('message_id', messageIds);
    if (error) {
      setStarredMessageIds([]);
      return;
    }
    const nextIds = ((data as any[]) ?? [])
      .map((row) => `${row?.message_id ?? ''}`.trim())
      .filter(Boolean);
    setStarredMessageIds(nextIds);
  }, []);

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

      const selectVariants = [
        'id, sender_id, receiver_id, message_text, content, created_at, read_status',
        'id, sender_id, receiver_id, message_text, content, created_at',
        'id, sender_id, receiver_id, message_text, created_at, read_status',
        'id, sender_id, receiver_id, message_text, created_at',
        'id, sender_id, receiver_id, content, created_at, read_status',
        'id, sender_id, receiver_id, content, created_at',
      ];

      for (const selectValue of selectVariants) {
        const result = await supabase
          .from('messages')
          .select(selectValue)
          .or(
            `and(sender_id.eq.${userId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${userId})`,
          )
          .order('created_at', { ascending: true });
        data = result.data as any[] | null;
        error = result.error;
        if (!error) {
          break;
        }
      }

      if (error) {
        return;
      }

      const mapped: Message[] = (data ?? []).map((row: any) => ({
        id: row.id,
        text: row.message_text ?? row.content ?? '',
        time: formatTime(row.created_at),
        isMe: row.sender_id === userId,
        status: 'sent',
        isRead: Boolean(row.read_status),
      }));
      setMessages(mapped);
      await loadStarredMessages(
        userId,
        mapped.map((item) => item.id).filter(Boolean),
      );
      await markConversationAsRead(userId);
    },
    [chatId, loadStarredMessages, markConversationAsRead],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      if (Platform.OS === 'android') {
        const nextHeight = event?.endCoordinates?.height ?? 0;
        setKeyboardOffset(Math.max(0, nextHeight - insets.bottom));
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 90);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === 'android') {
        setKeyboardOffset(0);
      }
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom]);

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

    let data: any = null;
    let error: any = null;

    const insertPayloads = [
      { sender_id: currentUserId, receiver_id: chatId, message_text: content, content, read_status: false },
      { sender_id: currentUserId, receiver_id: chatId, message_text: content, content },
      { sender_id: currentUserId, receiver_id: chatId, content, read_status: false },
      { sender_id: currentUserId, receiver_id: chatId, content },
      { sender_id: currentUserId, receiver_id: chatId, message_text: content, read_status: false },
      { sender_id: currentUserId, receiver_id: chatId, message_text: content },
    ];

    const selectVariants = [
      'id, sender_id, receiver_id, message_text, content, created_at, read_status',
      'id, sender_id, receiver_id, message_text, content, created_at',
      'id, sender_id, receiver_id, message_text, created_at, read_status',
      'id, sender_id, receiver_id, message_text, created_at',
      'id, sender_id, receiver_id, content, created_at, read_status',
      'id, sender_id, receiver_id, content, created_at',
    ];

    for (const payload of insertPayloads) {
      for (const selectValue of selectVariants) {
        const result = await supabase
          .from('messages')
          .insert(payload)
          .select(selectValue)
          .single();
        data = result.data as any;
        error = result.error;
        if (!error && data) {
          break;
        }
      }
      if (!error && data) {
        break;
      }
    }

    if (error || !data) {
      Alert.alert('Message not sent', error?.message ?? 'Could not send message. Please retry.');
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
              text: data.message_text ?? data.content ?? content,
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

  const toggleStarMessage = useCallback(
    async (message: Message) => {
      if (!currentUserId || !message.id || message.id.startsWith('local-')) return;
      const alreadyStarred = starredIdSet.has(message.id);
      if (alreadyStarred) {
        const { error } = await supabase
          .from('message_stars')
          .delete()
          .eq('user_id', currentUserId)
          .eq('message_id', message.id);
        if (error) {
          Alert.alert('Could not remove star', error.message ?? 'Please try again.');
          return;
        }
        setStarredMessageIds((prev) => prev.filter((id) => id !== message.id));
        return;
      }
      const { error } = await supabase.from('message_stars').insert({
        user_id: currentUserId,
        message_id: message.id,
      });
      if (error && !/duplicate/i.test(`${error?.message ?? ''}`)) {
        Alert.alert('Could not star message', error.message ?? 'Please try again.');
        return;
      }
      setStarredMessageIds((prev) => (prev.includes(message.id) ? prev : [...prev, message.id]));
    },
    [currentUserId, starredIdSet],
  );

  const onMessageLongPress = useCallback(
    (message: Message) => {
      const starred = starredIdSet.has(message.id);
      Alert.alert(
        starred ? 'Unstar message?' : 'Star message?',
        'Starred messages appear in the user profile details.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: starred ? 'Unstar' : 'Star',
            onPress: () => {
              void toggleStarMessage(message);
            },
          },
        ],
      );
    },
    [starredIdSet, toggleStarMessage],
  );

  const toggleEmojiPicker = useCallback(() => {
    Keyboard.dismiss();
    setAttachVisible(false);
    setEmojiPickerVisible(true);
  }, []);

  const onEmojiPress = useCallback((emoji: { emoji: string }) => {
    setInputText((prev) => `${prev}${emoji.emoji}`);
  }, []);

  const openMediaPicker = useCallback((tab: 'gif' | 'sticker') => {
    setAttachVisible(false);
    setEmojiPickerVisible(false);
    setMediaPickerTab(tab);
    setMediaPickerVisible(true);
  }, []);

  const handleSendMedia = useCallback(
    (kind: 'gif' | 'sticker', url: string) => {
      setMediaPickerVisible(false);
      sendMessage(`[${kind}]${url}`);
    },
    [sendMessage],
  );

  const handleOpenKeyboard = useCallback(() => {
    setEmojiPickerVisible(false);
    setMediaPickerVisible(false);
    inputRef.current?.focus();
  }, []);

  const renderMsg = useCallback(
    ({ item }: { item: Message }) => {
      const parsed = parseMediaMessage(item.text);
      const isMedia = parsed.type !== 'text';
      const isStarred = starredIdSet.has(item.id);
      return (
        <View style={[styles.msgRow, item.isMe ? styles.rowR : styles.rowL]}>
          <TouchableOpacity activeOpacity={0.95} onLongPress={() => onMessageLongPress(item)} delayLongPress={180}>
            <View
              style={[
                styles.bubble,
                item.isMe ? styles.bubbleSent : styles.bubbleReceived,
                isMedia ? styles.mediaBubble : null,
              ]}
            >
              {isStarred ? (
                <Ionicons
                  name="star"
                  size={13}
                  color={item.isMe ? 'rgba(255, 242, 196, 0.95)' : '#F59E0B'}
                  style={styles.starBadge}
                />
              ) : null}
              {parsed.type === 'text' ? (
                <Text style={[styles.msgText, item.isMe ? styles.msgTextSent : styles.msgTextReceived]}>
                  {parsed.text}
                </Text>
              ) : (
                <Image
                  source={{ uri: parsed.url }}
                  style={parsed.type === 'sticker' ? styles.stickerImage : styles.gifImage}
                  resizeMode={parsed.type === 'sticker' ? 'contain' : 'cover'}
                />
              )}
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
          </TouchableOpacity>
        </View>
      );
    },
    [onMessageLongPress, retryMessage, starredIdSet],
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_TOTAL : 0}
      >
        <ImageBackground source={DOODLE} style={styles.chatArea} imageStyle={styles.doodleImage} resizeMode="repeat">
          <View style={styles.doodleTint} />

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(i) => i.id}
            renderItem={renderMsg}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: emojiPickerVisible ? 18 : 10 },
            ]}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            style={{ flex: 1 }}
          />

          <View
            style={[
              styles.inputOuter,
              {
                paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 6) : 10,
                marginBottom: Platform.OS === 'android' ? keyboardOffset + 4 : 0,
              },
            ]}
          >
            <View style={styles.floatingInput}>
              <TouchableOpacity style={styles.plusBtn} onPress={() => setAttachVisible(true)} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={26} color={ACCENT} />
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Message..."
                placeholderTextColor="#A0AEC0"
                value={inputText}
                onChangeText={setInputText}
                onFocus={() => {
                  setEmojiPickerVisible(false);
                  setMediaPickerVisible(false);
                }}
                multiline
              />
              <TouchableOpacity style={styles.emojiBtn} onPress={toggleEmojiPicker}>
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
            {emojiPickerVisible ? (
              <TouchableOpacity style={styles.keyboardBackBtn} activeOpacity={0.85} onPress={handleOpenKeyboard}>
                <Ionicons name="keypad-outline" size={16} color="#D9E2FF" />
                <Text style={styles.keyboardBackText}>Keyboard</Text>
              </TouchableOpacity>
            ) : null}
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
                  <TouchableOpacity style={styles.attachOpt} onPress={() => openMediaPicker('gif')} activeOpacity={0.7}>
                    <View style={[styles.attachIcon, { backgroundColor: '#EC4899' }]}>
                      <Ionicons name="sparkles" size={26} color="#FFF" />
                    </View>
                    <Text style={styles.attachText}>GIF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachOpt} onPress={() => openMediaPicker('sticker')} activeOpacity={0.7}>
                    <View style={[styles.attachIcon, { backgroundColor: '#F59E0B' }]}>
                      <Ionicons name="happy" size={26} color="#FFF" />
                    </View>
                    <Text style={styles.attachText}>Sticker</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent visible={mediaPickerVisible} animationType="slide" onRequestClose={() => setMediaPickerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMediaPickerVisible(false)}>
          <View style={[styles.overlay, { justifyContent: 'flex-end' }]}>
            <TouchableWithoutFeedback>
              <View style={styles.mediaSheet}>
                <View style={styles.attachHandle} />
                <View style={styles.mediaHeader}>
                  <Text style={styles.mediaTitle}>Send {mediaPickerTab === 'gif' ? 'GIF' : 'Sticker'}</Text>
                  <TouchableOpacity
                    style={styles.mediaTabSwitch}
                    onPress={() => setMediaPickerTab((prev) => (prev === 'gif' ? 'sticker' : 'gif'))}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.mediaTabSwitchText}>
                      {mediaPickerTab === 'gif' ? 'Stickers' : 'GIFs'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.mediaGrid} showsVerticalScrollIndicator={false}>
                  {(mediaPickerTab === 'gif' ? GIF_LIBRARY : STICKER_LIBRARY).map((url) => (
                    <TouchableOpacity
                      key={`${mediaPickerTab}-${url}`}
                      style={styles.mediaCard}
                      activeOpacity={0.8}
                      onPress={() => handleSendMedia(mediaPickerTab, url)}
                    >
                      <Image
                        source={{ uri: url }}
                        style={mediaPickerTab === 'sticker' ? styles.mediaStickerPreview : styles.mediaGifPreview}
                        resizeMode={mediaPickerTab === 'sticker' ? 'contain' : 'cover'}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <EmojiPicker
        open={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onEmojiSelected={onEmojiPress}
      />

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
  starBadge: { position: 'absolute', top: 7, right: 8 },
  mediaBubble: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6, maxWidth: 230 },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextReceived: { color: '#2D3748' },
  msgTextSent: { color: '#FFF' },
  gifImage: { width: 210, height: 130, borderRadius: 12, backgroundColor: '#D7E2F8' },
  stickerImage: { width: 150, height: 150, alignSelf: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3 },
  timeText: { fontSize: 10, fontWeight: '500' },
  timeSent: { color: 'rgba(255,255,255,0.55)' },
  timeReceived: { color: '#94A3B8' },
  inputOuter: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
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
  keyboardBackBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(91,106,240,0.95)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  keyboardBackText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
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
  mediaSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    maxHeight: Dimensions.get('window').height * 0.62,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mediaTitle: { color: TEXT_DARK, fontSize: 16, fontWeight: '800' },
  mediaTabSwitch: {
    backgroundColor: '#EEF0FA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mediaTabSwitchText: { color: ACCENT, fontSize: 12, fontWeight: '700' },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 6,
  },
  mediaCard: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaGifPreview: { width: '100%', height: '100%' },
  mediaStickerPreview: { width: '82%', height: '82%' },
  csOverlay: { flex: 1, backgroundColor: 'rgba(15,12,40,0.75)', justifyContent: 'center', alignItems: 'center' },
  csCard: { width: Dimensions.get('window').width * 0.72, backgroundColor: '#FFF', borderRadius: 24, padding: 28, alignItems: 'center' },
  csIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF0FA', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  csTitle: { fontSize: 20, fontWeight: '800', color: DEEP, marginBottom: 8 },
  csSub: { fontSize: 14, color: '#8892A6', textAlign: 'center', lineHeight: 20, marginBottom: 20, fontWeight: '500' },
  csBtn: { backgroundColor: ACCENT, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 14 },
  csBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default ChatDetailScreen;
