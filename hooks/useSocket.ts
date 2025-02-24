import { getCurrentUser } from '@/utils/auth';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

interface ChatMessage {
  content: string;
  sender: string;
  recipient: string;
  timestamp?: Date;
}

export function useSocket() {
  const socket = useRef<Socket>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        socket.current = io(SOCKET_URL);

        socket.current.on('connect', () => {
          setIsConnected(true);
          // Identify the user to the server with actual user ID
          socket.current?.emit('identify', user._id);
        });

        socket.current.on('disconnect', () => {
          setIsConnected(false);
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
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket.current) {
      socket.current.emit('join-room', roomId);
    }
  };

  const sendMessage = (data: ChatMessage) => {
    if (socket.current) {
      socket.current.emit('send-message', data);
    }
  };

  const onReceiveMessage = (callback: (data: ChatMessage) => void) => {
    if (socket.current) {
      socket.current.on('receive-message', callback);
    }
  };

  return {
    socket: socket.current,
    isConnected,
    joinRoom,
    sendMessage,
    onReceiveMessage,
  };
} 