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

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
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
        { icon: '👤', label: 'Edit Profile', action: 'editProfile' },
        { icon: '🔒', label: 'Privacy', action: 'privacy' },
        { icon: '🔐', label: 'Security', action: 'security' },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: '🔔', label: 'Notifications', action: 'notifications', toggle: true },
        { icon: '🌙', label: 'Dark Mode', action: 'darkMode', toggle: true },
        { icon: '🗣️', label: 'Language', action: 'language' },
      ],
    },
    {
      section: 'Security',
      items: [
        { icon: '🔏', label: 'Biometric Lock', action: 'biometric', toggle: true },
        { icon: '📱', label: 'Two-Factor Auth', action: 'twoFactor' },
        { icon: '🔑', label: 'Change Password', action: 'changePassword' },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: '❓', label: 'Help Center', action: 'help' },
        { icon: '📧', label: 'Contact Us', action: 'contact' },
        { icon: 'ℹ️', label: 'About', action: 'about' },
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
          'Your account is protected with:\n\n🔐 End-to-end encryption\n🔒 Two-factor authentication\n🔏 Biometric lock\n🛡️ Secure data storage'
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
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
          {item.toggle ? (
            <Switch
              value={getToggleValue()}
              onValueChange={(value) => handleToggle(item.action, value)}
              trackColor={{ false: '#e0e0e0', true: '#a5b4fc' }}
              thumbColor={getToggleValue() ? '#6366f1' : '#f4f4f4'}
            />
          ) : (
            <Text style={styles.menuArrow}>›</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

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
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>🔗</Text>
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
              <Text style={styles.editAvatarText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userHandle}>@johndoe</Text>
          <Text style={styles.userBio}>
            Digital creator | Tech enthusiast | Coffee lover ☕
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
            <Text style={styles.securityBadgeIcon}>🛡️</Text>
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
                  { text: 'Logout', style: 'destructive', onPress: () => {} },
                ]
              )
            }
          >
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
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
  editAvatarText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userHandle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
  },
  securityBadgeIcon: {
    fontSize: 28,
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
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 30,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;