import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  GestureResponderEvent,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type Profile = {
  id: string;
  name: string;
  field: string;
  image: string;
};

const profiles: Profile[] = [
  {
    id: "1",
    name: "Dr. Alex R.",
    field: "Data Science",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Marcus C.",
    field: "Full Stack",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "3",
    name: "Lisa K.",
    field: "UI/UX",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const AllSeniorsScreen = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  /* ================= POPUP ANIMATION ================= */

  const scale = useSharedValue(0);
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  const popupStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const openPopup = async (item: Profile) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setSelectedProfile(item);

    scale.value = withSpring(1);
    translateY.value = withSpring(0);
    opacity.value = withTiming(1, { duration: 300 });
  };

  const closePopup = () => {
    scale.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(50);
    opacity.value = withTiming(0);

    setTimeout(() => setSelectedProfile(null), 200);
  };

  /* ================= GLOW BORDER ================= */

  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  /* ================= PARTICLES ================= */

  const FloatingParticles = () => {
    const particles = Array.from({ length: 15 });

    return (
      <View style={StyleSheet.absoluteFill}>
        {particles.map((_, i) => {
          const move = useSharedValue(height);
          const left = Math.random() * width;
          const size = Math.random() * 6 + 4;

          useEffect(() => {
            move.value = withRepeat(
              withSequence(
                withTiming(-50, {
                  duration: 6000 + Math.random() * 4000,
                  easing: Easing.linear,
                }),
                withTiming(height)
              ),
              -1
            );
          }, []);

          const style = useAnimatedStyle(() => ({
            transform: [{ translateY: move.value }],
          }));

          return (
            <Animated.View
              key={i}
              style={[
                {
                  position: "absolute",
                  left,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
                style,
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={profiles}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 60 }}
        renderItem={({ item }) => {
          const rotateX = useSharedValue(0);
          const rotateY = useSharedValue(0);

          const tiltStyle = useAnimatedStyle(() => ({
            transform: [
              { perspective: 600 },
              { rotateX: `${rotateX.value}deg` },
              { rotateY: `${rotateY.value}deg` },
            ],
          }));

          const handleMove = (event: GestureResponderEvent) => {
            const { locationX, locationY } = event.nativeEvent;
            rotateY.value = (locationX - 60) / 10;
            rotateX.value = -(locationY - 60) / 10;
          };

          const resetTilt = () => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
          };

          return (
            <View
              onStartShouldSetResponder={() => true}
              onResponderMove={handleMove}
              onResponderRelease={resetTilt}
            >
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={() => openPopup(item)}
                onPressIn={() => Haptics.selectionAsync()}
              >
                <Animated.View style={[styles.card, tiltStyle]}>
                  <Image source={{ uri: item.image }} style={styles.avatar} />
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.field}>{item.field}</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {selectedProfile && (
        <View style={styles.overlay}>
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
          <FloatingParticles />

          <Animated.View style={[styles.glowWrapper, glowStyle]}>
            <LinearGradient
              colors={["#00f5ff", "#9d4edd", "#ff4ecd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <Animated.View style={[styles.glassCard, popupStyle]}>
                <Image
                  source={{ uri: selectedProfile.image }}
                  style={styles.popupImage}
                />

                <Text style={styles.popupName}>
                  {selectedProfile.name}
                </Text>

                <Text style={styles.popupField}>
                  {selectedProfile.field}
                </Text>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.viewButton}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    View Full Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closePopup}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default AllSeniorsScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4A6D8C",
  },

  card: {
    flex: 1,
    alignItems: "center",
    margin: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },

  name: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  field: {
    fontSize: 10,
    color: "#64748B",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  glowWrapper: {
    borderRadius: 32,
  },

  gradientBorder: {
    padding: 2,
    borderRadius: 32,
  },

  glassCard: {
    width: 280,
    padding: 20,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  popupImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignSelf: "center",
    marginBottom: 12,
  },

  popupName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  popupField: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 12,
  },

  viewButton: {
    backgroundColor: "#4A6D8C",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },

  closeText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 10,
  },
});