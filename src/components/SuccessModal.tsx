import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Check } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose, message }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        <Animated.View
          style={{
            backgroundColor: 'linear-gradient(135deg, #1b3a6d, #2d5a9e)',
            width: screenWidth * 0.85,
            maxWidth: 320,
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
            borderWidth: 1,
            borderColor: 'rgba(59, 196, 186, 0.3)',
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          }}
        >
          {/* Success Icon with Glow */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(59, 196, 186, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 2,
              borderColor: '#3bc4ba',
              shadowColor: '#3bc4ba',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Check size={40} color="#3bc4ba" strokeWidth={3} />
          </View>

          {/* Success Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: 12,
              textAlign: 'center',
              letterSpacing: 0.5,
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            Success!
          </Text>

          {/* Success Message */}
          <Text
            style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 24,
              paddingHorizontal: 8,
            }}
          >
            {message}
          </Text>

          {/* OK Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#3bc4ba',
              paddingHorizontal: 40,
              paddingVertical: 14,
              borderRadius: 20,
              shadowColor: '#3bc4ba',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Text
              style={{
                color: '#1b3a6d',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: 0.5,
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SuccessModal;
