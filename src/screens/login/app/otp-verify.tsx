import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AuthNavigator';
import { supabase } from '../../../../supabaseClient';

type OtpRoute = RouteProp<RootStackParamList, 'OtpVerify'>;
type OtpNav = NativeStackNavigationProp<RootStackParamList>;

const VIT_DOMAIN = '@vitbhopal.ac.in';

const normalizeUsernameFromEmail = (email?: string | null) => {
  if (!email) return null;
  const local = email.split('@')[0] ?? '';
  const sanitized = local.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 40);
  return sanitized || null;
};

const OtpVerifyScreen = () => {
  const navigation = useNavigation<OtpNav>();
  const route = useRoute<OtpRoute>();
  const { email, mode, fullName, regNo } = route.params;

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maskedEmail = useMemo(() => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    if (local.length <= 2) return `${local[0] ?? '*'}*@${domain}`;
    return `${local.slice(0, 2)}***@${domain}`;
  }, [email]);

  const ensureProfileAfterSignup = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message ?? 'Could not fetch authenticated user.');
    }

    const normalizedEmail = user.email?.toLowerCase() ?? '';
    if (!normalizedEmail.endsWith(VIT_DOMAIN)) {
      await supabase.auth.signOut();
      throw new Error('Only VIT Bhopal emails are allowed.');
    }

    const profilePayload = {
      id: user.id,
      email: normalizedEmail,
      full_name: fullName?.trim() || (user.user_metadata?.full_name as string | undefined) || null,
      username:
        normalizeUsernameFromEmail(normalizedEmail) ??
        `student_${user.id.replace(/-/g, '').slice(0, 8)}`,
    };

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (upsertError) {
      throw new Error(upsertError.message);
    }
  };

  const verifyCode = async () => {
    setErrorMessage(null);
    const otp = code.trim();
    if (otp.length < 6) {
      setErrorMessage('Enter the 6-digit OTP from your email.');
      return;
    }

    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: otp,
      type: 'email',
    });

    if (error) {
      setVerifying(false);
      setErrorMessage(error.message);
      return;
    }

    try {
      if (mode === 'signup') {
        await ensureProfileAfterSignup();
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const normalizedEmail = user?.email?.toLowerCase() ?? '';
        if (!normalizedEmail.endsWith(VIT_DOMAIN)) {
          await supabase.auth.signOut();
          throw new Error('Only VIT Bhopal emails are allowed.');
        }
      }
    } catch (error: any) {
      setVerifying(false);
      setErrorMessage(error?.message ?? 'Could not finish verification.');
      return;
    }

    setVerifying(false);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const resendCode = async () => {
    setErrorMessage(null);
    setResending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        shouldCreateUser: mode === 'signup',
        data:
          mode === 'signup'
            ? {
                full_name: fullName?.trim(),
                registration_number: regNo?.trim().toUpperCase(),
              }
            : undefined,
      },
    });

    setResending(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    Alert.alert('OTP sent', `A new code was sent to ${email}.`);
  };

  return (
    <LinearGradient colors={['#4A6D8C', '#6B8CAE']} style={styles.screen}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {maskedEmail}
          </Text>

          <TextInput
            style={styles.otpInput}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="123456"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, verifying && styles.disabledButton]}
            onPress={verifyCode}
            disabled={verifying}
            activeOpacity={0.9}
          >
            {verifying ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Verify and Continue</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, resending && styles.disabledButton]}
            onPress={resendCode}
            disabled={resending}
            activeOpacity={0.9}
          >
            {resending ? <ActivityIndicator size="small" color="#1E293B" /> : <Text style={styles.secondaryButtonText}>Resend OTP</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default OtpVerifyScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  otpInput: {
    marginTop: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 58,
    fontSize: 28,
    letterSpacing: 10,
    color: '#0F172A',
    fontWeight: '700',
    paddingHorizontal: 18,
  },
  errorText: {
    marginTop: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1B4B7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 8,
    alignSelf: 'center',
    padding: 8,
  },
  backText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.65,
  },
});
