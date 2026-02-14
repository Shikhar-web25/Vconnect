import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileBadges from '../components/profile/ProfileBadges';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileMenu from '../components/profile/ProfileMenu';
import ProfileResume from '../components/profile/ProfileResume';
import ProfileContentActivity from '../components/profile/ProfileContentActivity';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [roleLevel, setRoleLevel] = useState(0);
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('role_level')
      .eq('id', user.id)
      .single();

    if (data?.role_level) {
      setRoleLevel(data.role_level);
    }
  };

  const onSecretTap = () => {
    tapCount.current += 1;

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);

    if (tapCount.current >= 5 && roleLevel >= 10) {
      tapCount.current = 0;
      navigation.navigate('AdminDashboard');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Pressable onPress={onSecretTap}>
          <ProfileHeader />
        </Pressable>

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