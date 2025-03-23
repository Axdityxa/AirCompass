import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';

// Types for community data
interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  aqi: number;
  text: string;
  image?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
}

// Mock data generator
const generateMockData = (): Post[] => {
  return [
    {
      id: '1',
      userId: 'user1',
      userName: 'Alex Johnson',
      userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'Delhi, India',
      aqi: 156,
      text: 'Air quality getting worse in Delhi today. Everyone please wear masks when going outside.',
      image: 'https://images.unsplash.com/photo-1573747806413-9fc1bb48cd88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1050&q=80',
      likes: 24,
      comments: [
        {
          id: 'c1',
          userId: 'user2',
          userName: 'Priya Sharma',
          userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          text: 'Thanks for the reminder! Just checked my AQI app and it shows 160 in my area.',
          createdAt: '2023-03-22T13:45:30Z'
        }
      ],
      createdAt: '2023-03-22T10:30:00Z',
      isLiked: false
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'Rahul Kapoor',
      userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      location: 'Mumbai, India',
      aqi: 82,
      text: 'Moderate air quality in Mumbai today. Much better than last week!',
      likes: 18,
      comments: [],
      createdAt: '2023-03-22T09:15:00Z',
      isLiked: true
    },
    {
      id: '3',
      userId: 'user4',
      userName: 'Deepika Patel',
      userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      location: 'Bangalore, India',
      aqi: 45,
      text: 'Air quality is good in Bangalore today! Perfect day for outdoor activities.',
      image: 'https://images.unsplash.com/photo-1601118964938-228a89955311?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      likes: 32,
      comments: [
        {
          id: 'c2',
          userId: 'user5',
          userName: 'Vikram Singh',
          userAvatar: 'https://randomuser.me/api/portraits/men/36.jpg',
          text: 'Wish we had the same here in Chennai!',
          createdAt: '2023-03-22T11:20:10Z'
        },
        {
          id: 'c3',
          userId: 'user1',
          userName: 'Alex Johnson',
          userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          text: 'Enjoy your clean air!',
          createdAt: '2023-03-22T12:05:45Z'
        }
      ],
      createdAt: '2023-03-22T08:00:00Z',
      isLiked: false
    },
    {
      id: '4',
      userId: 'user6',
      userName: 'Anika Gupta',
      userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      location: 'Kolkata, India',
      aqi: 110,
      text: 'Started using my air purifier today as AQI crossed 100. Has anyone tried the new HEPA filters?',
      likes: 9,
      comments: [],
      createdAt: '2023-03-21T22:45:00Z',
      isLiked: false
    },
    {
      id: '5',
      userId: 'user7',
      userName: 'Arjun Mehta',
      userAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      location: 'Chennai, India',
      aqi: 75,
      text: "Just joined the local clean air initiative. We're organizing a tree planting drive next weekend!",
      likes: 41,
      comments: [
        {
          id: 'c4',
          userId: 'user8',
          userName: 'Neha Reddy',
          userAvatar: 'https://randomuser.me/api/portraits/women/28.jpg',
          text: 'How can I join?',
          createdAt: '2023-03-22T07:30:20Z'
        }
      ],
      createdAt: '2023-03-21T20:30:00Z',
      isLiked: true
    }
  ];
};

// Function to get AQI color
const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return '#4CAF50'; // Good - Green
  if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
  if (aqi <= 150) return '#FF9800'; // Unhealthy for Sensitive Groups - Orange
  if (aqi <= 200) return '#F44336'; // Unhealthy - Red
  if (aqi <= 300) return '#9C27B0'; // Very Unhealthy - Purple
  return '#7D0023'; // Hazardous - Maroon
};

// Format date to a friendly string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function CommunityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<string>('');
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>('');

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Simulate fetching posts from an API
  const fetchPosts = () => {
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setPosts(generateMockData());
      setIsLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  // Handle post like
  const handleLike = (postId: string) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      })
    );
  };

  // Toggle comment section visibility
  const toggleComments = (postId: string) => {
    setExpandedComments(current => current === postId ? null : postId);
    setCommentText('');
  };

  // Add a new comment
  const addComment = (postId: string) => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: user?.id || 'guest',
      userName: user?.email?.split('@')[0] || 'Guest User',
      userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email?.split('@')[0] || 'Guest')}&background=random`,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );

    setCommentText('');
  };

  // Create a new post
  const createPost = () => {
    if (!newPost.trim()) return;

    const newPostObj: Post = {
      id: `p${Date.now()}`,
      userId: user?.id || 'guest',
      userName: user?.email?.split('@')[0] || 'Guest User',
      userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email?.split('@')[0] || 'Guest')}&background=random`,
      location: 'Your Location',
      aqi: 75, // Default AQI value
      text: newPost.trim(),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      isLiked: false
    };

    setPosts(currentPosts => [newPostObj, ...currentPosts]);
    setNewPost('');
  };

  // Render an individual post
  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text style={styles.locationText}>{item.location}</Text>
              <View style={[
                styles.aqiBadge, 
                { backgroundColor: getAqiColor(item.aqi) }
              ]}>
                <Text style={styles.aqiText}>AQI {item.aqi}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.postText}>{item.text}</Text>
      
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? "#F43F5E" : "#6B7280"} 
          />
          <Text style={[
            styles.actionText, 
            item.isLiked && {color: "#F43F5E"}
          ]}>
            {item.likes} {item.likes === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleComments(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>
            {item.comments.length} {item.comments.length === 1 ? 'Comment' : 'Comments'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {expandedComments === item.id && (
        <View style={styles.commentsSection}>
          {item.comments.length > 0 ? (
            item.comments.map(comment => (
              <View key={comment.id} style={styles.commentContainer}>
                <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>{comment.userName}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTimestamp}>{formatDate(comment.createdAt)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
          )}

          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !commentText.trim() && styles.sendButtonDisabled
              ]}
              onPress={() => addComment(item.id)}
              disabled={!commentText.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color="#1E88E5" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={styles.loadingText}>Loading community posts...</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* New post input */}
        <View style={styles.newPostContainer}>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <View style={styles.inputContainer}>
              <Image 
                source={{ 
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email?.split('@')[0] || 'User')}&background=random`
                }} 
                style={styles.userAvatar} 
              />
              <TextInput
                style={styles.postInput}
                placeholder="Share your air quality experience..."
                value={newPost}
                onChangeText={setNewPost}
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.postButton,
                  !newPost.trim() && styles.postButtonDisabled
                ]}
                onPress={createPost}
                disabled={!newPost.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 8,
  },
  aqiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aqiText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1E88E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  newPostContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 120,
  },
  postButton: {
    backgroundColor: '#1E88E5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
  }
}); 