import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const categories = ['All Posts', 'Computer Science', 'Physics', 'Chemistry', 'Mathematics'];

const HomeHeader = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Posts');

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4A6D8C', '#6B8CAE', '#8EADC5']} style={styles.gradient}>
                <SafeAreaView edges={['top']} style={styles.safeArea}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoIconBg}>
                                <Icon name="school" size={24} color="#4A6D8C" />
                            </View>
                            <Text style={styles.appName}>V Connect</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn}>
                            <Icon name="bell" size={24} color="#fff" />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Icon name="magnify" size={24} color="#94A3B8" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search questions, topics..."
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            style={styles.searchInput}
                        />
                    </View>

                    {/* Filter Chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                        style={styles.filterContainer}
                    >
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.filterChip,
                                    selectedCategory === cat && styles.activeChip
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedCategory === cat && styles.activeFilterText
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
            {/* Curved bottom handled by container styling in parent or main View if needed, 
                but here we can just use the border radius on the gradient if it ends the list */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    gradient: {
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        paddingBottom: 24,
    },
    safeArea: {
        paddingHorizontal: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F87171',
        borderWidth: 1.5,
        borderColor: '#6B8CAE',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: {
        marginRight: 12,
        color: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        padding: 0,
    },
    filterContainer: {
        flexGrow: 0,
    },
    filterScroll: {
        paddingRight: 20,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeChip: {
        backgroundColor: '#334E68', // Darker blue for active state
        borderColor: '#4A6D8C',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    activeFilterText: {
        color: '#fff',
    },
});

export default HomeHeader;
