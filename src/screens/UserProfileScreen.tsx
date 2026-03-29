import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { getMaleAvatar } from '../utils/avatar';
import { supabase } from '../../supabaseClient';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const BG = '#F0F2FA';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';
const { width: SW } = Dimensions.get('window');

type UserProfileScreenRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

type PublicProfile = {
    id: string;
    full_name?: string | null;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    year_of_study?: number | null;
    social_links?: string[] | null;
    resume_url?: string | null;
    resume_file_name?: string | null;
};

type SharedItem = {
    id: string;
    type: 'media' | 'doc' | 'link';
    label: string;
    url: string;
    createdAt?: string | null;
};

type StarredItem = {
    id: string;
    text: string;
    createdAt?: string | null;
};

const toImageSource = (value: any) => {
    if (typeof value === 'string' && value.trim()) return { uri: value };
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object') return value;
    return getMaleAvatar(0);
};

const URL_REGEX = /https?:\/\/[^\s)]+/gi;
const DOC_URL_REGEX = /\.(pdf|docx?|pptx?|xlsx?|txt)(\?|#|$)/i;
const MEDIA_URL_REGEX = /\.(png|jpe?g|webp|gif|mp4|mov|mkv|avi)(\?|#|$)/i;

const normalizeMessageText = (row: any) => `${row?.message_text ?? row?.content ?? ''}`.trim();
const extractUrls = (value: string) => Array.from(new Set(value.match(URL_REGEX) ?? []));

// Animated counter
const Counter = ({
    target,
    label,
    icon,
    iconColor,
}: {
    target: number | null;
    label: string;
    icon: string;
    iconColor: string;
}) => {
    const anim = useRef(new Animated.Value(0)).current;
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (target == null) {
            setVal(0);
            return;
        }
        const id = anim.addListener(({ value }) => setVal(Math.floor(value)));
        anim.setValue(0);
        Animated.timing(anim, { toValue: target, duration: 1200, useNativeDriver: false }).start();
        return () => anim.removeListener(id);
    }, [target]);
    return (
        <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: `${iconColor}18` }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={styles.statNum}>{target == null ? 'NA' : val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
};

const UserProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<UserProfileScreenRouteProp>();
    const params = route.params ?? {};

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [viewerId, setViewerId] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [portfolioVisible, setPortfolioVisible] = useState(false);
    const [sharedVisible, setSharedVisible] = useState(false);
    const [starredVisible, setStarredVisible] = useState(false);
    const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
    const [starredItems, setStarredItems] = useState<StarredItem[]>([]);
    const [stats, setStats] = useState({
        posts: 0,
        connections: 0,
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadUserProfile = async () => {
            setProfileLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!mounted) return;
            setViewerId(user?.id ?? null);

            const targetUserId = params.userId ?? user?.id ?? null;
            if (!targetUserId) {
                if (mounted) setProfileLoading(false);
                return;
            }

            let profileData: PublicProfile | null = null;
            const profileSelectVariants = [
                'id, full_name, username, bio, avatar_url, year_of_study, social_links, resume_url, resume_file_name',
                'id, full_name, username, bio, avatar_url, year_of_study',
            ];
            for (const selectValue of profileSelectVariants) {
                const result = await supabase
                    .from('profiles')
                    .select(selectValue)
                    .eq('id', targetUserId)
                    .single();
                if (!result.error && result.data) {
                    profileData = result.data as unknown as PublicProfile;
                    break;
                }
            }

            const [postsResult, sentMessagesResult, receivedMessagesResult] = await Promise.all([
                supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId),
                supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', targetUserId),
                supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', targetUserId),
            ]);

            let conversationRows: any[] = [];
            if (user?.id && targetUserId !== user.id) {
                const messageSelectVariants = [
                    'id, sender_id, receiver_id, message_text, content, created_at',
                    'id, sender_id, receiver_id, message_text, created_at',
                    'id, sender_id, receiver_id, content, created_at',
                ];
                for (const selectValue of messageSelectVariants) {
                    const result = await supabase
                        .from('messages')
                        .select(selectValue)
                        .or(
                            `and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId})`,
                        )
                        .order('created_at', { ascending: false })
                        .limit(250);
                    if (!result.error) {
                        conversationRows = (result.data as any[]) ?? [];
                        break;
                    }
                }
            }

            let starredMessageIds = new Set<string>();
            const conversationMessageIds = conversationRows
                .map((row) => `${row?.id ?? ''}`.trim())
                .filter(Boolean);
            if (user?.id && conversationMessageIds.length > 0) {
                const starsResult = await supabase
                    .from('message_stars')
                    .select('message_id')
                    .eq('user_id', user.id)
                    .in('message_id', conversationMessageIds);
                if (!starsResult.error) {
                    starredMessageIds = new Set(
                        ((starsResult.data as any[]) ?? [])
                            .map((row) => `${row?.message_id ?? ''}`.trim())
                            .filter(Boolean),
                    );
                }
            }

            const seenShared = new Set<string>();
            const nextShared: SharedItem[] = [];
            const nextStarred: StarredItem[] = [];
            for (const row of conversationRows) {
                const messageText = normalizeMessageText(row);
                if (!messageText) continue;

                const isStarred = starredMessageIds.has(`${row?.id ?? ''}`) || messageText.includes('⭐') || messageText.includes('★');
                if (isStarred) {
                    nextStarred.push({
                        id: row.id,
                        text: messageText,
                        createdAt: row.created_at,
                    });
                }

                const parsedMediaUrl =
                    messageText.startsWith('[gif]') || messageText.startsWith('[sticker]')
                        ? messageText.replace(/^\[(gif|sticker)\]/, '').trim()
                        : null;
                if (parsedMediaUrl && !seenShared.has(parsedMediaUrl)) {
                    seenShared.add(parsedMediaUrl);
                    nextShared.push({
                        id: `${row.id}-media`,
                        type: 'media',
                        label: 'Media from chat',
                        url: parsedMediaUrl,
                        createdAt: row.created_at,
                    });
                }

                const urls = extractUrls(messageText);
                urls.forEach((url, index) => {
                    if (seenShared.has(url)) return;
                    seenShared.add(url);
                    const isDoc = DOC_URL_REGEX.test(url);
                    const isMedia = MEDIA_URL_REGEX.test(url) || /giphy|tenor|cloudinary/i.test(url);
                    const type: SharedItem['type'] = isDoc ? 'doc' : isMedia ? 'media' : 'link';
                    nextShared.push({
                        id: `${row.id}-url-${index}`,
                        type,
                        label: type === 'doc' ? 'Document link' : type === 'media' ? 'Media link' : 'Shared link',
                        url,
                        createdAt: row.created_at,
                    });
                });
            }

            if (profileData?.resume_url && !seenShared.has(profileData.resume_url)) {
                seenShared.add(profileData.resume_url);
                nextShared.push({
                    id: 'profile-resume',
                    type: 'doc',
                    label: profileData.resume_file_name?.trim() || 'Profile resume',
                    url: profileData.resume_url,
                });
            }

            if (!mounted) return;
            setProfile(profileData);
            setSharedItems(nextShared);
            setStarredItems(nextStarred);

            const postsCount = postsResult.count ?? 0;
            const connectionsCount = (sentMessagesResult.count ?? 0) + (receivedMessagesResult.count ?? 0);

            setStats({
                posts: postsCount,
                connections: connectionsCount,
            });
            setProfileLoading(false);
        };

        loadUserProfile();

        return () => {
            mounted = false;
        };
    }, [params.userId]);

    const displayName =
        profile?.full_name?.trim() ||
        profile?.username?.trim() ||
        params.name ||
        'Vconnect User';
    const displayAvatar = toImageSource(profile?.avatar_url ?? params.avatar);
    const displayAbout = profile?.bio?.trim() || params.about || 'Hey there! I am using Vconnect';
    const displayBio = profile?.bio?.trim() || params.bio || 'Living the college life';
    const displayBatch =
        profile?.year_of_study != null
            ? String(profile.year_of_study)
            : params.batch || 'NA';
    const displayContributions =
        typeof params.contributions === 'number' && Number.isFinite(params.contributions)
            ? params.contributions
            : null;
    const portfolioLinks = useMemo(() => {
        const links: { id: string; label: string; url: string }[] = [];
        (profile?.social_links ?? []).forEach((link, index) => {
            if (!link?.trim()) return;
            links.push({
                id: `social-${index}`,
                label: `Social Link ${index + 1}`,
                url: link.trim(),
            });
        });
        if (profile?.resume_url?.trim()) {
            links.push({
                id: 'resume',
                label: profile?.resume_file_name?.trim() || 'Resume',
                url: profile.resume_url.trim(),
            });
        }
        return links;
    }, [profile?.resume_file_name, profile?.resume_url, profile?.social_links]);
    const postsCount = stats.posts;
    const connectionsCount = stats.connections;
    const targetUserId = params.userId ?? null;
    const canMessage = !!targetUserId && targetUserId !== viewerId;

    const openUrl = useCallback(async (rawUrl: string) => {
        const finalUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        const canOpen = await Linking.canOpenURL(finalUrl);
        if (!canOpen) {
            Alert.alert('Cannot open link', 'This link is not supported on this device.');
            return;
        }
        await Linking.openURL(finalUrl);
    }, []);

    const openPortfolio = useCallback(() => {
        if (portfolioLinks.length === 0) {
            Alert.alert('No portfolio yet', 'This user has not added portfolio links or resume yet.');
            return;
        }
        setPortfolioVisible(true);
    }, [portfolioLinks.length]);

    return (
        <View style={styles.root}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* HEADER: solid rectangle + downward triangle */}
            <View style={styles.headerBlock}>
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={28} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>
            <View style={styles.headerTriangle} />

            {/* Avatar — OUTSIDE ScrollView so negative margin isn't clipped */}
            <View style={styles.avatarWrapper} pointerEvents="box-none">
                <View style={styles.avatarGlowOuter}>
                    <View style={styles.avatarGlowInner}>
                        <Image source={displayAvatar} style={styles.avatar} />
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <Text style={styles.nameText}>{displayName}</Text>
                        <Text style={styles.bioText}>{displayBio}</Text>
                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Ionicons name="school" size={13} color={DEEP} style={{ marginRight: 4 }} />
                                <Text style={styles.tagText}>Batch {displayBatch}</Text>
                            </View>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.primaryBtn, !canMessage && styles.disabledButton]}
                                onPress={() =>
                                    canMessage &&
                                    (navigation as any).navigate('ChatDetail', {
                                        chatId: targetUserId as string,
                                        userId: targetUserId as string,
                                        name: displayName,
                                        avatar: displayAvatar,
                                    })
                                }
                                activeOpacity={0.8}
                                disabled={!canMessage}
                            >
                                <Ionicons name="chatbubble" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                <Text style={styles.primaryBtnText}>Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={openPortfolio} activeOpacity={0.8}>
                                <Ionicons name="briefcase-outline" size={16} color={DEEP} style={{ marginRight: 6 }} />
                                <Text style={styles.secondaryBtnText}>Portfolio</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.viewProfileBtn}
                            onPress={() => (navigation as any).navigate('Main', { screen: 'Profile' })}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="person-outline" size={16} color={ACCENT} style={{ marginRight: 6 }} />
                            <Text style={styles.viewProfileText}>View Full Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <Counter target={displayContributions} label="Contributions" icon="git-branch-outline" iconColor="#8B5CF6" />
                        <View style={styles.statDiv} />
                        <Counter target={postsCount} label="Posts" icon="document-text-outline" iconColor="#3B82F6" />
                        <View style={styles.statDiv} />
                        <Counter target={connectionsCount} label="Connections" icon="people-outline" iconColor="#22C55E" />
                    </View>

                    {/* About */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.aboutText}>{displayAbout}</Text>
                    </View>

                    {/* Shared Content */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shared Content</Text>
                        <TouchableOpacity style={styles.linkRow} activeOpacity={0.6} onPress={() => setSharedVisible(true)}>
                            <View style={[styles.linkIcon, { backgroundColor: '#EEF0FA' }]}><Ionicons name="images" size={20} color={ACCENT} /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.linkText}>Media, Links & Docs</Text>
                                <Text style={styles.linkSub}>{sharedItems.length} items shared</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.linkRow} activeOpacity={0.6} onPress={() => setStarredVisible(true)}>
                            <View style={[styles.linkIcon, { backgroundColor: '#FFFBEB' }]}><Ionicons name="star" size={20} color="#EAB308" /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.linkText}>Starred Messages</Text>
                                <Text style={styles.linkSub}>{starredItems.length} starred</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    </View>

                    {/* Activity */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        {[
                            { text: 'Active on Vconnect', time: '2 hours ago', color: '#22C55E', bold: 'Vconnect' },
                            { text: 'Updated their profile', time: 'Yesterday', color: '#8B5CF6', bold: 'profile' },
                            { text: 'Shared 3 files in a conversation', time: '3 days ago', color: '#F59E0B', bold: 'conversation' },
                        ].map((a, i) => (
                            <View key={i} style={styles.actItem}>
                                <View style={[styles.actDot, { backgroundColor: a.color }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actText}>
                                        {a.text.split(a.bold).map((part, j) =>
                                            j === 0 ? <Text key={j}>{part}</Text> : <Text key={j}><Text style={styles.actBold}>{a.bold}</Text>{part}</Text>
                                        )}
                                    </Text>
                                    <Text style={styles.actTime}>{a.time}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                </Animated.View>
            </ScrollView>

            <Modal transparent visible={portfolioVisible} animationType="fade" onRequestClose={() => setPortfolioVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setPortfolioVisible(false)}>
                    <View style={styles.csOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.liveSheet}>
                                <Text style={styles.liveSheetTitle}>Portfolio</Text>
                                {profileLoading ? (
                                    <ActivityIndicator size="small" color={ACCENT} />
                                ) : portfolioLinks.length === 0 ? (
                                    <Text style={styles.liveEmptyText}>No portfolio links available.</Text>
                                ) : (
                                    portfolioLinks.map((item) => (
                                        <TouchableOpacity key={item.id} style={styles.liveRow} activeOpacity={0.8} onPress={() => openUrl(item.url)}>
                                            <View style={[styles.liveIconWrap, { backgroundColor: '#EEF2FF' }]}>
                                                <Ionicons name="open-outline" size={16} color={ACCENT} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.liveRowTitle}>{item.label}</Text>
                                                <Text style={styles.liveRowSub} numberOfLines={1}>{item.url}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal transparent visible={sharedVisible} animationType="fade" onRequestClose={() => setSharedVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setSharedVisible(false)}>
                    <View style={styles.csOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.liveSheet}>
                                <Text style={styles.liveSheetTitle}>Media, Links & Docs</Text>
                                {sharedItems.length === 0 ? (
                                    <Text style={styles.liveEmptyText}>No shared media, links, or docs found yet.</Text>
                                ) : (
                                    <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                                        {sharedItems.map((item) => (
                                            <TouchableOpacity key={item.id} style={styles.liveRow} activeOpacity={0.8} onPress={() => openUrl(item.url)}>
                                                <View style={[styles.liveIconWrap, { backgroundColor: item.type === 'doc' ? '#FFFBEB' : item.type === 'media' ? '#EEF0FA' : '#ECFDF5' }]}>
                                                    <Ionicons
                                                        name={item.type === 'doc' ? 'document-text-outline' : item.type === 'media' ? 'images-outline' : 'link-outline'}
                                                        size={16}
                                                        color={item.type === 'doc' ? '#D97706' : item.type === 'media' ? ACCENT : '#16A34A'}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.liveRowTitle}>{item.label}</Text>
                                                    <Text style={styles.liveRowSub} numberOfLines={1}>{item.url}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal transparent visible={starredVisible} animationType="fade" onRequestClose={() => setStarredVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setStarredVisible(false)}>
                    <View style={styles.csOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.liveSheet}>
                                <Text style={styles.liveSheetTitle}>Starred Messages</Text>
                                {starredItems.length === 0 ? (
                                    <Text style={styles.liveEmptyText}>No starred messages yet. Long-press a chat message and tap Star.</Text>
                                ) : (
                                    <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                                        {starredItems.map((item) => (
                                            <View key={item.id} style={styles.liveRowStatic}>
                                                <View style={[styles.liveIconWrap, { backgroundColor: '#FFF7D6' }]}>
                                                    <Ionicons name="star" size={15} color="#EAB308" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.liveRowTitle} numberOfLines={2}>{item.text}</Text>
                                                    <Text style={styles.liveRowSub}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const STATUS_H = StatusBar.currentHeight || 0;
const HEADER_PT = Platform.OS === 'android' ? STATUS_H + 12 : 50;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    // ─── HEADER: Rectangle + downward triangle ──────────
    headerBlock: {
        backgroundColor: DEEP,
        paddingTop: HEADER_PT,
        paddingBottom: 20,
        paddingHorizontal: 16,
        zIndex: 10,
    },
    headerTriangle: {
        width: 0, height: 0,
        alignSelf: 'center',
        borderLeftWidth: SW / 2,
        borderLeftColor: 'transparent',
        borderRightWidth: SW / 2,
        borderRightColor: 'transparent',
        borderTopWidth: 50,
        borderTopColor: DEEP,
        zIndex: 10,
    },
    headerBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
    scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
    // ─── AVATAR WITH GLOW ────────────────────────────────
    avatarWrapper: {
        alignItems: 'center',
        marginTop: -115, // Avatar sits ON TOP of the triangle
        marginBottom: 16,
        zIndex: 20,
    },
    avatarGlowOuter: {
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(91,106,240,0.2)',
        justifyContent: 'center', alignItems: 'center',
        elevation: 16,
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
    },
    avatarGlowInner: {
        width: 112, height: 112, borderRadius: 56,
        backgroundColor: '#FFF',
        justifyContent: 'center', alignItems: 'center',
        padding: 3,
    },
    avatar: { width: 104, height: 104, borderRadius: 52 },
    // ─── PROFILE CARD ────────────────────────────────────
    profileCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 24, paddingTop: 12,
        alignItems: 'center', marginBottom: 16,
    },
    nameText: { fontSize: 24, fontWeight: '800', color: TEXT_DARK, marginBottom: 4 },
    bioText: { fontSize: 14, color: TEXT_MUTED, fontWeight: '500', marginBottom: 14, textAlign: 'center' },
    tagRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
    tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2FA', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
    tagText: { fontSize: 12, fontWeight: '700', color: DEEP },
    actionRow: { flexDirection: 'row', gap: 10, width: '100%' },
    viewProfileBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: ACCENT, marginTop: 10 },
    viewProfileText: { color: ACCENT, fontSize: 14, fontWeight: '700' },
    primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, paddingVertical: 12, borderRadius: 14, elevation: 3, shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 8 },
    disabledButton: { opacity: 0.5 },
    primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F2FA', paddingVertical: 12, borderRadius: 14 },
    secondaryBtnText: { color: DEEP, fontSize: 15, fontWeight: '700' },
    // Stats
    statsCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
    statItem: { alignItems: 'center', flex: 1 },
    statIconBg: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    statNum: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 2 },
    statLabel: { fontSize: 10, fontWeight: '600', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
    statDiv: { width: 1, height: 44, backgroundColor: '#F0F2FA' },
    // Section
    section: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: DEEP, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    aboutText: { fontSize: 15, lineHeight: 24, color: '#475569', fontWeight: '500' },
    linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    linkText: { fontSize: 14, fontWeight: '600', color: '#334155' },
    linkSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 1 },
    divider: { height: 1, backgroundColor: '#F0F2FA', marginVertical: 4, marginLeft: 54 },
    // Activity
    actItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    actDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
    actText: { fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '500' },
    actBold: { fontWeight: '700', color: TEXT_DARK },
    actTime: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
    // Live modal sheets
    csOverlay: { flex: 1, backgroundColor: 'rgba(15,12,40,0.75)', justifyContent: 'center', alignItems: 'center' },
    liveSheet: { width: SW * 0.82, maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18 },
    liveSheetTitle: { fontSize: 18, fontWeight: '800', color: DEEP, marginBottom: 12 },
    liveEmptyText: { color: TEXT_MUTED, fontSize: 14, lineHeight: 20, textAlign: 'center', paddingVertical: 14 },
    liveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F7',
    },
    liveRowStatic: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F7',
    },
    liveIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    liveRowTitle: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
    liveRowSub: { marginTop: 2, color: '#64748B', fontSize: 11 },
});

export default UserProfileScreen;
