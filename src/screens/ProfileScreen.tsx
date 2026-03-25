import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
  StatusBar,
  Alert,
  Linking
} from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { pick } from '@react-native-documents/picker';
import ImagePicker from 'react-native-image-crop-picker';
import { 
  HelpCircle, 
  MessageSquare, 
  ChevronRight, 
  Eye, 
  Download, 
  FileText, 
  LayoutGrid, 
  Users, 
  User, 
  Briefcase, 
  Bell, 
  Bookmark,
  Award,
  Edit3,
  Camera,
  LogOut,
  Instagram,
  Linkedin,
  Github,
  Twitter,
  Globe
} from 'lucide-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SuccessModal from '../components/SuccessModal';

const { width: screenWidth } = Dimensions.get('window');

// StyleSheet for React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  appContainer: {
    width: '100%',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerSection: {
    height: 400,
    backgroundColor: '#1b3a6d',
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  profileImageContainer: {
    marginTop: 32,
    position: 'relative',
    zIndex: 10,
  },
  avatarGlowRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  profileImageWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: '#3bc4ba',
    overflow: 'hidden',
    backgroundColor: 'white',
    position: 'relative',
  },
  animatedBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: '#60a5fa',
    opacity: 0.6,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userInfo: {
    marginTop: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    position: 'absolute',
    bottom: -100,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 30,
    zIndex: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statIconBg: {
    backgroundColor: '#eef2ff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    zIndex: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  contentSection: {
    flex: 1,
    marginTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Unified card style for consistency
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#1b3a6d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'linear-gradient(90deg, #1b3a6d, #3bc4ba, #1b3a6d)',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 8,
    shadowColor: '#1b3a6d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  sectionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'linear-gradient(90deg, #1b3a6d, #3bc4ba, #1b3a6d)',
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  reputationValue: {
    color: '#1b3a6d',
    fontWeight: 'bold',
    fontSize: 18,
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1b3a6d',
    height: '100%',
    borderRadius: 6,
  },
  skillsContainer: {
    marginTop: 20,
  },
  skillTag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    color: '#4338ca',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    marginBottom: 8,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    lineHeight: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  assetContainer: {
    backgroundColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assetIconContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  assetInfo: {
    marginLeft: 20,
    flex: 1,
    justifyContent: 'center',
  },
  assetTitle: {
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  assetSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  assetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  downloadButton: {
    padding: 12,
    backgroundColor: '#1e3a8a',
    borderRadius: 20,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listItemIconContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
  },
  listItemText: {
    color: '#334155',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemBadge: {
    color: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
  },
  navDot: {
    width: 4,
    height: 4,
    backgroundColor: 'transparent',
    borderRadius: 2,
    marginTop: 4,
  },
  navDotActive: {
    width: 6,
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    marginTop: 4,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#60a5fa',
    borderRadius: 50,
    opacity: 0.6,
  },
  floatingParticle: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.08,
  },
  waveLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#60a5fa',
    opacity: 0.05,
  },
  verificationRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#3bc4ba',
  },
  textEntrance: {
    opacity: 0,
    transform: [{ translateY: 20 }],
  },
  statCardAnimated: {
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  skillTagAnimated: {
    transform: [{ scale: 0.9 }],
    opacity: 0,
  },
  progressRing: {
    width: 60,
    height: 60,
    transform: [{ rotate: '-90deg' }],
  },
  chartBar: {
    backgroundColor: '#3bc4ba',
    borderRadius: 4,
    marginTop: 8,
    height: 0,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rippleEffect: {
    position: 'absolute',
    borderRadius: 64,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    transform: [{ scale: 0 }],
  },
  editContainer: {
    marginTop: 8,
    alignItems: 'center',
    zIndex: 10,
  },
  editInput: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editNameInput: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b3a6d',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#1b3a6d',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  skillsModalContent: {
    maxHeight: 300,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  skillItemText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  removeSkillButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 6,
  },
  addSkillContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  addSkillInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
  },
  addSkillButton: {
    backgroundColor: '#1b3a6d',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#1b3a6d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    textAlign: 'left',
    minHeight: 80,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3bc4ba',
  },
  aboutInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 160,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  pencilIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  resumeModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resumeModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeCancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resumeUploadButton: {
    backgroundColor: '#1b3a6d',
  },
  resumeCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  resumeUploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#1b3a6d',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addSkillButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  skillsCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});

// Custom hooks for animations
// Ultra-smooth count-up with optimized performance
const useCountUp = (end: number, duration: number = 2000, start: number = 0, delay: number = 0) => {
  const [count, setCount] = useState(start);
  const [scaleValue] = useState(new Animated.Value(1));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      const startTime = Date.now();
      let lastFrame = 0;
      const animationTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Optimized ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        // Only update if value changed (performance optimization)
        if (current !== lastFrame) {
          setCount(current);
          lastFrame = current;
        }
        
        // Subtle scale pop at final value
        if (progress >= 0.9 && progress < 0.95) {
          Animated.timing(scaleValue, {
            toValue: 1.03, // Reduced pop
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else if (progress >= 0.95) {
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        
        if (progress >= 1) {
          clearInterval(animationTimer);
        }
      }, 32); // Reduced frame rate for better performance

      return () => clearInterval(animationTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, duration, start, delay, isVisible, scaleValue]);

  return { count, scaleValue, setIsVisible };
};

const useProgressAnimation = (targetWidth: number, duration: number = 2000, delay: number = 200) => {
  const [width, setWidth] = useState(0);
  const [starScale] = useState(new Animated.Value(1));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const animationTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Enhanced ease-out cubic for smoother progress
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setWidth(targetWidth * easeOut);
        
        // Star bounce when complete
        if (progress >= 0.95 && targetWidth >= 100) {
          Animated.sequence([
            Animated.timing(starScale, {
              toValue: 1.25, // Stronger bounce
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(starScale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start();
        }
        
        if (progress >= 1) {
          clearInterval(animationTimer);
        }
      }, 16);

      return () => clearInterval(animationTimer);
    }, delay);

    return () => clearTimeout(timer);
  }, [targetWidth, duration, delay, isVisible, starScale]);

  return { width, starScale, setIsVisible };
};

const useScrollDetection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (value > 100 && !isVisible) {
        setIsVisible(true);
      }
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, isVisible]);

  return { isVisible, handleScroll, scrollY };
};

// Custom hooks for animations with enhanced easing
const useSpringAnimation = (toValue: number, duration: number = 400) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const animate = useCallback(() => {
    Animated.spring(animatedValue, {
      toValue,
      tension: 80, // Lower tension for more bounce
      friction: 6, // Lower friction for more expressive bounce
      useNativeDriver: true,
    }).start();
  }, [animatedValue, toValue]);

  useEffect(() => {
    animate();
  }, [animate]);

  return animatedValue;
};

// Circular Percentage Ring Component
const CircularProgress: React.FC<{ percentage: number; size: number; strokeWidth: number }> = ({ percentage, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = useRef(new Animated.Value(circumference)).current;
  
  useEffect(() => {
    Animated.timing(strokeDashoffset, {
      toValue: circumference - (circumference * percentage) / 100,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [percentage]);
  
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={styles.progressRing}>
        <Animated.View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#f1f5f9',
            position: 'absolute',
          }}
        />
        <Animated.View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#3bc4ba',
            position: 'absolute',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: '-90deg' }],
            opacity: strokeDashoffset.interpolate({
              inputRange: [0, circumference],
              outputRange: [1, 0],
            }),
          }}
        />
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          top: strokeWidth,
          left: strokeWidth,
          right: strokeWidth,
          bottom: strokeWidth,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};
// Enhanced Ambient Background with optimized floating particles
const AmbientBackground: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    size: number; 
    duration: number; 
    delay: number;
    type: 'dot' | 'wave';
    parallaxDepth: number;
    scaleValue: Animated.Value;
    opacityValue: Animated.Value;
  }>>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 15 }, (_, i) => ({ // Reduced count for performance
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: 8 + Math.random() * 4, // Slower, smoother movement
      delay: Math.random() * 2,
      type: (i < 10 ? 'dot' : 'wave') as 'dot' | 'wave',
      parallaxDepth: 0.3 + Math.random() * 0.3, // Reduced parallax for performance
      scaleValue: new Animated.Value(1),
      opacityValue: new Animated.Value(0.08 + Math.random() * 0.07)
    }));
    
    // Optimized scale drift with smoother easing
    newElements.forEach(element => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(element.scaleValue, {
            toValue: 1.03, // Subtle scale
            duration: element.duration * 800,
            delay: element.delay * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(element.scaleValue, {
            toValue: 1,
            duration: element.duration * 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    });
    
    setParticles(newElements);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((element) => (
        <Animated.View
          key={element.id}
          style={[
            element.type === 'dot' ? styles.floatingParticle : styles.waveLine,
            {
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: element.type === 'dot' ? element.size : element.size * 15,
              height: element.type === 'dot' ? element.size : 1,
              opacity: element.opacityValue, // Use animated opacity
              transform: [
                { scale: element.scaleValue }
              ]
            }
          ]}
        />
      ))}
    </View>
  );
};

export default function ProfileScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subtitle, setSubtitle] = useState('CS Student • 3rd Year • Stanford University');
  const [tempSubtitle, setTempSubtitle] = useState('');
  const [domainMail, setDomainMail] = useState('');
  const [tempDomainMail, setTempDomainMail] = useState('');
  const [name, setName] = useState('Alex Rivera');
  const [tempName, setTempName] = useState('');
  const [about, setAbout] = useState('');
  const [tempAbout, setTempAbout] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [resumeFileName, setResumeFileName] = useState('Alex_Rivera_C...');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [socialLinksModalVisible, setSocialLinksModalVisible] = useState(false);
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [tempSocialLinks, setTempSocialLinks] = useState<string[]>([]);
  const [newSocialLink, setNewSocialLink] = useState('');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  const [avatarPulse, setAvatarPulse] = useState(false);
  const [avatarGlowScale] = useState(new Animated.Value(1));
  const [rippleScale, setRippleScale] = useState(new Animated.Value(0));
  const [textOpacity, setTextOpacity] = useState(new Animated.Value(0));
  const [textTranslateY, setTextTranslateY] = useState(new Animated.Value(30));
  const [cardScale, setCardScale] = useState(new Animated.Value(1));
  const [cardTranslateY, setCardTranslateY] = useState(new Animated.Value(0));
  const [modalScale, setModalScale] = useState(new Animated.Value(1));
  const [downloadGlow] = useState(new Animated.Value(1));
  
  // Profile picture editing state
  const [profileImage, setProfileImage] = useState('https://picsum.photos/seed/alex/300/300');
  // Gesture refs
  const panRef = useRef(null);
  const pinchRef = useRef(null);
  
  // Social links modal animations
  const [socialLinksFadeAnim] = useState(new Animated.Value(0));
  const [socialLinksScaleAnim] = useState(new Animated.Value(0.8));
  
  // Move all refs and hooks outside of map functions
  const skillAnimationsRef = useRef<{ [key: number]: { opacity: Animated.Value; scale: Animated.Value } }>({});
  const barAnimationsRef = useRef<{ [key: number]: Animated.Value }>({});
  const profileGlowRef = useRef(new Animated.Value(0)).current;
  const profileScaleRef = useRef(new Animated.Value(0.95)).current;
  
  const scrollDetection = useScrollDetection();
  const questionsCount = useCountUp(128, 2200, 0, 300);
  const answersCount = useCountUp(4200, 2200, 0, 400);
  const reputationProgress = useProgressAnimation(82, 2500, 200);

  // Beautiful subtle avatar shimmer animation
  useEffect(() => {
    setIsLoaded(true);
    
    // Subtle shimmer effect
    const startShimmer = () => {
      setAvatarPulse(true);
      
      // Very subtle shimmer: scale 1 → 1.05 → 1
      Animated.sequence([
        Animated.timing(avatarGlowScale, {
          toValue: 1.05,
          duration: 4000, // Slower, more elegant
          useNativeDriver: true,
        }),
        Animated.timing(avatarGlowScale, {
          toValue: 1,
          duration: 4000, // Slower return
          useNativeDriver: true,
        })
      ]).start(() => {
        setTimeout(() => setAvatarPulse(false), 300);
      });
    };
    
    // Initial delay then loop every 12 seconds (very subtle)
    const initialTimer = setTimeout(startShimmer, 2000);
    const shimmerInterval = setInterval(startShimmer, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(shimmerInterval);
    };
  }, []);
  
  // Beautiful profile entrance animation
  useEffect(() => {
    if (isLoaded) {
      // Gentle scale and glow entrance
      Animated.parallel([
        Animated.timing(profileScaleRef, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(profileGlowRef, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isLoaded]);
  
  // Initialize animations for skills
  useEffect(() => {
    if (scrollDetection.isVisible) {
      (skills || []).forEach((skill, index) => {
        if (!skillAnimationsRef.current[index]) {
          skillAnimationsRef.current[index] = {
            opacity: new Animated.Value(0),
            scale: new Animated.Value(0.8)
          };
        }
        
        const { opacity, scale } = skillAnimationsRef.current[index];
        const delay = index * 100;
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              tension: 40,
              friction: 7,
              useNativeDriver: true,
            })
          ]).start();
        }, delay);
      });
    }
  }, [scrollDetection.isVisible, skills]);
  

  // Ultra-smooth text entrance animation
  useEffect(() => {
    if (isLoaded) {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800, // Longer for smoother fade
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800, // Longer for smoother movement
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isLoaded]);

  // Ultra-smooth card lift interaction
  const handleCardPressIn = () => {
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1.02, // Reduced for smoother effect
        duration: 300, // Longer duration
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: -6, // Reduced lift
        duration: 300, // Longer duration
        useNativeDriver: true,
      })
    ]).start();
  };

  const resetCardAnimations = () => {
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardPressOut = () => {
    Animated.parallel([
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 400, // Even slower return
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 400, // Even slower return
        useNativeDriver: true,
      })
    ]).start();
  };

  // Enhanced avatar ripple effect
  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.timing(rippleScale, {
        toValue: 2.0, // Increased ripple radius
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(rippleScale, {
        toValue: 0,
        duration: 400, // Smoother fade-out
        useNativeDriver: true,
      })
    ]).start();
  };

  // Optimized download button glow pulse
  useEffect(() => {
    if (scrollDetection.isVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(downloadGlow, {
            toValue: 1.05, // Reduced glow
            duration: 2500, // Slower pulse
            useNativeDriver: true,
          }),
          Animated.timing(downloadGlow, {
            toValue: 1,
            duration: 2500, // Slower pulse
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [scrollDetection.isVisible, downloadGlow]);

  // Initialize animations for skills
  useEffect(() => {
    if (scrollDetection.isVisible) {
      (skills || []).forEach((skill, index) => {
        if (!skillAnimationsRef.current[index]) {
          skillAnimationsRef.current[index] = {
            opacity: new Animated.Value(0),
            scale: new Animated.Value(0.9)
          };
        }
        
        const { opacity, scale } = skillAnimationsRef.current[index];
        const delay = index * 150;
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              tension: 60,
              friction: 8,
              useNativeDriver: true,
            })
          ]).start();
        }, delay);
      });
    }
  }, [scrollDetection.isVisible, skills]);
  
  // Initialize animations for weekly activity bars
  useEffect(() => {
    if (scrollDetection.isVisible) {
      [1, 1, 1, 1, 1, 1, 1].forEach((targetHeight, index) => {
        if (!barAnimationsRef.current[index]) {
          barAnimationsRef.current[index] = new Animated.Value(0);
        }
        
        const barHeight = barAnimationsRef.current[index];
        const delay = index * 150;
        setTimeout(() => {
          Animated.timing(barHeight, {
            toValue: targetHeight,
            duration: 800,
            useNativeDriver: false,
          }).start();
        }, delay);
      });
    }
  }, [scrollDetection.isVisible]);

  // Modal animation functions
  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateModalOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetCardAnimations(); // Reset card animations after modal closes
      if (callback) callback();
    });
  };

  // Social links modal animation functions
  const animateSocialLinksModalIn = () => {
    Animated.parallel([
      Animated.timing(socialLinksFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(socialLinksScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateSocialLinksModalOut = (callback) => {
    Animated.parallel([
      Animated.timing(socialLinksFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(socialLinksScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleSave = () => {
    // Validate email domain
    const email = tempDomainMail.trim();
    if (email && !email.endsWith('@vitbhopal.ac.in')) {
      Alert.alert('Invalid Email', 'Please enter an email address with @vitbhopal.ac.in domain');
      return;
    }
    
    animateModalOut(() => {
      setName(tempName.trim() || name);
      setDomainMail(email);
      setModalVisible(false);
    });
  };

  const handleCancel = () => {
    animateModalOut(() => {
      setModalVisible(false);
    });
  };

  const handleResumeUpload = async () => {
    try {
      const result = await pick({
        type: ['application/pdf'],
        allowMultiSelection: false,
        mode: 'open',
        copyTo: 'cachesDirectory',
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        // Check file size (10MB limit)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a PDF file smaller than 10MB.');
          return;
        }

        // Set selected file for preview (don't save yet)
        setSelectedFile(file);
      }
    } catch (error: any) {
      if (error.message === 'User cancelled document picker') {
        // User cancelled, do nothing
        return;
      }
      
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const handleSaveResume = () => {
    if (selectedFile) {
      // Save the selected file to the actual resume state
      setResumeFile(selectedFile);
      setResumeFileName(selectedFile.name || 'Resume.pdf');
      
      // Clear selected file and close modal
      setSelectedFile(null);
      setResumeModalVisible(false);
      
      // Show success message
      setSuccessMessage('Resume uploaded successfully!');
      setSuccessModalVisible(true);
    }
  };

  const handleResumeEdit = () => {
    setResumeModalVisible(true);
  };

  const handleViewResume = async () => {
    if (resumeFile && resumeFile.uri) {
      try {
        await Linking.openURL(resumeFile.uri);
      } catch (error) {
        console.error('Error opening file:', error);
        Alert.alert('Error', 'Unable to open the file. Please try again.');
      }
    } else {
      Alert.alert('No File', 'Please add a resume first.');
    }
  };

  const handleResumeModalClose = () => {
    setResumeModalVisible(false);
    setSelectedFile(null);
  };

  const getSocialIcon = (url: string) => {
    if (url.includes('instagram')) return <Instagram size={20} color="#1b3a6d" />;
    if (url.includes('linkedin')) return <Linkedin size={20} color="#1b3a6d" />;
    if (url.includes('github')) return <Github size={20} color="#1b3a6d" />;
    if (url.includes('twitter') || url.includes('x.com')) return <Twitter size={20} color="#1b3a6d" />;
    return <Globe size={20} color="#1b3a6d" />;
  };

  const getSocialName = (url: string) => {
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('linkedin')) return 'LinkedIn';
    if (url.includes('github')) return 'GitHub';
    if (url.includes('twitter') || url.includes('x.com')) return 'Twitter';
    return 'Website';
  };

  const getSocialHandle = (url: string) => {
    const cleanUrl = url.replace(/^https?:\/\//, '');
    const parts = cleanUrl.split('/');
    if (parts.length > 1) {
      const handle = parts[parts.length - 1];
      return (getSocialName(url) === 'Twitter' || getSocialName(url) === 'Instagram') ? `@${handle}` : handle;
    }
    return cleanUrl;
  };

  const addSocialLink = () => {
    if (newSocialLink.trim() && tempSocialLinks.length < 10) {
      setTempSocialLinks([...tempSocialLinks, newSocialLink.trim()]);
      setNewSocialLink('');
    }
  };

  const removeSocialLink = (index: number) => {
    setTempSocialLinks(tempSocialLinks.filter((_, i) => i !== index));
  };

  const handleSocialLinksEdit = () => {
    try {
      console.log('Opening social links modal');
      setTempSocialLinks([...socialLinks]);
      setSocialLinksModalVisible(true);
      
      // Small delay to ensure modal is visible before animation
      setTimeout(() => {
        animateSocialLinksModalIn();
      }, 50);
    } catch (error) {
      console.error('Error opening social links modal:', error);
      // Fallback: open modal without animation
      setTempSocialLinks([...socialLinks]);
      setSocialLinksModalVisible(true);
    }
  };

  const handleSocialLinksSave = () => {
    animateSocialLinksModalOut(() => {
      setSocialLinks(tempSocialLinks);
      setSocialLinksModalVisible(false);
      setSuccessMessage('Social links updated successfully!');
      setSuccessModalVisible(true);
    });
  };

  const handleSocialLinksCancel = () => {
    animateSocialLinksModalOut(() => {
      setSocialLinksModalVisible(false);
    });
  };

  const handleAboutSave = () => {
    animateModalOut(() => {
      setAbout(tempAbout.trim() || about);
      setAboutModalVisible(false);
    });
  };

  const handleAboutCancel = () => {
    animateModalOut(() => {
      setAboutModalVisible(false);
    });
  };

  const openAboutModal = () => {
    setTempAbout(about);
    setAboutModalVisible(true);
    animateModalIn();
  };

  const handleSkillsSave = () => {
    animateModalOut(() => {
      setSkills((tempSkills || []).filter(skill => skill.trim() !== ''));
      setSkillsModalVisible(false);
    });
  };

  const handleSkillsCancel = () => {
    animateModalOut(() => {
      setSkillsModalVisible(false);
    });
  };

  const openSkillsModal = () => {
    setTempSkills([...(skills || [])]);
    setSkillsModalVisible(true);
    animateModalIn();
  };

  // Profile picture editing handlers
  const handleEditProfilePicture = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
      cropperToolbarTitle: 'Crop Profile Picture',
      includeBase64: false,
      compressImageQuality: 0.8,
    })
      .then((image) => {
        setProfileImage(image.path);
        setSuccessMessage('Profile picture updated successfully!');
        setSuccessModalVisible(true);
      })
      .catch((error) => {
        console.log('ImagePicker Error: ', error);
        // User cancelled or error occurred
      });
  };


  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    // Navigate to login screen
    // You may need to replace this with your navigation logic
    console.log('Logging out...');
    // For example: navigation.replace('Login');
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && tempSkills && tempSkills.length < 10) {
      setTempSkills([...(tempSkills || []), newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    if (tempSkills) {
      setTempSkills(tempSkills.filter((_, i) => i !== index));
    }
  };

  return (
    <>
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onScroll={scrollDetection.handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.appContainer}>
        {/* Top Header Section with Gradient and Pattern */}
        <View style={styles.headerSection}>
          {/* Ambient Background Motion Layer */}
          <AmbientBackground />
          
          {/* Subtle Background Pattern */}
          <View style={styles.backgroundPattern} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => {
                setTempName(name);
                setTempDomainMail(domainMail);
                setModalVisible(true);
                animateModalIn();
              }}
            >
              <Icon name="pencil" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Picture Area with Glow Pulse */}
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={handleAvatarPress}
            activeOpacity={0.9}
          >
            <Animated.View style={{
              transform: [
                { scale: profileScaleRef }
              ]
            }}>
              <View>
                <Animated.View 
                  style={[
                    styles.animatedBorder,
                    {
                      transform: [{ scale: avatarGlowScale }],
                      opacity: avatarPulse ? 0.8 : 0.3,
                    }
                  ]}
                />
                <View style={styles.profileImageWrapper}>
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage}
                    resizeMode="cover"
                    defaultSource={{ uri: 'https://picsum.photos/seed/alex/300/300' }}
                  />
                </View>
                
                {/* Edit Profile Picture Button */}
                <TouchableOpacity 
                  style={styles.editProfileButton}
                  onPress={handleEditProfilePicture}
                  activeOpacity={0.8}
                >
                  <Edit3 size={16} color="white" />
                </TouchableOpacity>
                
                {/* Ripple Effect */}
                <Animated.View 
                  style={[
                    styles.rippleEffect,
                    {
                      transform: [{ scale: rippleScale }],
                      opacity: rippleScale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 0],
                      })
                    }
                  ]}
                />
              </View>
              
              {/* Ripple Effect */}
              <Animated.View 
                style={[
                  styles.rippleEffect,
                  {
                    transform: [{ scale: rippleScale }],
                    opacity: rippleScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 0],
                    })
                  }
                ]}
              />
          </Animated.View>
          </TouchableOpacity>

          {/* User Info with Entrance Animation */}
          <Animated.View style={styles.userInfo}>
            <Animated.Text 
              style={[
                styles.userName,
                {
                  opacity: textOpacity,
                  transform: [{ translateY: textTranslateY }]
                }
              ]}
            >
              {name}
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.userSubtitle,
                {
                  opacity: textOpacity,
                  transform: [{ translateY: textTranslateY }]
                }
              ]}
            >
              {domainMail || 'Add your domain mail'}
            </Animated.Text>
          </Animated.View>

          {/* Stats Cards with Lift Animation */}
          <View style={styles.statsContainer}>
            {/* Questions Card */}
            <TouchableOpacity 
              style={[
                styles.statCard,
                {
                  transform: [{ scale: cardScale }, { translateY: cardTranslateY }]
                }
              ]}
              onPressIn={handleCardPressIn}
              onPressOut={handleCardPressOut}
            >
              <View style={styles.statIconContainer}>
                <View style={styles.statIconBg}>
                  <HelpCircle size={20} color="#1b3a6d" />
                </View>
              </View>
              <View style={{ marginTop: 12 }}>
                <Animated.Text 
                  style={[
                    styles.statNumber,
                    {
                      transform: [{ scale: questionsCount.scaleValue }]
                    }
                  ]}
                >
                  {questionsCount.count}
                </Animated.Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
            </TouchableOpacity>

            {/* Answers Card */}
            <TouchableOpacity 
              style={[
                styles.statCard,
                {
                  transform: [{ scale: cardScale }, { translateY: cardTranslateY }]
                }
              ]}
              onPressIn={handleCardPressIn}
              onPressOut={handleCardPressOut}
            >
              <View style={styles.statIconContainer}>
                <MessageSquare size={30} color="#6366f1" />
              </View>
              <View style={{ marginTop: 12 }}>
                <Animated.Text 
                  style={[
                    styles.statNumber,
                    {
                      transform: [{ scale: answersCount.scaleValue }]
                    }
                  ]}
                >
                  {answersCount.count}
                </Animated.Text>
                <Text style={styles.statLabel}>Answers</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* About Section */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>About</Text>
              <TouchableOpacity onPress={openAboutModal}>
                <Icon name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.aboutText}>
              {about || 'Add Something About Yourself'}
            </Text>
          </View>

          {/* Top Skills Section */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Top Skills</Text>
              <TouchableOpacity onPress={openSkillsModal}>
                <Icon name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              minHeight: (skills || []).length > 0 ? Math.ceil((skills || []).length / 3) * 60 : 60,
              padding: (skills || []).length > 0 ? 16 : 8,
              backgroundColor: (skills || []).length === 0 ? '#f8fafc' : 'transparent',
              borderRadius: 12,
              borderWidth: (skills || []).length === 0 ? 1 : 0,
              borderColor: (skills || []).length === 0 ? '#e2e8f0' : 'transparent',
              borderStyle: 'dashed'
            }}>
              {(skills || []).length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                    No skills added yet. Tap the pencil icon to add your first skill!
                  </Text>
                </View>
              ) : (
                (skills || []).map((skill, index) => {
                  const animations = skillAnimationsRef.current[index] || { opacity: new Animated.Value(1), scale: new Animated.Value(1) };
                  return (
                    <Animated.Text 
                      key={skill} 
                      style={[
                        styles.skillTag,
                        {
                          opacity: animations.opacity,
                          transform: [{ scale: animations.scale }],
                          shadowColor: '#6366f1',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      ]}
                    >
                      {skill}
                    </Animated.Text>
                  );
                }))}
            </View>
          </View>

          {/* Weekly Activity Chart */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, marginTop: 20 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                const targetHeight = [40, 65, 45, 80, 55, 30, 25][index];
                const barHeight = barAnimationsRef.current[index] || new Animated.Value(1);
                
                return (
                  <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                    <Animated.View 
                      style={{
                        backgroundColor: '#f1f5f9',
                        width: '100%',
                        height: 120,
                        borderRadius: 12,
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        padding: 8,
                        transform: [{ scale: 0.95 }]
                      }}
                    >
                      <Animated.View 
                        style={{
                          width: '100%',
                          height: barHeight,
                          backgroundColor: '#3bc4ba',
                          borderRadius: 8,
                          shadowColor: '#3bc4ba',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                        }}
                      />
                    </Animated.View>
                    <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Professional Assets */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Professional Assets</Text>
              <TouchableOpacity onPress={handleResumeEdit}>
                <Icon name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {/* PDF Document Card */}
            <Animated.View 
              style={[
                styles.assetContainer,
                {
                  opacity: scrollDetection.isVisible ? 1 : 0,
                  transform: [{ translateX: scrollDetection.isVisible ? 0 : -50 }],
                  backgroundColor: scrollDetection.isVisible ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
                  position: 'relative'
                }
              ]}
            >
              <View style={styles.assetIconContainer}>
                <View style={{ alignItems: 'center' }}>
                  <FileText size={20} color="#1b3a6d" />
                  <Text style={{ fontSize: 8, fontWeight: '600', color: '#1b3a6d', marginTop: 2 }}>PDF</Text>
                </View>
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetTitle}>{resumeFile ? resumeFileName : 'Add your resume'}</Text>
                <Text style={styles.userSubtitle}>
                  {domainMail || 'Add your domain mail'}
                </Text>
              </View>
              <View style={styles.assetActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleViewResume}>
                  <Eye size={16} color="#94a3b8" />
                </TouchableOpacity>
                {resumeFile && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}
                    onPress={() => {
                      Alert.alert('File Info', `File: ${resumeFile.name}\nSize: ${Math.round((resumeFile.size || 0) / 1024)} KB\nType: ${resumeFile.type || 'PDF'}`);
                    }}
                  >
                    <Icon name="info" size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>

          {/* Published Posts */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Published Posts</Text>
            </View>
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemContent}>
                <View style={styles.listItemIconContainer}>
                  <LayoutGrid size={20} color="#1b3a6d" />
                </View>
                <Text style={styles.listItemText}>View all posts</Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.listItemBadge}>0</Text>
                <ChevronRight size={16} color="#e2e8f0" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Saved Knowledge */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Saved Knowledge</Text>
            </View>
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemContent}>
                <View style={styles.listItemIconContainer}>
                  <Bookmark size={20} color="#1b3a6d" />
                </View>
                <Text style={styles.listItemText}>View saved items</Text>
              </View>
              <View style={styles.listItemRight}>
                <ChevronRight size={16} color="#e2e8f0" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View style={styles.card}>
            <View style={styles.cardGradient} />
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              <TouchableOpacity 
                onPress={handleSocialLinksEdit}
                style={{ 
                  backgroundColor: '#f8fafc',
                  borderRadius: 20,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  minWidth: 36,
                  minHeight: 36,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {/* Social Links List */}
            <View style={{ marginTop: 8 }}>
              {socialLinks.length > 0 ? (
                socialLinks.map((link, index) => (
                  <TouchableOpacity key={index} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <View style={styles.listItemIconContainer}>
                        {getSocialIcon(link)}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemText}>{getSocialName(link)}</Text>
                        <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {getSocialHandle(link)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.listItemRight}>
                      <ChevronRight size={16} color="#e2e8f0" />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ 
                  alignItems: 'center', 
                  paddingVertical: 24,
                  opacity: 0.6 
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#94a3b8',
                    textAlign: 'center' 
                  }}>
                    No social links added yet
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#cbd5e1',
                    textAlign: 'center',
                    marginTop: 4 
                  }}>
                    Tap the pencil icon to add your social profiles
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={{ paddingHorizontal: 24 }}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      </ScrollView>
      
      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} transparent={true}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <View>
              <Text style={styles.modalLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                maxLength={30}
                autoFocus
              />
              
              <Text style={styles.modalLabel}>Domain Mail</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={tempDomainMail}
                onChangeText={setTempDomainMail}
                placeholder="Enter your @vitbhopal.ac.in email"
                placeholderTextColor="#94a3b8"
                multiline
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      
      {/* Edit About Modal */}
      <Modal visible={aboutModalVisible} transparent>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.modalTitle}>Edit About</Text>
            
            <View>
              <Text style={styles.modalLabel}>About</Text>
              <TextInput
                style={styles.aboutInput}
                value={tempAbout}
                onChangeText={setTempAbout}
                placeholder="Write about yourself (max 100 words)"
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={500}
                autoFocus
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleAboutCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAboutSave}
              >
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      
      {/* Edit Skills Modal */}
      <Modal visible={skillsModalVisible} transparent>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.modalTitle}>Edit Skills</Text>
            
            <View style={styles.skillsModalContent}>
              <Text style={styles.modalLabel}>Your Skills ({(tempSkills || []).length}/10)</Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {(tempSkills || []).map((skill, index) => (
                  <View key={index} style={styles.skillItem}>
                    <Text style={styles.skillItemText}>{skill}</Text>
                    <TouchableOpacity 
                      style={styles.removeSkillButton}
                      onPress={() => removeSkill(index)}
                    >
                      <Icon name="times" size={12} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              
              {(tempSkills || []).length < 10 && (
                <View style={styles.addSkillContainer}>
                  <TextInput
                    style={styles.addSkillInput}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="Add new skill"
                    placeholderTextColor="#94a3b8"
                    onSubmitEditing={addSkill}
                  />
                  <TouchableOpacity 
                    style={styles.addSkillButton}
                    onPress={addSkill}
                  >
                    <Text style={styles.addSkillButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={styles.skillsCount}>
                {(tempSkills || []).length >= 10 ? 'Maximum 10 skills reached' : `${10 - (tempSkills || []).length} more skills can be added`}
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleSkillsCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSkillsSave}
              >
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Resume Upload Modal */}
      <Modal visible={resumeModalVisible} transparent={true}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Upload Resume</Text>
            
            <View>
              <Text style={styles.modalLabel}>Select a PDF file to upload as your resume</Text>
              
              {!selectedFile ? (
                <View style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#e2e8f0',
                  borderStyle: 'dashed',
                  padding: 32,
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                  <FileText size={48} color="#94a3b8" />
                  <Text style={{
                    fontSize: 16,
                    color: '#64748b',
                    marginTop: 12,
                    textAlign: 'center',
                  }}>
                    Click "Choose File" to select your resume
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    marginTop: 4,
                  }}>
                    PDF files only (Max 10MB)
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: '#eff6ff',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#3bc4ba',
                  padding: 20,
                  marginBottom: 20,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{
                      backgroundColor: '#1b3a6d',
                      padding: 12,
                      borderRadius: 8,
                      marginRight: 16,
                    }}>
                      <FileText size={24} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: 4,
                      }}>
                        {selectedFile.name}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#64748b',
                      }}>
                        PDF • {Math.round((selectedFile.size || 0) / 1024)} KB
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    backgroundColor: '#dcfce7',
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      fontSize: 14,
                      color: '#166534',
                      fontWeight: '500',
                    }}>
                      ✓ File selected and ready to upload
                    </Text>
                  </View>
                </View>
              )}
            </View>
            
            <View style={styles.resumeModalButtons}>
              <TouchableOpacity 
                style={[styles.resumeModalButton, styles.resumeCancelButton]}
                onPress={handleResumeModalClose}
              >
                <Text style={styles.resumeCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.resumeModalButton, 
                  selectedFile ? styles.resumeUploadButton : styles.resumeUploadButton,
                  !selectedFile && { opacity: 0.8 }
                ]}
                onPress={selectedFile ? handleSaveResume : handleResumeUpload}
              >
                <Text style={styles.resumeUploadButtonText}>
                  {selectedFile ? 'Save Resume' : 'Choose File'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Social Links Modal */}
      <Modal visible={socialLinksModalVisible} transparent={true}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: socialLinksFadeAnim
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: socialLinksScaleAnim }],
              }
            ]}
          >
          <Text style={styles.modalTitle}>Edit Social Links</Text>
          
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.modalLabel}>Add your social media profiles</Text>
            
            <ScrollView style={styles.skillsModalContent} showsVerticalScrollIndicator={false}>
              {tempSocialLinks.map((link, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillItemText}>{link}</Text>
                  <TouchableOpacity 
                    style={styles.removeSkillButton}
                    onPress={() => removeSocialLink(index)}
                  >
                    <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {tempSocialLinks.length < 10 && (
                <View style={styles.addSkillContainer}>
                  <TextInput
                    style={styles.addSkillInput}
                    value={newSocialLink}
                    onChangeText={setNewSocialLink}
                    placeholder="Add social link (e.g., https://instagram.com/username)"
                    placeholderTextColor="#94a3b8"
                    onSubmitEditing={addSocialLink}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <TouchableOpacity 
                    style={styles.addSkillButton}
                    onPress={addSocialLink}
                  >
                    <Text style={styles.addSkillButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <Text style={styles.skillsCount}>
                {tempSocialLinks.length}/10 social links
              </Text>
            </ScrollView>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleSocialLinksCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSocialLinksSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </Animated.View>
      </Modal>

      
      {/* Custom Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelLogout}
      >
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                backgroundColor: '#fee2e2',
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <LogOut size={28} color="#ef4444" />
              </View>
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={{
                fontSize: 16,
                color: '#64748b',
                textAlign: 'center',
                lineHeight: 24,
                marginTop: 8,
              }}>
                Are you sure you want to logout?
              </Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelLogout}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, {
                  backgroundColor: '#ef4444',
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                }]}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.saveButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Success Modal */}
      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        message={successMessage}
      />
    </>
  );
}