import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AuthNavigator';
import { useAppTheme } from '../../theme/AppThemeContext';

const ACCENT = '#5B6AF0';
const BG = '#E8EAF6';
const TEXT_DARK = '#1A1A2E';
const TEXT_MUTED = '#8892A6';

const categories = ['All', 'Computer Science', 'Physics', 'Chemistry', 'Mathematics'];

interface HomeHeaderProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onSearch?: (text: string) => void;
    postCount?: number;
}

// Fixed header component (title + search) - stays at top
export const FixedHeader: React.FC<{ onSearch?: (text: string) => void; postCount?: number }> = ({
    onSearch,
    postCount = 12,
}) => {
    const { theme } = useAppTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [searchText, setSearchText] = useState('');

    const handleSearch = (text: string) => {
        setSearchText(text);
        onSearch?.(text);
    };

    const goToNotifications = () => {
        navigation.navigate('Notifications');
    };

    return (
        <View style={[styles.fixedHeader, { backgroundColor: theme.background }]}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>V Connect</Text>
                        <Text style={[styles.headerSub, { color: theme.textMuted }]}>{postCount} POSTS</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.notifBtn, { backgroundColor: theme.surfaceSoft }]}
                        onPress={goToNotifications}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications" size={22} color={theme.text} />
                        <View style={[styles.notificationBadge, { backgroundColor: theme.primary, borderColor: theme.background }]} />
                    </TouchableOpacity>
                </View>

                {/* Glass Search */}
                <View style={[styles.glassSearch, { backgroundColor: theme.surfaceSoft }]}>
                    <Ionicons name="search-outline" size={18} color={theme.primary} />
                    <TextInput
                        placeholder="Search messages..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

// Scrollable filter chips - goes at top of FlatList
export const FilterChips: React.FC<{ selectedCategory: string; onCategoryChange: (cat: string) => void }> = ({
    selectedCategory,
    onCategoryChange,
}) => {
    const { theme } = useAppTheme();
    return (
        <View style={styles.filterWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
                style={styles.filterContainer}
            >
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat || 
                        (selectedCategory === 'All Posts' && cat === 'All');
                    return (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.chip,
                                { backgroundColor: theme.surfaceSoft },
                                isActive && styles.chipActive,
                                isActive && { backgroundColor: theme.primary },
                            ]}
                            onPress={() => onCategoryChange(cat === 'All' ? 'All Posts' : cat)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    { color: theme.textMuted },
                                    isActive && styles.chipTextActive,
                                    isActive && { color: theme.onPrimary },
                                ]}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

// Legacy full header (kept for backward compatibility but not used)
const HomeHeader: React.FC<HomeHeaderProps> = ({
    selectedCategory,
    onCategoryChange,
    onSearch,
    postCount = 12,
}) => {
    return (
        <View>
            <FixedHeader onSearch={onSearch} postCount={postCount} />
            <FilterChips selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />
        </View>
    );
};

const styles = StyleSheet.create({
    fixedHeader: {
        backgroundColor: BG,
    },
    safeArea: {},
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: TEXT_DARK,
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: 10,
        fontWeight: '700',
        color: TEXT_MUTED,
        marginTop: 3,
        letterSpacing: 1.2,
    },
    notifBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(91,106,240,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ACCENT,
        borderWidth: 1.5,
        borderColor: BG,
    },
    glassSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2FA',
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 46,
        marginHorizontal: 20,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: TEXT_DARK,
        fontWeight: '500',
    },
    filterWrapper: {
        marginBottom: 12,
    },
    filterContainer: {
        flexGrow: 0,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#F0F2FA',
    },
    chipActive: {
        backgroundColor: ACCENT,
        elevation: 3,
        shadowColor: ACCENT,
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: TEXT_MUTED,
    },
    chipTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
});

export default HomeHeader;
