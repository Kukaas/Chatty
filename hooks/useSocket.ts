import { getCurrentUser } from '@/utils/auth';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Add isomorphic check at the top
const isBrowser = typeof window !== 'undefined';

const getSocketUrl = () => {
  if (!isBrowser) return ''; // Return empty string during SSR

  if (process.env.NODE_ENV === 'production') {
    // In production, use the current origin
    return window.location.origin;
  }

  // In development, use the environment variable or fallback
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
};

interface ChatMessage {
  _id?: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: string | Date;
  status?: 'sending' | 'sent' | 'error';
  isOwn?: boolean;
}

interface OnlineStatus {
  userId: string;
  status: 'online' | 'offline';
}

interface TypingUser {
  _id: string;
  name: string;
  avatar: string;
}

interface TypingStatus {
  userId: string;
  user: TypingUser;
  isTyping: boolean;
}

interface FriendRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  recipient: string;
  status: string;
  createdAt?: string;
}

export function useSocket() {
  // Add SSR safety check
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [currentUser, setCurrentUser] = useState<TypingUser | null>(null);
  const socket = useRef<Socket | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  // Memoize the socket event handlers
  const sendMessage = useCallback((data: ChatMessage) => {
    if (socket.current) {
      socket.current.emit('send-message', data);
    }
  }, []);

  const onReceiveMessage = useCallback((callback: (data: ChatMessage) => void) => {
    if (socket.current) {
      socket.current.on('receive-message', callback);
    }
    // Return cleanup function
    return () => {
      socket.current?.off('receive-message', callback);
    };
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (socket.current) {
      socket.current.emit('join-room', roomId);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't initialize socket during SSR

    const initSocket = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        setCurrentUser({
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        });

        const socketUrl = getSocketUrl();
        if (!socketUrl) return;

        socket.current = io(socketUrl, {
          withCredentials: true
        });

        socket.current.on('connect', () => {
          console.log('Socket connected with ID:', socket.current?.id);
          setIsConnected(true);
          
          // If we have a user, identify
          if (user?._id) {
            console.log('Identifying as user:', user._id);
            socket.current?.emit('identify', user._id);
          } else {
            console.warn('No user ID available for socket identification');
          }
        });

        socket.current.on('disconnect', () => {
          setIsConnected(false);
        });

        // Handle online status changes
        socket.current.on('user_status_change', ({ userId, status }: OnlineStatus) => {
          setOnlineUsers(prev => {
            const updated = new Set(prev);
            if (status === 'online') {
              updated.add(userId);
            } else {
              updated.delete(userId);
            }
            return updated;
          });
        });

        // Fetch initial online users
        const response = await fetch('/api/users/online');
        if (response.ok) {
          const onlineUserIds = await response.json();
          setOnlineUsers(new Set(onlineUserIds));
        }

        // Handle typing status
        socket.current.on('typing_status', ({ userId, user, isTyping }: TypingStatus) => {
          setTypingUsers(prev => {
            const updated = new Map(prev);
            if (isTyping) {
              updated.set(userId, user);
            } else {
              updated.delete(userId);
            }
            return updated;
          });
        });

        // New friend request received
        socket.current.on('friend_request_received', (request) => {
          console.log('Received friend request via socket:', request);
          setPendingRequests(prev => [...prev, request]);
        });

        // Friend request accepted or rejected
        socket.current.on('friend_request_updated', (requestId) => {
          console.log('Friend request updated via socket:', requestId);
          setPendingRequests(prev => prev.filter(request => request._id !== requestId));
        });
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    initSocket();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
      socket.current?.off('friend_request_received');
      socket.current?.off('friend_request_updated');
    };
  }, [isClient]); // Add isClient to dependencies

  // Return empty values during SSR
  if (!isClient) {
    return {
      socket: null,
      isConnected: false,
      onlineUsers: new Set(),
      typingUsers: new Map(),
      joinRoom: () => {},
      sendMessage: () => {},
      onReceiveMessage: () => () => {},
      startTyping: () => {},
      stopTyping: () => {},
      pendingRequests: [],
      setPendingRequests: () => {},
    };
  }

  return {
    socket: socket.current,
    isConnected,
    onlineUsers,
    typingUsers,
    joinRoom,
    sendMessage,
    onReceiveMessage,
    startTyping: (recipientId: string) => {
      if (!socket.current || !currentUser) return;
      socket.current.emit('typing_start', { 
        recipientId, 
        user: currentUser
      });
    },
    stopTyping: (recipientId: string) => {
      if (!socket.current || !currentUser) return;
      socket.current.emit('typing_stop', { 
        recipientId,
        user: currentUser
      });
    },
    pendingRequests,
    setPendingRequests,
  };
} 