import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseClient';

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=12';

export type ActivityNotificationType = 'message' | 'comment';

export type ActivityNotification = {
  id: string;
  sourceId: string;
  type: ActivityNotificationType;
  actorId?: string | null;
  actorName: string;
  actorAvatar: string;
  content: string;
  createdAt: string;
  read: boolean;
  postTitle?: string | null;
  preview?: string;
};

const getLastSeenKey = (userId: string) => `@vconnect.notifications.last_seen.${userId}`;

export const readLastSeenAt = async (userId: string) => {
  const raw = await AsyncStorage.getItem(getLastSeenKey(userId));
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
};

export const markAllSeenNow = async (userId: string) => {
  const now = Date.now();
  await AsyncStorage.setItem(getLastSeenKey(userId), String(now));
  return now;
};

const trimPreview = (value?: string | null) => {
  const text = `${value ?? ''}`.trim();
  if (!text) return '';
  return text.length > 70 ? `${text.slice(0, 67)}...` : text;
};

const resolveActorLabel = (profile?: any) =>
  profile?.full_name ?? profile?.username ?? 'Student';

const resolveActorAvatar = (profile?: any) =>
  profile?.avatar_url ?? FALLBACK_AVATAR;

export const fetchActivityNotifications = async (userId: string, limit = 120): Promise<ActivityNotification[]> => {
  const lastSeenMs = await readLastSeenAt(userId);
  const lastSeenDate = new Date(lastSeenMs).toISOString();

  const { data: postsRows } = await supabase
    .from('posts')
    .select('id, title')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(400);

  const ownPosts = postsRows ?? [];
  const ownPostIds = ownPosts.map((post: any) => post.id);
  const ownPostTitleMap = new Map<string, string | null>(
    ownPosts.map((post: any) => [post.id, post.title ?? null]),
  );

  let { data: messageRows, error: messageError } = await supabase
    .from('messages')
    .select('id, sender_id, message_text, created_at, read_status')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (messageError?.message?.toLowerCase().includes('read_status')) {
    const fallback = await supabase
      .from('messages')
      .select('id, sender_id, message_text, created_at')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    messageRows = fallback.data as any[] | null;
    messageError = fallback.error;
  }

  let commentRows: any[] = [];
  if (ownPostIds.length > 0) {
    const { data } = await supabase
      .from('comments')
      .select('id, post_id, user_id, content, created_at')
      .in('post_id', ownPostIds)
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    commentRows = data ?? [];
  }

  const actorIds = Array.from(
    new Set([
      ...(messageRows ?? []).map((row: any) => row.sender_id).filter(Boolean),
      ...commentRows.map((row: any) => row.user_id).filter(Boolean),
    ]),
  );

  const actorMap = new Map<string, any>();
  if (actorIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', actorIds);
    (profileRows ?? []).forEach((profile: any) => {
      actorMap.set(profile.id, profile);
    });
  }

  const messageNotifications: ActivityNotification[] = (messageRows ?? []).map((row: any) => {
    const actor = actorMap.get(row.sender_id);
    return {
      id: `message-${row.id}`,
      sourceId: row.id,
      type: 'message',
      actorId: row.sender_id,
      actorName: resolveActorLabel(actor),
      actorAvatar: resolveActorAvatar(actor),
      content: 'sent you a message',
      preview: trimPreview(row.message_text),
      createdAt: row.created_at,
      read: Boolean(row.read_status),
    };
  });

  const commentNotifications: ActivityNotification[] = commentRows.map((row: any) => {
    const actor = actorMap.get(row.user_id);
    const rowTime = new Date(row.created_at).getTime();
    return {
      id: `comment-${row.id}`,
      sourceId: row.id,
      type: 'comment',
      actorId: row.user_id,
      actorName: resolveActorLabel(actor),
      actorAvatar: resolveActorAvatar(actor),
      content: 'commented on your post',
      preview: trimPreview(row.content),
      createdAt: row.created_at,
      read: rowTime <= lastSeenMs || row.created_at <= lastSeenDate,
      postTitle: ownPostTitleMap.get(row.post_id) ?? null,
    };
  });

  return [...messageNotifications, ...commentNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const fetchUnreadNotificationCount = async (userId: string) => {
  const lastSeenMs = await readLastSeenAt(userId);
  const lastSeenIso = new Date(lastSeenMs).toISOString();

  let { count: unreadMessages, error: unreadMessageError } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('read_status', false);

  if (unreadMessageError?.message?.toLowerCase().includes('read_status')) {
    const fallback = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .gt('created_at', lastSeenIso);
    unreadMessages = fallback.count ?? 0;
  }

  const { data: ownPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId)
    .limit(400);

  const ownPostIds = (ownPosts ?? []).map((post: any) => post.id);
  let unreadComments = 0;

  if (ownPostIds.length > 0) {
    const { count } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .in('post_id', ownPostIds)
      .neq('user_id', userId)
      .gt('created_at', lastSeenIso);
    unreadComments = count ?? 0;
  }

  return (unreadMessages ?? 0) + unreadComments;
};
