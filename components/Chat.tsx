import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

interface Message {
  roomId: string;
  content: string;
  sender: string;
  timestamp?: Date;
}

export function Chat({ roomId }: { roomId: string }) {
  const { joinRoom, sendMessage, onReceiveMessage } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    joinRoom(roomId);

    onReceiveMessage((data) => {
      setMessages((prev) => [...prev, { ...data, timestamp: new Date() }]);
    });
  }, [roomId]);

  const handleSendMessage = (content: string) => {
    sendMessage({
      roomId,
      content,
      sender: 'user-id', // Replace with actual user ID
    });
  };

  return (
    <div>
      {/* Chat UI implementation */}
    </div>
  );
} 