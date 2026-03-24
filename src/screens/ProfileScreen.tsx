import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileBadges from '../components/profile/ProfileBadges';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileMenu from '../components/profile/ProfileMenu';
import ProfileResume from '../components/profile/ProfileResume';
import ProfileContentActivity from '../components/profile/ProfileContentActivity';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';
import { isAdminEmail } from '../constants/admin';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    id: string;
    email?: string;
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    year_of_study?: number;
    branch?: string;
    role_level?: number;
  } | null>(null);
  const [postsCount, setPostsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const formatYear = (year?: number) => {
    if (!year) return '';
    if (year === 1) return '1st Year';
    if (year === 2) return '2nd Year';
    if (year === 3) return '3rd Year';
    return `${year}th Year`;
  };

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSessionEmail(user.email ?? null);

    const { data } = await supabase
      .from('profiles')
      .select('id, email, username, full_name, bio, avatar_url, year_of_study, branch, role_level')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }

    const [postsResult, commentsResult, savesResult] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('saves').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    setPostsCount(postsResult.count ?? 0);
    setCommentsCount(commentsResult.count ?? 0);
    setSavesCount(savesResult.count ?? 0);
  };

  const onSecretSwipeDown = () => {
    if (isAdminEmail(sessionEmail ?? profile?.email)) {
      navigation.navigate('AdminDashboard');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileHeader
          name={profile?.full_name ?? profile?.username ?? 'Student'}
          subtitle={[profile?.branch, formatYear(profile?.year_of_study)].filter(Boolean).join(' • ')}
          bio={profile?.bio ?? '"Tell the community what you are exploring this semester."'}
          avatarUrl={profile?.avatar_url ?? 'https://i.pravatar.cc/300?img=12'}
          onSecretSwipeDown={onSecretSwipeDown}
        />

        <ProfileBadges />

        <View style={styles.mainContent}>
          <ProfileStats
            questionsAsked={postsCount}
            answersProvided={commentsCount}
          />
          <ProfileMenu />
          <ProfileResume />
          <ProfileContentActivity
            postsCount={postsCount}
            savedCount={savesCount}
          />
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
