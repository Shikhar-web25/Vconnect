import React, { useState, useEffect, useRef } from 'react';
import {
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '../navigation/AuthNavigator';
import { getMaleAvatar } from '../utils/avatar';

const DEEP = '#1E1B4B';
const ACCENT = '#5B6AF0';
const BG = '#F0F2FA';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';
const { width: SW } = Dimensions.get('window');

type UserProfileScreenRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

// Animated counter
const Counter = ({ target, label, icon, iconColor }: { target: number; label: string; icon: string; iconColor: string }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const [val, setVal] = useState(0);
    useEffect(() => {
        const id = anim.addListener(({ value }) => setVal(Math.floor(value)));
        Animated.timing(anim, { toValue: target, duration: 1200, useNativeDriver: false }).start();
        return () => anim.removeListener(id);
    }, [target]);
    return (
        <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: `${iconColor}18` }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={styles.statNum}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
};

const UserProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<UserProfileScreenRouteProp>();
    const { name, avatar, about, bio, contributions } = route.params;
    const displayAvatar = avatar || getMaleAvatar(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const [randomBatch, setRandomBatch] = useState('');
    const [comingSoon, setComingSoon] = useState(false);

    useEffect(() => {
        const years = ['2023', '2024', '2025', '2026'];
        setRandomBatch(years[Math.floor(Math.random() * years.length)]);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const displayAbout = about || 'Hey there! I am using Vconnect';
    const displayBio = bio || 'Living the college life';
    const displayContributions = contributions || Math.floor(Math.random() * 100) + 20;

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
                        <Text style={styles.nameText}>{name}</Text>
                        <Text style={styles.bioText}>{displayBio}</Text>
                        <View style={styles.tagRow}>
                            <View style={styles.tag}>
                                <Ionicons name="school" size={13} color={DEEP} style={{ marginRight: 4 }} />
                                <Text style={styles.tagText}>Batch {randomBatch}</Text>
                            </View>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => (navigation as any).navigate('ChatDetail', { chatId: name, name, avatar: displayAvatar })} activeOpacity={0.8}>
                                <Ionicons name="chatbubble" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                <Text style={styles.primaryBtnText}>Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setComingSoon(true)} activeOpacity={0.8}>
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
                        <Counter target={Math.floor(Math.random() * 30) + 5} label="Posts" icon="document-text-outline" iconColor="#3B82F6" />
                        <View style={styles.statDiv} />
                        <Counter target={Math.floor(Math.random() * 150) + 30} label="Connections" icon="people-outline" iconColor="#22C55E" />
                    </View>

                    {/* About */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.aboutText}>{displayAbout}</Text>
                    </View>

                    {/* Shared Content */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shared Content</Text>
                        <TouchableOpacity style={styles.linkRow} activeOpacity={0.6} onPress={() => setComingSoon(true)}>
                            <View style={[styles.linkIcon, { backgroundColor: '#EEF0FA' }]}><Ionicons name="images" size={20} color={ACCENT} /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.linkText}>Media, Links & Docs</Text>
                                <Text style={styles.linkSub}>12 items shared</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.linkRow} activeOpacity={0.6} onPress={() => setComingSoon(true)}>
                            <View style={[styles.linkIcon, { backgroundColor: '#FFFBEB' }]}><Ionicons name="star" size={20} color="#EAB308" /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.linkText}>Starred Messages</Text>
                                <Text style={styles.linkSub}>3 starred</Text>
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

            {/* Custom Coming Soon Modal */}
            <Modal transparent visible={comingSoon} animationType="fade" onRequestClose={() => setComingSoon(false)}>
                <TouchableWithoutFeedback onPress={() => setComingSoon(false)}>
                    <View style={styles.csOverlay}>
                        <View style={styles.csCard}>
                            <View style={styles.csIconWrap}>
                                <Ionicons name="rocket-outline" size={32} color={ACCENT} />
                            </View>
                            <Text style={styles.csTitle}>Coming Soon</Text>
                            <Text style={styles.csSub}>This feature will be available in the next update. Stay tuned!</Text>
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

const STATUS_H = StatusBar.currentHeight || 0;
const HEADER_PT = Platform.OS === 'android' ? STATUS_H + 12 : 50;
const V_HEIGHT = 220;
const V_POINT = 50;

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
    // Coming Soon modal
    csOverlay: { flex: 1, backgroundColor: 'rgba(15,12,40,0.75)', justifyContent: 'center', alignItems: 'center' },
    csCard: { width: SW * 0.72, backgroundColor: '#FFF', borderRadius: 24, padding: 28, alignItems: 'center' },
    csIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF0FA', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    csTitle: { fontSize: 20, fontWeight: '800', color: DEEP, marginBottom: 8 },
    csSub: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center', lineHeight: 20, marginBottom: 20, fontWeight: '500' },
    csBtn: { backgroundColor: ACCENT, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 14 },
    csBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default UserProfileScreen;