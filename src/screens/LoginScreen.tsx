import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Easing,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  
  // OTP state and animations
  const OTP_LENGTH = 6;
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const otpAnimations = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1))
  ).current;
  
  const otpInputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(text);
    setIsEmailValid(isValid);
    return isValid;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const flipToOTP = () => {
    setShowOtpScreen(true);
    setIsTimerActive(true);
    Animated.timing(flipAnim, {
      toValue: 180,
      duration: 850,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsFlipped(true));
  };

  const flipBack = () => {
    setShowOtpScreen(false);
    setIsTimerActive(false);
    setTimer(30);
    setOtpValues(Array(OTP_LENGTH).fill(''));
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 850,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsFlipped(false));
  };

  // OTP change handler (with animation and auto-focus)
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Pop animation
    Animated.sequence([
      Animated.timing(otpAnimations[index], {
        toValue: 1.15,
        duration: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(otpAnimations[index], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace for OTP inputs
  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      // Move to previous input if current is empty and backspace is pressed
      otpInputRefs.current[index - 1]?.focus();
      const newOtp = [...otpValues];
      newOtp[index - 1] = '';
      setOtpValues(newOtp);
    }
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);
  
  // Handle verify and continue
  const handleVerifyAndContinue = () => {
    // Bypass to home screen
    console.log('OTP verified, navigating to home screen...');
    navigation.navigate('Main' as never);
  };

  const frontCardStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '-180deg'],
        }),
      },
    ],
    opacity: flipAnim.interpolate({
      inputRange: [0, 90, 180],
      outputRange: [1, 0, 0],
    }),
  };

  const backCardStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '0deg'],
        }),
      },
    ],
    opacity: flipAnim.interpolate({
      inputRange: [0, 90, 180],
      outputRange: [0, 0, 1],
    }),
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#EEF4FB"
        translucent={false}
      />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="school" size={42} color="#fff" />
        </View>
        <Text style={styles.appName}>VConnect</Text>
        <Text style={styles.tagline}>Connect. Learn. Grow Together.</Text>
      </View>

      {/* Flip Card Container */}
      <View style={styles.cardContainer}>
        {/* Front Side - Email */}
        <Animated.View
          pointerEvents={!isFlipped ? 'auto' : 'none'}
          style={[styles.card, frontCardStyle]}
        >
          <View style={styles.iconContainer}>
            <View style={styles.emailIcon}>
              <MaterialCommunityIcons name="email-outline" size={30} color="#2F80ED" />
            </View>
          </View>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.subText}>
            Enter your email address to continue
          </Text>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email" size={22} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, !isEmailValid && styles.disabledButton]} 
            onPress={flipToOTP}
            disabled={!isEmailValid}
          >
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require('../../assets/google.png')}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
              <Text style={styles.socialText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>

        {/* Back Side - OTP */}
        <Animated.View
          pointerEvents={isFlipped ? 'auto' : 'none'}
          style={[styles.card, styles.cardBack, backCardStyle]}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={flipBack}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.otpIcon}>
              <MaterialCommunityIcons name="lock-outline" size={30} color="#16A34A" />
            </View>
          </View>
          <Text style={styles.welcome}>Enter OTP</Text>
          <Text style={styles.subText}>
            We've sent a 6-digit code to
          </Text>
          <Text style={styles.emailDisplay}>{email}</Text>

          {/* Animated OTP Boxes */}
          <View style={styles.otpRow}>
            {otpValues.map((digit, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.otpBox,
                  { transform: [{ scale: otpAnimations[index] }] },
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    otpInputRefs.current[index] = ref;
                  }}
                  style={styles.otpText}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  cursorColor="#2F80ED"
                  selectionColor="#2F80ED"
                />
              </Animated.View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyAndContinue}>
            <Text style={styles.primaryText}>Verify & Continue</Text>
          </TouchableOpacity>

          <View style={styles.otpActions}>
            <TouchableOpacity onPress={flipBack}>
              <Text style={styles.changeEmail}>Change email</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.resendOtp}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {timer > 0 ? `Resend code in 0:${timer.toString().padStart(2, '0')}` : 'You can resend the code now'}
            </Text>
          </View>

          <View style={styles.securityNote}>
            <MaterialCommunityIcons name="security" size={16} color="#6B7280" />
            <Text style={styles.securityText}>
              Your code is secure and expires in 10 minutes
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#EEF4FB',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },

  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#2F80ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 6,
  },

  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'Lato',
  },

  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'Lato',
  },

  tagline: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Lato',
  },

  cardContainer: {
    width: 380,
    height: 520,
    position: 'relative',
  },

  card: {
    width: 380,
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 32,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  cardBack: {
    position: 'absolute',
    top: 0,
  },

  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  welcome: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Lato',
  },

  subText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 30,
    lineHeight: 22,
    fontFamily: 'Lato',
  },

  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Lato',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 18,
    height: 58,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: 18,
    marginLeft: 14,
    color: '#111827',
    fontFamily: 'Lato',
  },

  primaryButton: {
    backgroundColor: '#2F80ED',
    height: 58,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#2F80ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  primaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Lato',
  },

  orText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Lato',
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 28,
    height: 56,
    backgroundColor: '#FAFAFA',
  },

  googleText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Lato',
  },

  // NEW OTP Styles
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },

  otpBox: {
    width: 48,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  otpText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    fontFamily: 'Lato',
  },

  resend: {
    textAlign: 'center',
    marginTop: 16,
    color: '#2F80ED',
    fontWeight: '600',
    fontFamily: 'Lato',
  },

  // New styles for enhanced UI
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  emailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  otpIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  iconText: {
    fontSize: 28,
  },

  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  disabledButton: {
    backgroundColor: '#D1D5DB',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Lato',
  },

  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    height: 50,
    backgroundColor: '#FAFAFA',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  socialIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  socialText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Lato',
  },


  emailDisplay: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2F80ED',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Lato',
  },

  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  changeEmail: {
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: 'Lato',
    fontSize: 14,
  },

  resendOtp: {
    color: '#2F80ED',
    fontWeight: '600',
    fontFamily: 'Lato',
    fontSize: 14,
  },

  timerContainer: {
    alignItems: 'center',
    marginTop: 12,
  },

  timerText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'Lato',
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },

  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  securityText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Lato',
    textAlign: 'center',
    flex: 1,
  },
});

export default LoginScreen;
