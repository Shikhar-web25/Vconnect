<<<<<<< HEAD
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profile Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
=======
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const stats = [
    { label: 'Posts', value: '127' },
    { label: 'Followers', value: '2.5K' },
    { label: 'Following', value: '892' },
  ];

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'account-edit', label: 'Edit Profile', action: 'editProfile', color: '#6366f1' },
        { icon: 'shield-lock', label: 'Privacy', action: 'privacy', color: '#8b5cf6' },
        { icon: 'security', label: 'Security', action: 'security', color: '#6366f1' },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: 'bell', label: 'Notifications', action: 'notifications', toggle: true, color: '#f59e0b' },
        { icon: 'moon-waning-crescent', label: 'Dark Mode', action: 'darkMode', toggle: true, color: '#6366f1' },
        { icon: 'translate', label: 'Language', action: 'language', color: '#10b981' },
      ],
    },
    {
      section: 'Security',
      items: [
        { icon: 'fingerprint', label: 'Biometric Lock', action: 'biometric', toggle: true, color: '#6366f1' },
        { icon: 'two-factor-authentication', label: 'Two-Factor Auth', action: 'twoFactor', color: '#8b5cf6' },
        { icon: 'key-variant', label: 'Change Password', action: 'changePassword', color: '#6366f1' },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle', label: 'Help Center', action: 'help', color: '#10b981' },
        { icon: 'email', label: 'Contact Us', action: 'contact', color: '#3b82f6' },
        { icon: 'information', label: 'About', action: 'about', color: '#6b7280' },
      ],
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMenuPress = (action: string) => {
    switch (action) {
      case 'editProfile':
        Alert.alert('Edit Profile', 'Edit profile functionality');
        break;
      case 'privacy':
        Alert.alert('Privacy Settings', 'Manage your privacy preferences');
        break;
      case 'security':
        Alert.alert(
          'Security',
          'Your account is protected with:\n\n• End-to-end encryption\n• Two-factor authentication\n• Biometric lock\n• Secure data storage'
        );
        break;
      case 'twoFactor':
        Alert.alert(
          'Two-Factor Authentication',
          '2FA adds an extra layer of security to your account',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable', onPress: () => {} },
          ]
        );
        break;
      case 'changePassword':
        Alert.alert('Change Password', 'Update your account password');
        break;
      case 'help':
        Alert.alert('Help Center', 'Browse help articles and FAQs');
        break;
      case 'contact':
        Alert.alert('Contact Us', 'Get in touch with our support team');
        break;
      case 'about':
        Alert.alert('About', 'Version 1.0.0\nBuild 2026.01.29');
        break;
      default:
        break;
    }
  };

  const handleToggle = (action: string, value: boolean) => {
    switch (action) {
      case 'biometric':
        setBiometricEnabled(value);
        Alert.alert(
          value ? 'Biometric Enabled' : 'Biometric Disabled',
          value
            ? 'Your app is now protected with biometric authentication'
            : 'Biometric authentication has been disabled'
        );
        break;
      case 'notifications':
        setNotificationsEnabled(value);
        break;
      case 'darkMode':
        setDarkModeEnabled(value);
        break;
    }
  };

  const renderMenuItem = (item: any, index: number) => {
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    }, []);

    const getToggleValue = () => {
      switch (item.action) {
        case 'biometric':
          return biometricEnabled;
        case 'notifications':
          return notificationsEnabled;
        case 'darkMode':
          return darkModeEnabled;
        default:
          return false;
      }
    };

    return (
      <Animated.View
        key={item.label}
        style={[
          {
            opacity: itemAnim,
            transform: [
              {
                translateX: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => !item.toggle && handleMenuPress(item.action)}
          activeOpacity={item.toggle ? 1 : 0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <Icon name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          {item.toggle ? (
            <Switch
              value={getToggleValue()}
              onValueChange={(value) => handleToggle(item.action, value)}
              trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
              thumbColor={getToggleValue() ? '#6366f1' : '#f3f4f6'}
              ios_backgroundColor="#e5e7eb"
            />
          ) : (
            <Icon name="chevron-right" size={24} color="#d1d5db" />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with Profile Info */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="cog" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="share-variant" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.profileInfo,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="pencil" size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userHandle}>@johndoe</Text>
          <Text style={styles.userBio}>
            Digital creator | Tech enthusiast | Coffee lover
          </Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Menu Sections */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <View style={styles.securityIconContainer}>
              <Icon name="shield-check" size={24} color="#10b981" />
            </View>
            <View style={styles.securityBadgeContent}>
              <Text style={styles.securityBadgeTitle}>Account Protected</Text>
              <Text style={styles.securityBadgeText}>
                Your data is encrypted and secure
              </Text>
            </View>
          </View>

          {/* Menu Sections */}
          {menuItems.map((section, sectionIndex) => (
            <View key={section.section} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) =>
                  renderMenuItem(item, sectionIndex * 10 + itemIndex)
                )}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() =>
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    style: 'destructive', 
                    onPress: () => {
                      navigation.navigate('Login' as never);
                    }
                  },
                ]
              )
            }
          >
            <Icon name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f3f4f6',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  userHandle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 5,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityBadgeContent: {
    flex: 1,
  },
  securityBadgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 3,
  },
  securityBadgeText: {
    fontSize: 13,
    color: '#15803d',
  },
  menuSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 30,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fee2e2',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default ProfileScreen;
>>>>>>> e4185fa (updated login)
