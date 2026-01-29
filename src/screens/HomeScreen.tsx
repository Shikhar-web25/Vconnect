import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to Home', content: 'Your personalized feed' },
    { id: 2, title: 'Latest Updates', content: 'Check out what\'s new' },
    { id: 3, title: 'Trending Now', content: 'Popular content today' },
  ]);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderPost = (post: any, index: number) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        key={post.id}
        style={[
          styles.postCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.8}>
          <View style={styles.postHeader}>
            <View style={styles.avatar} />
            <View style={styles.postInfo}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postTime}>2h ago</Text>
            </View>
          </View>
          <Text style={styles.postContent}>{post.content}</Text>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>❤️ Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>💬 Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>🔗 Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
      >
        <Animated.View
          style={{
            opacity: scaleAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Stories Section */}
          <View style={styles.storiesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3, 4, 5].map((item) => (
                <TouchableOpacity key={item} style={styles.storyItem}>
                  <View style={styles.storyAvatar}>
                    <View style={styles.storyRing} />
                  </View>
                  <Text style={styles.storyName}>Story {item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Posts Feed */}
          <View style={styles.feed}>
            {posts.map((post, index) => renderPost(post, index))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  storiesSection: {
    paddingVertical: 15,
    paddingLeft: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  storyName: {
    fontSize: 12,
    marginTop: 5,
    color: '#333',
  },
  feed: {
    paddingHorizontal: 15,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#6366f1',
  },
  postInfo: {
    marginLeft: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;