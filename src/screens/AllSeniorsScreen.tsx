import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mentor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  online?: 'green' | 'yellow' | null;
  highlight?: boolean;
  bio?: string;
  experience?: string;
  skills?: string;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#4A6D8C',
  background: '#f1f5f9',
  card: '#ffffff',
  textDark: '#1e293b',
  textLight: '#94a3b8',
  green: '#34d399',
  yellow: '#fbbf24',
  border: '#e2e8f0',
  headerBg: '#4A6D8C',
  tooltipBg: '#ffffff',
};

const NUM_COLUMNS = 3;
const CARD_WIDTH = (width - 40 - 16) / NUM_COLUMNS;

// ─── Data ─────────────────────────────────────────────────────────────────────
const MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Marcus C.',
    specialty: 'Full Stack',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    online: null,
    experience: '8 yrs @ Stripe',
    skills: 'React & Node.js',
    bio: '8 years building full-stack apps. Expert in React, Node.js, and cloud architecture. Helped 50+ engineers land senior roles.',
  },
  {
    id: '2',
    name: 'Lisa K.',
    specialty: 'Product',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    online: 'yellow',
    experience: '6 yrs @ Notion',
    skills: 'Roadmap Strategy',
    bio: 'Product lead at two unicorn startups. Specializes in 0-to-1 products, user research, and roadmap strategy.',
  },
  {
    id: '3',
    name: 'James L.',
    specialty: 'Marketing',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    highlight: true,
    online: null,
    experience: '10 yrs @ HubSpot',
    skills: 'SEO & Paid Ads',
    bio: 'Growth marketing veteran with experience scaling B2B and B2C brands. Deep expertise in SEO, paid ads, and brand storytelling.',
  },
  {
    id: '4',
    name: 'Elena R.',
    specialty: 'HR Consult',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    online: null,
    experience: '12 yrs @ Deloitte',
    skills: 'Career Transitions',
    bio: 'Former HR director at Fortune 500 companies. Guides professionals on interviews, negotiations, and career transitions.',
  },
  {
    id: '5',
    name: 'Chris P.',
    specialty: 'Mobile Dev',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    online: null,
    experience: '6 yrs @ Airbnb',
    skills: 'React Native & Swift',
    bio: 'iOS & Android developer with 6 years shipping consumer apps. Specializes in React Native, Swift, and app store optimization.',
  },
  {
    id: '6',
    name: 'Nina J.',
    specialty: 'DevOps',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    online: 'green',
    experience: '7 yrs @ AWS',
    skills: 'K8s & CI/CD',
    bio: 'DevOps engineer specializing in Kubernetes, CI/CD pipelines, and cloud infrastructure. Currently available for mentoring sessions.',
  },
  {
    id: '7',
    name: 'Vikram S.',
    specialty: 'AI Ethics',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    online: null,
    experience: '9 yrs @ DeepMind',
    skills: 'Bias & Fairness',
    bio: 'Researcher in AI ethics and responsible ML. Advises companies on bias auditing, fairness frameworks, and ethical AI deployment.',
  },
  {
    id: '8',
    name: 'Maya T.',
    specialty: 'Career Coach',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    online: 'green',
    experience: '8 yrs @ LinkedIn',
    skills: 'Interview Prep',
    bio: 'Career coach with 200+ success stories. Focuses on resume building, interview prep, and navigating tech career pivots.',
  },
  {
    id: '9',
    name: 'Omar D.',
    specialty: 'Frontend',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    online: null,
    experience: '5 yrs @ Figma',
    skills: 'React & Design Sys',
    bio: 'Frontend specialist with a passion for pixel-perfect UI. Expert in React, animations, and design systems used at scale.',
  },
  {
    id: '10',
    name: 'Chloe S.',
    specialty: 'Product',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    online: null,
    experience: '7 yrs @ Spotify',
    skills: 'UX Research',
    bio: 'Product strategist with a background in UX research. Mentors aspiring PMs on frameworks, metrics, and stakeholder management.',
  },
  {
    id: '11',
    name: 'Dr. Alex R.',
    specialty: 'Data Science',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    online: 'green',
    experience: '10+ yrs @ Google',
    skills: 'ML & Analytics',
    bio: 'Lead data scientist at Google. Expert in machine learning, statistical modeling, and data-driven product decisions.',
  },
  {
    id: '12',
    name: 'Sarah W.',
    specialty: 'UX Design',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    online: 'yellow',
    experience: '8 yrs @ Apple',
    skills: 'Figma & Prototyping',
    bio: 'Senior UX designer at Apple. Passionate about accessible, intuitive design and mentoring early-career designers.',
  },
  {
    id: '13',
    name: 'Raj M.',
    specialty: 'Backend',
    avatar: 'https://randomuser.me/api/portraits/men/88.jpg',
    online: null,
    experience: '9 yrs @ Netflix',
    skills: 'Java & Microservices',
    bio: 'Backend engineer with deep expertise in distributed systems, microservices, and high-throughput APIs at Netflix scale.',
  },
  {
    id: '14',
    name: 'Priya N.',
    specialty: 'Blockchain',
    avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
    online: null,
    experience: '6 yrs @ Coinbase',
    skills: 'Solidity & Web3',
    bio: 'Blockchain developer at Coinbase. Guides developers into Web3, smart contracts, and decentralized finance.',
  },
  {
    id: '15',
    name: 'Tom B.',
    specialty: 'Security',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    online: 'green',
    experience: '11 yrs @ Cloudflare',
    skills: 'Pen Testing & OWASP',
    bio: 'Cybersecurity expert with 11 years in ethical hacking, secure architecture, and compliance at major tech firms.',
  },
];

// ─── Rich Tooltip ─────────────────────────────────────────────────────────────
interface TooltipProps {
  visible: boolean;
  mentor: Mentor | null;
  onClose: () => void;
  position: { x: number; y: number; cardWidth: number };
}

const RichTooltip = ({ visible, mentor, onClose, position }: TooltipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 4 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 4 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.88, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !mentor) return null;

  const tooltipWidth = 200;
  let left = position.x + position.cardWidth / 2 - tooltipWidth / 2;
  left = Math.max(12, Math.min(left, width - tooltipWidth - 12));
  const arrowLeft = position.x + position.cardWidth / 2 - left - 8;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={tooltipStyles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            tooltipStyles.box,
            {
              top: position.y,
              left,
              width: tooltipWidth,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={tooltipStyles.headerRow}>
            <Image source={{ uri: mentor.avatar }} style={tooltipStyles.avatar} />
            <View style={tooltipStyles.headerText}>
              <Text style={tooltipStyles.name}>{mentor.name}</Text>
              <Text style={tooltipStyles.specialty}>{mentor.specialty}</Text>
            </View>
          </View>

          {mentor.experience && (
            <View style={tooltipStyles.infoRow}>
              <Text style={tooltipStyles.starIcon}>⭐</Text>
              <Text style={tooltipStyles.infoText}>{mentor.experience}</Text>
            </View>
          )}

          {mentor.skills && (
            <View style={tooltipStyles.infoRow}>
              <Text style={tooltipStyles.chartIcon}>📊</Text>
              <Text style={[tooltipStyles.infoText, tooltipStyles.skillText]}>{mentor.skills}</Text>
            </View>
          )}

          <View style={tooltipStyles.divider} />

          <TouchableOpacity style={tooltipStyles.viewBtn} onPress={onClose}>
            <Text style={tooltipStyles.viewBtnText}>View Profile</Text>
          </TouchableOpacity>

          <View style={[tooltipStyles.arrow, { left: arrowLeft }]} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const tooltipStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  box: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: `${'#4A6D8C'}33`,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  specialty: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  starIcon: { fontSize: 13 },
  chartIcon: { fontSize: 13 },
  infoText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  skillText: {
    color: '#4A6D8C',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  viewBtn: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#4A6D8C',
    paddingVertical: 7,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A6D8C',
  },
  arrow: {
    position: 'absolute',
    bottom: -7,
    width: 14,
    height: 14,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    transform: [{ rotate: '45deg' }],
  },
});

// ─── Mentor Card ──────────────────────────────────────────────────────────────
interface MentorCardProps {
  mentor: Mentor;
  onLongPress: (mentor: Mentor, pos: { x: number; y: number; cardWidth: number }) => void;
}

const MentorCard = ({ mentor, onLongPress }: MentorCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cardRef = useRef<View>(null);

  const handleLongPress = () => {
    if (!mentor.bio) return;
    cardRef.current?.measureInWindow((x, y, cardWidth, cardHeight) => {
      onLongPress(mentor, { x, y: y - 185, cardWidth });
    });
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.91, useNativeDriver: true, speed: 30 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  return (
    <Animated.View
      ref={cardRef}
      style={[
        styles.mentorCard,
        mentor.highlight && styles.mentorCardHighlight,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.mentorCardInner}
        onPressIn={() =>
          Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()
        }
        onLongPress={handleLongPress}
        delayLongPress={350}
        activeOpacity={1}
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: mentor.avatar }} style={styles.mentorAvatar} />
          {mentor.online && (
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: mentor.online === 'green' ? COLORS.green : COLORS.yellow },
              ]}
            />
          )}
        </View>
        <Text style={styles.mentorName} numberOfLines={1}>{mentor.name}</Text>
        <Text style={styles.mentorSpecialty} numberOfLines={1}>{mentor.specialty}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AllSeniorsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltipMentor, setTooltipMentor] = useState<Mentor | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, cardWidth: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleLongPress = (mentor: Mentor, pos: { x: number; y: number; cardWidth: number }) => {
    setTooltipMentor(mentor);
    setTooltipPos(pos);
    setTooltipVisible(true);
  };

  const filteredMentors = MENTORS.filter(
    m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const paddedMentors = [...filteredMentors];
  const remainder = paddedMentors.length % NUM_COLUMNS;
  if (remainder !== 0) {
    for (let i = 0; i < NUM_COLUMNS - remainder; i++) {
      paddedMentors.push({ id: `empty-${i}`, name: '', specialty: '', avatar: '' });
    }
  }

  const renderMentor = ({ item }: { item: Mentor }) => {
    if (!item.name) return <View style={styles.mentorCardPlaceholder} />;
    return <MentorCard mentor={item} onLongPress={handleLongPress} />;
  };

  const ListHeader = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Profiles</Text>
        <Text style={styles.mentorCount}>{filteredMentors.length} available</Text>
      </View>
      <Text style={styles.longPressHint}>Hold a card to see a quick bio</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Profiles</Text>
        <View style={[styles.headerIconBtn, { backgroundColor: 'transparent' }]} />
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your next guide..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Grid ── */}
      <FlatList
        data={paddedMentors}
        keyExtractor={item => item.id}
        renderItem={renderMentor}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={ListHeader}
        columnWrapperStyle={styles.mentorRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />

      {/* ── Rich Tooltip ── */}
      <RichTooltip
        visible={tooltipVisible}
        mentor={tooltipMentor}
        onClose={() => setTooltipVisible(false)}
        position={tooltipPos}
      />
    </SafeAreaView>
  );
};

export default AllSeniorsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.headerBg,
  },
  header: {
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 14,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  searchBarWrapper: {
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    height: 46,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    padding: 0,
  },
  flatList: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  mentorCount: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  longPressHint: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  mentorRow: {
    gap: 8,
    marginBottom: 8,
  },
  mentorCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mentorCardHighlight: {
    borderWidth: 1.5,
    borderColor: 'rgba(74,109,140,0.25)',
  },
  mentorCardPlaceholder: {
    width: CARD_WIDTH,
  },
  mentorCardInner: {
    padding: 12,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  mentorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: `${'#4A6D8C'}22`,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  mentorName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  mentorSpecialty: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
    color: COLORS.textLight,
  },
});