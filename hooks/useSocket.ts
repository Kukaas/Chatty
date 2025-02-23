import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

interface ChatMessage {
  roomId: string;
  content: string;
  sender: string;
}

export function useSocket() {
  const socket = useRef<Socket>();

  useEffect(() => {
    socket.current = io(SOCKET_URL);

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
    joinRoom,
    sendMessage,
    onReceiveMessage,
  };
} 