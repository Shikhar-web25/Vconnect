/**
 * Animation Utilities for React Native
 * 
 * Reusable animation helpers and common animation patterns
 */

import { Animated, Easing } from 'react-native';

/**
 * Fade In Animation
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.ease,
  });
};

/**
 * Fade Out Animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.ease,
  });
};

/**
 * Slide In From Bottom
 */
export const slideInFromBottom = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Slide In From Top
 */
export const slideInFromTop = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Slide In From Left
 */
export const slideInFromLeft = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Slide In From Right
 */
export const slideInFromRight = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  });
};

/**
 * Scale In Animation (pop effect)
 */
export const scaleIn = (
  animatedValue: Animated.Value,
  duration: number = 500,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    friction: 6,
    tension: 40,
    delay,
    useNativeDriver: true,
  });
};

/**
 * Scale Out Animation
 */
export const scaleOut = (
  animatedValue: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    useNativeDriver: true,
    easing: Easing.in(Easing.cubic),
  });
};

/**
 * Pulse Animation (heartbeat effect)
 */
export const pulse = (
  animatedValue: Animated.Value,
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxScale,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(animatedValue, {
        toValue: minScale,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ])
  );
};

/**
 * Shake Animation (for errors)
 */
export const shake = (
  animatedValue: Animated.Value,
  duration: number = 500
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: duration / 8,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration / 2,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Rotate Animation (360 degrees)
 */
export const rotate360 = (
  animatedValue: Animated.Value,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    })
  );
};

/**
 * Bounce Animation
 */
export const bounce = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  friction: number = 4
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    friction,
    tension: 40,
    useNativeDriver: true,
  });
};

/**
 * Stagger Animation (for lists)
 */
export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  return Animated.stagger(staggerDelay, animations);
};

/**
 * Parallel Animation
 */
export const parallelAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * Sequence Animation
 */
export const sequenceAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Card Flip Animation
 */
export const cardFlip = (
  animatedValue: Animated.Value,
  duration: number = 600
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
    easing: Easing.inOut(Easing.ease),
  });
};

/**
 * Elastic Animation
 */
export const elastic = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = 800
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.elastic(1),
  });
};

/**
 * Wiggle Animation (side to side)
 */
export const wiggle = (
  animatedValue: Animated.Value,
  amount: number = 5,
  duration: number = 100
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: amount,
      duration,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -amount,
      duration: duration * 2,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: amount,
      duration: duration * 2,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Entrance Animation Preset
 * Combines fade in, slide up, and scale
 */
export const entranceAnimation = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  scaleValue: Animated.Value,
  duration: number = 600,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.parallel([
    fadeIn(fadeValue, duration, delay),
    slideInFromBottom(slideValue, duration, delay),
    scaleIn(scaleValue, duration, delay),
  ]);
};

/**
 * Exit Animation Preset
 */
export const exitAnimation = (
  fadeValue: Animated.Value,
  scaleValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.parallel([
    fadeOut(fadeValue, duration),
    scaleOut(scaleValue, duration),
  ]);
};

/**
 * Loading Pulse Animation
 */
export const loadingPulse = (
  animatedValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ])
  );
};

/**
 * Get rotation interpolation
 */
export const getRotationInterpolation = (
  animatedValue: Animated.Value
): Animated.AnimatedInterpolation<string | number> => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

/**
 * Get opacity interpolation
 */
export const getOpacityInterpolation = (
  animatedValue: Animated.Value,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1]
): Animated.AnimatedInterpolation<string | number> => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};

/**
 * Get scale interpolation
 */
export const getScaleInterpolation = (
  animatedValue: Animated.Value,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [0, 1]
): Animated.AnimatedInterpolation<string | number> => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};

/**
 * Animation Presets Object
 */
export const AnimationPresets = {
  // Timing presets
  quick: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
  verySlow: { duration: 800 },
  
  // Easing presets
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  linear: Easing.linear,
  elastic: Easing.elastic(1),
  bounce: Easing.bounce,
  
  // Spring presets
  gentleSpring: { friction: 8, tension: 40 },
  bouncySpring: { friction: 4, tension: 40 },
  stiffSpring: { friction: 10, tension: 80 },
};

export default {
  fadeIn,
  fadeOut,
  slideInFromBottom,
  slideInFromTop,
  slideInFromLeft,
  slideInFromRight,
  scaleIn,
  scaleOut,
  pulse,
  shake,
  rotate360,
  bounce,
  staggerAnimation,
  parallelAnimation,
  sequenceAnimation,
  cardFlip,
  elastic,
  wiggle,
  entranceAnimation,
  exitAnimation,
  loadingPulse,
  getRotationInterpolation,
  getOpacityInterpolation,
  getScaleInterpolation,
  AnimationPresets,
};
