import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface Props {
  name: string;
  image?: string;
}

const MentorAvatar: React.FC<Props> = ({ name, image }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <Text style={styles.more}>⋯</Text>
        )}
      </View>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
};

export default MentorAvatar;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 16,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  name: {
    marginTop: 6,
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
  more: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 22,
  },
});
