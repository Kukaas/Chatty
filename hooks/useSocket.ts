import { getCurrentUser } from '@/utils/auth';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

interface ChatMessage {
  content: string;
  sender: string;
  recipient: string;
  timestamp?: Date;
}

interface SocketRef {
  current: Socket | null;
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
          setIsConnected(true);
          // Identify the user to the server with actual user ID
          socketRef.current?.emit('identify', user._id);
        });

        socketRef.current.on('disconnect', () => {
          setIsConnected(false);
        });
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', roomId);
    }
  };

  const sendMessage = (data: ChatMessage) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', data);
    }
  };

  const onReceiveMessage = (callback: (data: ChatMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('receive-message', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    sendMessage,
    onReceiveMessage,
  };
} 