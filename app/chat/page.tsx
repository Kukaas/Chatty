'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';
import { Header } from "@/components/header";

interface Message {
  content: string;
  sender: string;
  timestamp: Date;
  roomId: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, onReceiveMessage } = useSocket();

  useEffect(() => {
    onReceiveMessage((data) => {
      setMessages((prev) => [...prev, {
        content: data.content,
        sender: data.sender,
        roomId: data.roomId,
        timestamp: new Date()
      }]);
    });
  }, [onReceiveMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      content: message,
      sender: 'current-user', // Replace with actual user ID
      roomId: 'general', // Replace with actual room ID
      timestamp: new Date()
    };

    sendMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <>
      <Header showAuthButtons={false} />
      <div className="flex h-screen bg-gray-50 pt-16">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r">
          <div className="p-4">
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          {/* Add chat list here */}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 border-b bg-white px-6 flex items-center">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/avatars/01.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Chat Room</h3>
                <p className="text-sm text-muted-foreground">3 participants</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === 'current-user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === 'current-user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t bg-white p-4 flex items-center space-x-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
} 