import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Marcus C.',
    specialty: 'Full Stack',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBbwPdVRuYVUwqz7ApsUJGO-XS5z5Rh5-xOAq2JZRMRJGo1KC6cKHFho11ktCXCt_-Ko4FXz7NBYdQwDWWcPpC47Vgb68hThDnaLS688dsxH_J43eDC9wG4vXd1qxYzHbMI1Bwldj2T3ab2qX7XtfAAr9MXwKJz8NxN1RaNzPqhXM620D1NyNQXkrWaCK9uHB8Dssfzer-fcYHHIqCHiOQX8UsG2XQ_Dmoemxd1DEO22EyL7oYJ4hud6L0LfsRPAI98WuZ4C8q4CwRs',
    online: null,
    bio: '8 years building full-stack apps. Expert in React, Node.js, and cloud architecture. Helped 50+ engineers land senior roles.',
  },
  {
    id: '2',
    name: 'Lisa K.',
    specialty: 'Product',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASFKwpsssbBDOzFttjEe_5yyZkPMwS7qU_Erg-pcdaGHvNdironC-NRjpms9kKOrwQHWdY1_hIwpDpjAc2UsqQrk-dD2nhZS7_JCtLwvyVhmTlCh3EsxyLmIAUmWsHlNEPfx4cmY20odRxTaXYBa1Gw_SngeBJCEBcCeKv1LIsQnIxliXdtfikUymLqRohR6xX6ZBbJonsr9JNu7eQm0m3Vjz0--jiLoY4RXgO_xMA6tHVgao7Hq2ql1wmocZg7BuJGLC9SsarXBfi',
    online: 'yellow',
    bio: 'Product lead at two unicorn startups. Specializes in 0-to-1 products, user research, and roadmap strategy.',
  },
  {
    id: '3',
    name: 'James L.',
    specialty: 'Marketing',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAf2JS2e5WJ94a-yXN75eH0CYW5PqaAVS1SvSWDQQJUvX2jOZdd3r7vlvukWT75_-cXE9k6YWWoFzkGNdxSDUHtN8Eik7ymi2mU-HH9p4d5PaxMp_oRPycf1bjHHTT__XDtQqi5SStKO9SYqMrhhbPtmicFiBd2ZoQrnXx8b7gnQyqoM59xVbQf8ipDAORIK5ctF_Ea-A8sQPMC3ozO6Lg9UTQ23bPhoMdJIU_N0nJQ9a7mHVu0fNUnHvubvNrPZRgaRd4TVtfnL1wi',
    highlight: true,
    online: null,
    bio: 'Growth marketing veteran with experience scaling B2B and B2C brands. Deep expertise in SEO, paid ads, and brand storytelling.',
  },
  {
    id: '4',
    name: 'Elena R.',
    specialty: 'HR Consult',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBnCGLDIYL4t5JrTApf_1Til8Bco-ncmu2Oi2o-11oaCtQc_c2CYHqk6am5YgUoaFfXRmVXwbghF5qY2eGjSCQd5_xxTZ6TGlVz5Syv0wWTjl35W6hQZy8vBvteWWABRBMJYfPByrEFSvM3NnZqinP_rIR6XcVKGC8Ds2oKb4aagujG4c6uOEkWbZ6c2qDvcBLFfWW_ZtTnmKxLTgEVlNT5VbrZiHGOX1w2l3Muo7CdRoeou7InA2VZ3hr5NnydvBza2OU3PeBXjnDu',
    online: null,
    bio: 'Former HR director at Fortune 500 companies. Guides professionals on interviews, negotiations, and career transitions.',
  },
  {
    id: '5',
    name: 'Chris P.',
    specialty: 'Mobile Dev',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzDY2fwKFDXTlslCDpG-U-ugD_gxtwJ-E58nSc_Zi7-yrntIFAbvTuprS6cBsmTJEy6qTKcAglsO83FB2yWg9wcMLM8A0g5bTAfriEfr3_Ia1mg7uMsi8Vam6vbbj4XuUrsnbsaSbL4UggpiZ5zsfiRFOFyd_VNEEyXtzNXy2CLQCO-axxGzXUTKNSuMXWEulMrPxV1c4UmpCnN1B0UpobGIldoMsPJo4x6LcX6GtHEq8gEXpYV6UUwQ2QQJkOF6dftBbK6QnowYqH',
    online: null,
    bio: 'iOS & Android developer with 6 years shipping consumer apps. Specializes in React Native, Swift, and app store optimization.',
  },
  {
    id: '6',
    name: 'Nina J.',
    specialty: 'DevOps',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4-Rve3tsG4CXnAxMhzgu6_7gcScjaLsxglUaPtzyGTSIcAZCZo0a6qDCNLxVuuFPliuMyI_6BcCrV0lpcwAe5f-B9i3IaejCPE945Pk3zK32s9wUDLhzf6nTaalZMwVrIQUeHObRBYQslxy3R6Tc-xiAUG2NmVVWlczlFqz1K-NaI2M0bIFctYcU9-bTzq_bOBrg1zWUBe4IBX9qJMGw0QCYp4t6zbH2t_gy6hQlAhgSDS44S909V2cSWy6fih-A0SbuXYPe8R6Bd',
    online: 'green',
    bio: 'DevOps engineer specializing in Kubernetes, CI/CD pipelines, and cloud infrastructure. Currently available for mentoring sessions.',
  },
  {
    id: '7',
    name: 'Vikram S.',
    specialty: 'AI Ethics',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJIipjZyZKgL2LxOqp40lGd4nEVXPBz9A6n2UEMlLWflwaioQDzIQlNF-Bw1SGxKKO0dNGmJhnHfImhOPUR2H8JkgIxnNiIbtG2BN20PfuIZzPprIdCisx0PN7W5-g0WOQ6DHByuBxSuUNR7Zhycd4MV3S4TmOg5hqnzPWKi4iSYiqYwGLPRoVJcHbY2NoChkWos1FpOBlSY3P1AHqTCkvR6YSho3B_cPzJgjAlOaenRirnpq0mr3FUmuHY8ymYXn9to-MQIHq1MVM',
    online: null,
    bio: 'Researcher in AI ethics and responsible ML. Advises companies on bias auditing, fairness frameworks, and ethical AI deployment.',
  },
  {
    id: '8',
    name: 'Maya T.',
    specialty: 'Career Coach',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZOqoKHBL5fpr-xJ17x6ozPui7Lyj1uf-d0PwtkaYEfd9MlkKPeuQs575Ydj7AJdYM_h09seJAGWy_mcpJ4-uUvPOIfTpXghYUwLh6nAlCL9VWT6gOnAwM0xe3odnxlqjXGnWwMoXQDPsBmOsbPJNMVfNxEq_pqrvZa3lOrT_jZoeo_9Qcw9ComJmRylc9gWdzGELO-zKiUfEidJ_aVab1OlEwdx__RPoGaBo2RsC68QHuXDR8V1Nl4wolhuEyUnmwfUFGHwW1IhQa',
    online: 'green',
    bio: 'Career coach with 200+ success stories. Focuses on resume building, interview prep, and navigating tech career pivots.',
  },
  {
    id: '9',
    name: 'Omar D.',
    specialty: 'Frontend',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAuAjXoIN4DreG104dep6Dg0g1zzXq2s1DJYUhZaByDjEYfNSAln1JRfioHlhMxPVtiA5sSEm1IwvOaNAbiDS0xPzM0RRd7g8lSBGlHmB1k-0rIknrkgLS3IFtKrVBv6XK8L-5nwmC58CaLpmc9J4P44lCsGnC2QO7dXV0os9QJeJk27ouj2XdYR88tIls6dB4NxBbBIMhqG6v94qvwCva3QXuWgFYbsFw200KTax9IFH7GbDqdHYVnqijEii72cNLQ_g3nJD6KOoiu',
    online: null,
    bio: 'Frontend specialist with a passion for pixel-perfect UI. Expert in React, animations, and design systems used at scale.',
  },
  {
    id: '10',
    name: 'Chloe S.',
    specialty: 'Product',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7y8b98JRo4CAtmyJUvOA_Ty87Gf3IdRfX4ILkh4DtaVvE2d2u65wETQijPCSJpnz0KDgaqV6ZIC5gqd2BMP8KL-xNFH8iS0ck9KAkcA4106bQoJInU8hT-GyYBMRITLiFEpS05coJgyfiryhIzCqO_NYoTOZ6QALQ6aN5PwBKbEk4i2RFYvp3X1_8prZt3B1ieXXGKcRDPoQka8vzeqbtNnm6b7OuI0fmuCNMWgYt_DlhFWv2VEfydQq9s0ab-lgtnAorVmmdFuiR',
    online: null,
    bio: 'Product strategist with a background in UX research. Mentors aspiring PMs on frameworks, metrics, and stakeholder management.',
  },
];



// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#5e7da0',
  background: '#f1f5f9',
  card: '#ffffff',
  textDark: '#1e293b',
  textLight: '#94a3b8',
  green: '#34d399',
  yellow: '#fbbf24',
  border: '#e2e8f0',
  headerBg: '#5e7da0',
  tooltipBg: '#1e2a3a',
};

const CARD_WIDTH = (width - 40 - 16) / 3;
const NUM_COLUMNS = 3;



// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipProps {
  visible: boolean;
  bio: string;
  onClose: () => void;
  position: { x: number; y: number; width: number };
}

const Tooltip = ({ visible, bio, onClose, position }: TooltipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const tooltipWidth = 190;
  // Center tooltip over the card, clamped within screen bounds
  let tooltipLeft = position.x + position.width / 2 - tooltipWidth / 2;
  tooltipLeft = Math.max(12, Math.min(tooltipLeft, width - tooltipWidth - 12));
  const arrowLeft = position.x + position.width / 2 - tooltipLeft - 7;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.tooltipOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.tooltipBox,
            {
              top: position.y,
              left: tooltipLeft,
              width: tooltipWidth,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.tooltipText}>{bio}</Text>
          {/* Downward pointing arrow */}
          <View style={[styles.tooltipArrow, { left: arrowLeft }]} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Mentor Card ──────────────────────────────────────────────────────────────
const MentorCard = ({ mentor }: { mentor: Mentor }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cardRef = useRef<View>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, width: 0 });

  const specialtyColor =
    ['Full Stack', 'DevOps', 'Frontend'].includes(mentor.specialty)
      ? COLORS.primary
      : COLORS.textLight;

  const handleLongPress = () => {
    if (!mentor.bio) return;
    cardRef.current?.measureInWindow((x, y, cardWidth, cardHeight) => {
      // Position tooltip above the card with a small gap
      setTooltipPosition({ x, y: y - 95, width: cardWidth });
      setTooltipVisible(true);
    });
    // Subtle pulse animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.91, useNativeDriver: true, speed: 30 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  return (
    <>
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
                  {
                    backgroundColor:
                      mentor.online === 'green' ? COLORS.green : COLORS.yellow,
                  },
                ]}
              />
            )}
          </View>
          <Text style={styles.mentorName} numberOfLines={1}>
            {mentor.name}
          </Text>
          <Text style={[styles.mentorSpecialty, { color: specialtyColor }]} numberOfLines={1}>
            {mentor.specialty}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Tooltip
        visible={tooltipVisible}
        bio={mentor.bio || ''}
        onClose={() => setTooltipVisible(false)}
        position={tooltipPosition}
      />
    </>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AllSeniorsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!item.name) {
      return <View style={styles.mentorCardPlaceholder} />;
    }
    return <MentorCard mentor={item} />;
  };

  const ListHeader = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Mentors</Text>
        <Text style={styles.mentorCount}>{filteredMentors.length} available</Text>
      </View>
      <Text style={styles.longPressHint}>Hold a card to see a quick bio</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Mentors</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Find your next guide..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ── */}
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

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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

  // Header
  header: {
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 4,
    paddingBottom: 16,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 32,
  },
  filterIcon: {
    color: '#fff',
    fontSize: 18,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Search Bar
  searchBarWrapper: {
    backgroundColor: COLORS.headerBg,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    height: 52,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    padding: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: COLORS.textLight,
    paddingHorizontal: 4,
  },

  // FlatList
  flatList: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Mentor Grid
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
    borderColor: 'rgba(94,125,160,0.2)',
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  },

  // Tooltip
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltipBox: {
    position: 'absolute',
    backgroundColor: COLORS.tooltipBg,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  tooltipText: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    width: 14,
    height: 14,
    backgroundColor: COLORS.tooltipBg,
    transform: [{ rotate: '45deg' }],
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 40,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
});