import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  NativeModules,
  PanResponder,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../../supabaseClient';
import { isAdminEmail } from '../constants/admin';
import {
  getCloudinaryDownloadUrl,
  uploadToCloudinary,
  type CloudinaryDeliveryType,
  type CloudinaryResourceType,
} from '../lib/cloudinary';

type ProfileRecord = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  year_of_study?: number | null;
  branch?: string | null;
  role_level?: number | null;
  created_at?: string | null;
  skills?: string[] | null;
  social_links?: string[] | null;
  resume_url?: string | null;
  resume_file_name?: string | null;
  resume_public_id?: string | null;
  resume_format?: string | null;
  resume_resource_type?: string | null;
  resume_delivery_type?: string | null;
};

type RecentPost = {
  id: string;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  comments_count?: number | null;
};

const formatYearLabel = (year?: number | null) => {
  if (!year) return 'Year not set';
  if (year === 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  return `${year}th Year`;
};

const formatRoleLabel = (roleLevel?: number | null) => {
  if ((roleLevel ?? 0) >= 2) return 'Admin';
  if ((roleLevel ?? 0) >= 1) return 'Mentor';
  return 'Student';
};

const formatJoinedDate = (createdAt?: string | null) => {
  if (!createdAt) return 'Unknown';
  return new Date(createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatRelativeTime = (createdAt?: string | null) => {
  if (!createdAt) return 'Recently';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const parseListInput = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const ensureProtocol = (value: string) => {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

const getInitials = (name?: string | null) => {
  const source = (name ?? '').trim();
  if (!source) return 'V';
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'V';
};

const socialLabel = (link: string) => {
  const clean = link.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  return clean.length > 42 ? `${clean.slice(0, 39)}...` : clean;
};

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const isPdfType = (name?: string | null, mimeType?: string | null) => {
  if (mimeType?.toLowerCase() === 'application/pdf') return true;
  return !!name && name.toLowerCase().endsWith('.pdf');
};

const hasNativeDocumentPicker = () => Boolean((NativeModules as Record<string, unknown>)?.RNDocumentPicker);

const normalizeCloudinaryFormat = (value?: string | null) => {
  if (!value) return null;
  return value.replace(/^\./, '').trim().toLowerCase() || null;
};

const normalizeCloudinaryResourceType = (value?: string | null): CloudinaryResourceType => {
  if (value === 'image' || value === 'video' || value === 'raw') return value;
  return 'raw';
};

const normalizeCloudinaryDeliveryType = (value?: string | null): CloudinaryDeliveryType => {
  if (value === 'authenticated' || value === 'private' || value === 'upload') return value;
  return 'private';
};

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [profileColumns, setProfileColumns] = useState<string[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);
  const [socialModalVisible, setSocialModalVisible] = useState(false);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<'avatar' | 'resume' | null>(null);
  const [savingSection, setSavingSection] = useState<'profile' | 'skills' | 'social' | 'resume' | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [draftBranch, setDraftBranch] = useState('');
  const [draftYear, setDraftYear] = useState('');
  const [draftAvatarUrl, setDraftAvatarUrl] = useState('');
  const [draftSkills, setDraftSkills] = useState('');
  const [draftSocialLinks, setDraftSocialLinks] = useState('');
  const [draftResumeName, setDraftResumeName] = useState('');
  const [draftResumeUrl, setDraftResumeUrl] = useState('');
  const [draftResumePublicId, setDraftResumePublicId] = useState('');
  const [draftResumeFormat, setDraftResumeFormat] = useState('pdf');
  const [draftResumeResourceType, setDraftResumeResourceType] = useState<CloudinaryResourceType>('raw');
  const [draftResumeDeliveryType, setDraftResumeDeliveryType] = useState<CloudinaryDeliveryType>('private');

  useEffect(() => {
    loadProfile(true);
  }, []);

  const hasColumn = (column: string) => profileColumns.includes(column);

  const alertMissingColumns = (columns: string[]) => {
    Alert.alert(
      'Backend setup needed',
      `Add these columns in Supabase before editing this section: ${columns.join(', ')}.`,
    );
  };

  const loadProfile = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setSessionEmail(user.email ?? null);

      const [profileResult, postsResult, commentsResult, savesResult, recentPostsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('saves').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('posts')
          .select('id, title, content, created_at, comments_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      const row = (profileResult.data ?? null) as ProfileRecord | null;
      setProfile(row);
      setProfileColumns(Object.keys(profileResult.data ?? {}));
      setPostsCount(postsResult.count ?? 0);
      setCommentsCount(commentsResult.count ?? 0);
      setSavesCount(savesResult.count ?? 0);
      setRecentPosts((recentPostsResult.data as RecentPost[] | null) ?? []);
    } catch (error) {
      console.warn('Profile load failed:', error);
      Alert.alert('Profile unavailable', 'Could not load your profile details from Supabase.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openProfileEditor = () => {
    setDraftName(profile?.full_name ?? profile?.username ?? '');
    setDraftBio(profile?.bio ?? '');
    setDraftBranch(profile?.branch ?? '');
    setDraftYear(profile?.year_of_study ? String(profile.year_of_study) : '');
    setDraftAvatarUrl(profile?.avatar_url ?? '');
    setProfileModalVisible(true);
  };

  const openSkillsEditor = () => {
    if (!hasColumn('skills')) {
      alertMissingColumns(['skills']);
      return;
    }
    setDraftSkills((profile?.skills ?? []).join('\n'));
    setSkillsModalVisible(true);
  };

  const openSocialEditor = () => {
    if (!hasColumn('social_links')) {
      alertMissingColumns(['social_links']);
      return;
    }
    setDraftSocialLinks((profile?.social_links ?? []).join('\n'));
    setSocialModalVisible(true);
  };

  const openResumeEditor = () => {
    const missing = ['resume_url', 'resume_file_name'].filter((column) => !hasColumn(column));
    if (missing.length > 0) {
      alertMissingColumns(missing);
      return;
    }
    setDraftResumeName(profile?.resume_file_name ?? '');
    setDraftResumeUrl(profile?.resume_url ?? '');
    setDraftResumePublicId(profile?.resume_public_id ?? '');
    setDraftResumeFormat(normalizeCloudinaryFormat(profile?.resume_format) ?? 'pdf');
    setDraftResumeResourceType(normalizeCloudinaryResourceType(profile?.resume_resource_type));
    setDraftResumeDeliveryType(normalizeCloudinaryDeliveryType(profile?.resume_delivery_type));
    setResumeModalVisible(true);
  };

  const handlePickAndUploadAvatar = async () => {
    if (!hasColumn('avatar_url')) {
      alertMissingColumns(['avatar_url']);
      return;
    }

    try {
      setUploadingAsset('avatar');
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) {
        throw new Error('No image selected.');
      }
      if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE_BYTES) {
        throw new Error('Avatar must be 2 MB or smaller.');
      }
      if (asset.type && !ALLOWED_AVATAR_TYPES.includes(asset.type)) {
        throw new Error('Avatar must be JPG, PNG, or WEBP.');
      }

      const upload = await uploadToCloudinary({
        preset: 'vconnect_avatars',
        resourceType: 'image',
        file: {
          uri: asset.uri,
          name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
          type: asset.type ?? 'image/jpeg',
        },
      });

      if (!upload?.secure_url) {
        throw new Error('Upload did not return a URL.');
      }

      setDraftAvatarUrl(upload.secure_url);
      Alert.alert('Avatar uploaded', 'Tap Save to persist this new avatar to your profile.');
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message ?? 'Could not upload avatar.');
    } finally {
      setUploadingAsset(null);
    }
  };

  const handlePickAndUploadResume = async () => {
    const missing = ['resume_url', 'resume_file_name'].filter((column) => !hasColumn(column));
    if (missing.length > 0) {
      alertMissingColumns(missing);
      return;
    }
    if (!hasNativeDocumentPicker()) {
      Alert.alert(
        'Rebuild required',
        'Document picker native module is missing in this build. Run `npx react-native run-android`, then reopen the app and try again.',
      );
      return;
    }

    try {
      setUploadingAsset('resume');
      const { pick: pickDocument } = require('@react-native-documents/picker');
      const selection = await pickDocument({
        allowMultiSelection: false,
        type: ['application/pdf'],
      });

      const file = Array.isArray(selection) ? selection[0] : selection;
      if (!file?.uri) {
        throw new Error('No document selected.');
      }
      if (file.size && file.size > MAX_RESUME_SIZE_BYTES) {
        throw new Error('Resume must be 10 MB or smaller.');
      }
      if (!isPdfType(file.name, file.type)) {
        throw new Error('Only PDF resumes are allowed.');
      }

      const upload = await uploadToCloudinary({
        preset: 'vconnect_docs',
        resourceType: 'raw',
        deliveryType: 'private',
        file: {
          uri: file.uri,
          name: file.name ?? `resume-${Date.now()}.pdf`,
          type: file.type ?? 'application/pdf',
        },
      });

      if (!upload?.secure_url) {
        throw new Error('Upload did not return a URL.');
      }

      setDraftResumeName(file.name ?? upload.original_filename ?? 'resume.pdf');
      setDraftResumeUrl(upload.secure_url);
      setDraftResumePublicId(upload.public_id ?? '');
      setDraftResumeFormat(normalizeCloudinaryFormat(upload.format) ?? 'pdf');
      setDraftResumeResourceType(normalizeCloudinaryResourceType(upload.resource_type));
      setDraftResumeDeliveryType(normalizeCloudinaryDeliveryType(upload.type));
      Alert.alert('Resume uploaded', 'Tap Save to persist this resume in your profile.');
    } catch (error: any) {
      const code = `${error?.code ?? ''}`.toLowerCase();
      const message = code.includes('cancel')
        ? null
        : error?.message ?? 'Could not upload resume.';
      if (message) {
        Alert.alert('Upload failed', message);
      }
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleResumeUrlChange = (value: string) => {
    setDraftResumeUrl(value);
    if (draftResumePublicId) {
      setDraftResumePublicId('');
      setDraftResumeFormat('pdf');
      setDraftResumeResourceType('raw');
      setDraftResumeDeliveryType('private');
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || savingSection) return;

    const trimmedYear = draftYear.trim();
    const parsedYear = trimmedYear ? Number(trimmedYear) : null;
    if (
      trimmedYear &&
      (!Number.isInteger(parsedYear ?? Number.NaN) || (parsedYear ?? 0) < 1 || (parsedYear ?? 0) > 6)
    ) {
      Alert.alert('Invalid year', 'Use a year of study between 1 and 6.');
      return;
    }
    const nextYear = parsedYear;

    const updates: Record<string, string | number | null> = {};
    if (hasColumn('full_name')) updates.full_name = draftName.trim() || null;
    if (hasColumn('bio')) updates.bio = draftBio.trim() || null;
    if (hasColumn('branch')) updates.branch = draftBranch.trim() || null;
    if (hasColumn('year_of_study')) updates.year_of_study = nextYear;
    if (hasColumn('avatar_url')) updates.avatar_url = draftAvatarUrl.trim() || null;

    setSavingSection('profile');
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    setSavingSection(null);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    setProfile((current) => (current ? { ...current, ...updates } : current));
    setProfileModalVisible(false);
  };

  const handleSaveSkills = async () => {
    if (!profile || savingSection) return;
    if (!hasColumn('skills')) {
      alertMissingColumns(['skills']);
      return;
    }

    const nextSkills = parseListInput(draftSkills);
    setSavingSection('skills');
    const { error } = await supabase.from('profiles').update({ skills: nextSkills }).eq('id', profile.id);
    setSavingSection(null);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    setProfile((current) => (current ? { ...current, skills: nextSkills } : current));
    setSkillsModalVisible(false);
  };

  const handleSaveSocialLinks = async () => {
    if (!profile || savingSection) return;
    if (!hasColumn('social_links')) {
      alertMissingColumns(['social_links']);
      return;
    }

    const nextLinks = parseListInput(draftSocialLinks).map(ensureProtocol);
    setSavingSection('social');
    const { error } = await supabase.from('profiles').update({ social_links: nextLinks }).eq('id', profile.id);
    setSavingSection(null);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    setProfile((current) => (current ? { ...current, social_links: nextLinks } : current));
    setSocialModalVisible(false);
  };

  const handleSaveResume = async () => {
    if (!profile || savingSection) return;
    const missing = ['resume_url', 'resume_file_name'].filter((column) => !hasColumn(column));
    if (missing.length > 0) {
      alertMissingColumns(missing);
      return;
    }

    const updates: Record<string, string | null> = {
      resume_file_name: draftResumeName.trim() || null,
      resume_url: draftResumeUrl.trim() ? ensureProtocol(draftResumeUrl.trim()) : null,
    };
    if (hasColumn('resume_public_id')) updates.resume_public_id = draftResumePublicId.trim() || null;
    if (hasColumn('resume_format')) updates.resume_format = normalizeCloudinaryFormat(draftResumeFormat) ?? null;
    if (hasColumn('resume_resource_type')) updates.resume_resource_type = draftResumeResourceType || null;
    if (hasColumn('resume_delivery_type')) updates.resume_delivery_type = draftResumeDeliveryType || null;

    setSavingSection('resume');
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    setSavingSection(null);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    setProfile((current) => (current ? { ...current, ...updates } : current));
    setResumeModalVisible(false);
  };

  const handleOpenResume = async () => {
    const resumePublicId = profile?.resume_public_id?.trim();
    if (resumePublicId) {
      try {
        const signedUrl = await getCloudinaryDownloadUrl({
          publicId: resumePublicId,
          resourceType: normalizeCloudinaryResourceType(profile?.resume_resource_type),
          deliveryType: normalizeCloudinaryDeliveryType(profile?.resume_delivery_type),
          format: normalizeCloudinaryFormat(profile?.resume_format) ?? 'pdf',
          expiresInSeconds: 300,
        });

        const supported = await Linking.canOpenURL(signedUrl);
        if (!supported) {
          Alert.alert('Open failed', 'Could not open signed resume URL on this device.');
          return;
        }

        await Linking.openURL(signedUrl);
        return;
      } catch (error: any) {
        Alert.alert('Resume access failed', error?.message ?? 'Could not open signed resume URL.');
        return;
      }
    }

    const resumeUrl = profile?.resume_url?.trim();
    if (!resumeUrl) {
      Alert.alert('No resume yet', 'Add a resume link first.');
      return;
    }

    const finalUrl = ensureProtocol(resumeUrl);
    const supported = await Linking.canOpenURL(finalUrl);
    if (!supported) {
      Alert.alert('Invalid link', 'This resume link cannot be opened on the device.');
      return;
    }

    await Linking.openURL(finalUrl);
  };

  const handleOpenSocialLink = async (link: string) => {
    const finalUrl = ensureProtocol(link);
    const supported = await Linking.canOpenURL(finalUrl);
    if (!supported) {
      Alert.alert('Invalid link', 'This social link cannot be opened on the device.');
      return;
    }
    await Linking.openURL(finalUrl);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'This will end the current session on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Logout failed', error.message);
          }
        },
      },
    ]);
  };

  const handleSecretSwipeDown = () => {
    if (isAdminEmail(sessionEmail ?? profile?.email)) {
      navigation.navigate('AdminDashboard');
    }
  };

  const avatarSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 12 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 72 && gestureState.vy > 0.12) {
            handleSecretSwipeDown();
          }
        },
      }),
    [sessionEmail, profile?.email],
  );

  const displayName = profile?.full_name ?? profile?.username ?? 'Student';
  const subtitle = [profile?.branch, formatYearLabel(profile?.year_of_study)].filter(Boolean).join(' • ');
  const roleLabel = formatRoleLabel(profile?.role_level);
  const missingColumns = ['skills', 'social_links', 'resume_url', 'resume_file_name'].filter(
    (column) => !hasColumn(column),
  );
  const missingPrivateResumeColumns = [
    'resume_public_id',
    'resume_format',
    'resume_resource_type',
    'resume_delivery_type',
  ].filter((column) => !hasColumn(column));
  const hasPrivateResumeColumns = missingPrivateResumeColumns.length === 0;
  const recentSkills = profile?.skills ?? [];
  const socialLinks = profile?.social_links ?? [];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar barStyle="light-content" backgroundColor="#16365F" />
        <View style={styles.loadingCard}>
          <MaterialCommunityIcons name="account-circle-outline" size={36} color="#8CCBFF" />
          <Text style={styles.loadingTitle}>Loading profile</Text>
          <Text style={styles.loadingBody}>Fetching your latest profile, activity, and saved backend data.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#16365F" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile()} tintColor="#16365F" />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#16365F', '#1B4B7E', '#2E7BAA']} style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Vconnect</Text>
              <Text style={styles.heroTitle}>Profile</Text>
            </View>
            <TouchableOpacity style={styles.headerAction} onPress={openProfileEditor} activeOpacity={0.85}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color="#16365F" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeroCard}>
            <View style={styles.avatarWrap} {...avatarSwipeResponder.panHandlers}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <LinearGradient colors={['#76C5F5', '#3C8DC6']} style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
                </LinearGradient>
              )}
              <View style={styles.avatarBadge}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#0F766E" />
              </View>
            </View>

            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.subtitle}>{subtitle || 'Set your branch and year to complete this profile.'}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.badgePill}>
                <MaterialCommunityIcons name="badge-account-outline" size={16} color="#16365F" />
                <Text style={styles.badgeText}>{roleLabel}</Text>
              </View>
              <View style={styles.badgePill}>
                <MaterialCommunityIcons name="email-outline" size={16} color="#16365F" />
                <Text style={styles.badgeText}>{profile?.email ?? sessionEmail ?? 'Email unavailable'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentSection}>
          {missingColumns.length > 0 && (
            <View style={styles.setupCard}>
              <View style={styles.setupIconWrap}>
                <MaterialCommunityIcons name="database-cog-outline" size={20} color="#8A5A00" />
              </View>
              <View style={styles.setupTextWrap}>
                <Text style={styles.setupTitle}>Profile backend setup still needed</Text>
                <Text style={styles.setupBody}>
                  Add these `profiles` columns in Supabase to unlock the full latest profile: {missingColumns.join(', ')}.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="post-outline" size={22} color="#16365F" />
              <Text style={styles.statNumber}>{postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="comment-processing-outline" size={22} color="#16365F" />
              <Text style={styles.statNumber}>{commentsCount}</Text>
              <Text style={styles.statLabel}>Replies</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="bookmark-outline" size={22} color="#16365F" />
              <Text style={styles.statNumber}>{savesCount}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>About</Text>
              <TouchableOpacity onPress={openProfileEditor} activeOpacity={0.8}>
                <MaterialCommunityIcons name="pencil" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardBody}>
              {profile?.bio?.trim() || 'Add a short bio so other students know what you are building, learning, or looking for.'}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="source-branch" size={16} color="#0F5B88" />
                <Text style={styles.metaPillText}>{profile?.branch || 'Branch not set'}</Text>
              </View>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="calendar-month-outline" size={16} color="#0F5B88" />
                <Text style={styles.metaPillText}>{formatYearLabel(profile?.year_of_study)}</Text>
              </View>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#0F5B88" />
                <Text style={styles.metaPillText}>Joined {formatJoinedDate(profile?.created_at)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Skills</Text>
              <TouchableOpacity onPress={openSkillsEditor} activeOpacity={0.8}>
                <MaterialCommunityIcons name="pencil" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            {hasColumn('skills') ? (
              recentSkills.length > 0 ? (
                <View style={styles.tagWrap}>
                  {recentSkills.map((skill) => (
                    <View key={skill} style={styles.tagChip}>
                      <Text style={styles.tagText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyBody}>Add skills that help students understand your strengths.</Text>
              )
            ) : (
              <Text style={styles.emptyBody}>This section is wired in the app, but your `profiles.skills` column is not created yet.</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Resume</Text>
              <TouchableOpacity onPress={openResumeEditor} activeOpacity={0.8}>
                <MaterialCommunityIcons name="pencil" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.assetRow}>
              <View style={styles.assetIconWrap}>
                <MaterialCommunityIcons name="file-document-outline" size={26} color="#16365F" />
              </View>
              <View style={styles.assetMeta}>
                <Text style={styles.assetTitle}>{profile?.resume_file_name?.trim() || 'Resume not added yet'}</Text>
                <Text style={styles.assetSubtitle}>
                  {profile?.resume_public_id?.trim()
                    ? 'Stored privately. Opens with a short-lived signed URL.'
                    : profile?.resume_url?.trim()
                      ? 'Stored as a link in your profile.'
                      : 'Add a Cloudinary or document URL once your upload flow is ready.'}
                </Text>
              </View>
              <TouchableOpacity style={styles.assetActionButton} onPress={handleOpenResume} activeOpacity={0.85}>
                <MaterialCommunityIcons name="open-in-new" size={18} color="#16365F" />
              </TouchableOpacity>
            </View>
            {!hasPrivateResumeColumns && (
              <Text style={styles.helperText}>
                Add columns {missingPrivateResumeColumns.join(', ')} for private signed resume access.
              </Text>
            )}
            <View style={styles.resumeActionsRow}>
              <TouchableOpacity style={styles.resumeSecondaryButton} activeOpacity={0.9} onPress={openResumeEditor}>
                <Text style={styles.resumeSecondaryButtonText}>Edit Resume Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resumeUploadButton}
                activeOpacity={0.9}
                onPress={handlePickAndUploadResume}
                disabled={uploadingAsset === 'resume'}
              >
                {uploadingAsset === 'resume' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name="cloud-upload-outline" size={17} color="#FFFFFF" />
                )}
                <Text style={styles.resumeUploadButtonText}>
                  {uploadingAsset === 'resume' ? 'Uploading...' : 'Upload PDF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Social Links</Text>
              <TouchableOpacity onPress={openSocialEditor} activeOpacity={0.8}>
                <MaterialCommunityIcons name="pencil" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            {hasColumn('social_links') ? (
              socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <TouchableOpacity
                    key={link}
                    style={styles.linkRow}
                    onPress={() => handleOpenSocialLink(link)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.linkIconWrap}>
                      <MaterialCommunityIcons name="link-variant" size={18} color="#16365F" />
                    </View>
                    <Text style={styles.linkText}>{socialLabel(link)}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyBody}>Add Instagram, LinkedIn, GitHub, portfolio, or any public profile you want visible.</Text>
              )
            ) : (
              <Text style={styles.emptyBody}>This section is wired in the app, but your `profiles.social_links` column is not created yet.</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Posts</Text>
              <Text style={styles.cardCaption}>{postsCount} total</Text>
            </View>
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <View key={post.id} style={styles.postRow}>
                  <View style={styles.postDot} />
                  <View style={styles.postTextWrap}>
                    <Text style={styles.postTitle} numberOfLines={1}>
                      {post.title?.trim() || post.content?.trim() || 'Untitled post'}
                    </Text>
                    <Text style={styles.postPreview} numberOfLines={2}>
                      {post.content?.trim() || 'No body text added.'}
                    </Text>
                    <Text style={styles.postMeta}>
                      {formatRelativeTime(post.created_at)} • {post.comments_count ?? 0} comments
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyBody}>Your latest posts will appear here once you publish them from the home feed.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.9}>
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={profileModalVisible} transparent animationType="fade" onRequestClose={() => setProfileModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput style={styles.input} value={draftName} onChangeText={setDraftName} placeholder="Full name" placeholderTextColor="#94A3B8" />
            <TextInput style={[styles.input, styles.multilineInput]} value={draftBio} onChangeText={setDraftBio} placeholder="Bio" placeholderTextColor="#94A3B8" multiline />
            <TextInput style={styles.input} value={draftBranch} onChangeText={setDraftBranch} placeholder="Branch" placeholderTextColor="#94A3B8" />
            <TextInput style={styles.input} value={draftYear} onChangeText={setDraftYear} placeholder="Year of study" placeholderTextColor="#94A3B8" keyboardType="number-pad" />
            <TextInput style={styles.input} value={draftAvatarUrl} onChangeText={setDraftAvatarUrl} placeholder="Avatar URL" placeholderTextColor="#94A3B8" autoCapitalize="none" />
            <TouchableOpacity
              style={styles.uploadButton}
              activeOpacity={0.9}
              onPress={handlePickAndUploadAvatar}
              disabled={uploadingAsset === 'avatar'}
            >
              {uploadingAsset === 'avatar' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="image-plus" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.uploadButtonText}>
                {uploadingAsset === 'avatar' ? 'Uploading...' : 'Pick and Upload Avatar'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>You can still paste a URL manually if needed.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonMuted]} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.modalButtonMutedText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSaveProfile}>
                <Text style={styles.modalButtonPrimaryText}>{savingSection === 'profile' ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={skillsModalVisible} transparent animationType="fade" onRequestClose={() => setSkillsModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Skills</Text>
            <Text style={styles.modalHint}>One skill per line, or separate them with commas.</Text>
            <TextInput style={[styles.input, styles.largeMultilineInput]} value={draftSkills} onChangeText={setDraftSkills} placeholder={'React Native\nUI Design\nBackend'} placeholderTextColor="#94A3B8" multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonMuted]} onPress={() => setSkillsModalVisible(false)}>
                <Text style={styles.modalButtonMutedText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSaveSkills}>
                <Text style={styles.modalButtonPrimaryText}>{savingSection === 'skills' ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={socialModalVisible} transparent animationType="fade" onRequestClose={() => setSocialModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Social Links</Text>
            <Text style={styles.modalHint}>One link per line. Missing protocols will be normalized to https://.</Text>
            <TextInput style={[styles.input, styles.largeMultilineInput]} value={draftSocialLinks} onChangeText={setDraftSocialLinks} placeholder={'github.com/yourname\nlinkedin.com/in/yourname'} placeholderTextColor="#94A3B8" multiline autoCapitalize="none" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonMuted]} onPress={() => setSocialModalVisible(false)}>
                <Text style={styles.modalButtonMutedText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSaveSocialLinks}>
                <Text style={styles.modalButtonPrimaryText}>{savingSection === 'social' ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={resumeModalVisible} transparent animationType="fade" onRequestClose={() => setResumeModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resume Link</Text>
            <Text style={styles.modalHint}>
              Upload validates PDF type and size (max 10 MB) before sending to Cloudinary.
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              activeOpacity={0.9}
              onPress={handlePickAndUploadResume}
              disabled={uploadingAsset === 'resume'}
            >
              {uploadingAsset === 'resume' ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="file-upload-outline" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.uploadButtonText}>
                {uploadingAsset === 'resume' ? 'Uploading...' : 'Pick PDF and Upload'}
              </Text>
            </TouchableOpacity>
            <TextInput style={styles.input} value={draftResumeName} onChangeText={setDraftResumeName} placeholder="Resume file name" placeholderTextColor="#94A3B8" />
            <TextInput style={[styles.input, styles.multilineInput]} value={draftResumeUrl} onChangeText={handleResumeUrlChange} placeholder="Cloudinary or public document URL" placeholderTextColor="#94A3B8" autoCapitalize="none" multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonMuted]} onPress={() => setResumeModalVisible(false)}>
                <Text style={styles.modalButtonMutedText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSaveResume}>
                <Text style={styles.modalButtonPrimaryText}>{savingSection === 'resume' ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  screen: { flex: 1, backgroundColor: '#F4F7FB' },
  scrollContent: { paddingBottom: 40 },
  loadingScreen: { flex: 1, backgroundColor: '#173864', justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingCard: { width: '100%', maxWidth: 320, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', padding: 24, alignItems: 'center' },
  loadingTitle: { marginTop: 12, color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  loadingBody: { marginTop: 8, color: 'rgba(255,255,255,0.84)', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  heroSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 110, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroEyebrow: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase' },
  heroTitle: { marginTop: 4, color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  headerAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  profileHeroCard: { marginTop: 22, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.14)', padding: 22, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  avatarWrap: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#FFFFFF', padding: 4, marginBottom: 16 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 52 },
  avatarFallback: { flex: 1, borderRadius: 52, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: 0.6 },
  avatarBadge: { position: 'absolute', right: 4, bottom: 4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  displayName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { marginTop: 6, color: 'rgba(255,255,255,0.82)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  badgeRow: { marginTop: 16, width: '100%', gap: 10 },
  badgePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  badgeText: { flex: 1, color: '#16365F', fontSize: 13, fontWeight: '700' },
  contentSection: { marginTop: -74, paddingHorizontal: 20, gap: 16 },
  setupCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E8', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F2D59C' },
  setupIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFE8B1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  setupTextWrap: { flex: 1 },
  setupTitle: { color: '#7A4E00', fontSize: 15, fontWeight: '800' },
  setupBody: { marginTop: 4, color: '#8A6419', fontSize: 13, lineHeight: 19 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 18, paddingHorizontal: 12, alignItems: 'center', shadowColor: '#16365F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  statNumber: { marginTop: 10, color: '#16365F', fontSize: 22, fontWeight: '800' },
  statLabel: { marginTop: 4, color: '#64748B', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, shadowColor: '#16365F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: '#16365F', fontSize: 17, fontWeight: '800' },
  cardCaption: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  cardBody: { color: '#334155', fontSize: 14, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  metaPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: '#EFF6FB', paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  metaPillText: { color: '#0F5B88', fontSize: 12, fontWeight: '700' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagChip: { borderRadius: 18, backgroundColor: '#E9F5FF', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#CAE6F8' },
  tagText: { color: '#17577E', fontSize: 13, fontWeight: '700' },
  emptyBody: { color: '#64748B', fontSize: 14, lineHeight: 21 },
  assetRow: { flexDirection: 'row', alignItems: 'center' },
  assetIconWrap: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#EFF6FB', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  assetMeta: { flex: 1 },
  assetTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  assetSubtitle: { marginTop: 4, color: '#64748B', fontSize: 13, lineHeight: 18 },
  assetActionButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  resumeActionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  resumeSecondaryButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeSecondaryButtonText: { color: '#4B5563', fontSize: 12, fontWeight: '700' },
  resumeUploadButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#16365F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  resumeUploadButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  linkIconWrap: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#EFF6FB', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  linkText: { flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '600' },
  postRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  postDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B4B7E', marginTop: 8, marginRight: 12 },
  postTextWrap: { flex: 1 },
  postTitle: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  postPreview: { marginTop: 4, color: '#64748B', fontSize: 13, lineHeight: 19 },
  postMeta: { marginTop: 6, color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  logoutButton: { marginTop: 8, height: 56, borderRadius: 18, backgroundColor: '#D9485F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 24, backgroundColor: '#FFFFFF', padding: 20 },
  modalTitle: { color: '#16365F', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalHint: { color: '#64748B', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  helperText: { color: '#64748B', fontSize: 12, marginBottom: 8, marginTop: -2 },
  uploadButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1B4B7E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  input: { borderRadius: 16, borderWidth: 1, borderColor: '#D7E1EA', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: '#0F172A', marginBottom: 12 },
  multilineInput: { minHeight: 88, textAlignVertical: 'top' },
  largeMultilineInput: { minHeight: 160, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  modalButton: { flex: 1, borderRadius: 16, height: 48, alignItems: 'center', justifyContent: 'center' },
  modalButtonMuted: { backgroundColor: '#EDF2F7' },
  modalButtonPrimary: { backgroundColor: '#16365F' },
  modalButtonMutedText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  modalButtonPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
