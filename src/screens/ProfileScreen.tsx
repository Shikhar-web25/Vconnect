import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileBadges from '../components/profile/ProfileBadges';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileMenu from '../components/profile/ProfileMenu';
import ProfileResume from '../components/profile/ProfileResume';
import ProfileContentActivity from '../components/profile/ProfileContentActivity';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <ProfileHeader />
        <ProfileBadges />

        <View style={styles.mainContent}>
          <ProfileStats />
          <ProfileMenu />
          <ProfileResume />
          <ProfileContentActivity />
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: 0,
  },
});

export default ProfileScreen;
