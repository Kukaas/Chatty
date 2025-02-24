'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Menu } from 'lucide-react';
import { toast } from "sonner";
import { getCurrentUser } from '@/utils/auth';
import { useParams, useRouter } from 'next/navigation';

interface Message {
  _id?: string;
  content: string;
  sender: string;
  recipient: string;
  status?: 'sending' | 'sent' | 'error';
  timestamp: string | Date;
  isOwn?: boolean;
}

interface Friend {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friend, setFriend] = useState<Friend | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, onReceiveMessage, socket } = useSocket();

  // Define fetchUser function at component level
  const fetchUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  // Initial user fetch
  useEffect(() => {
    fetchUser();
  }, []);

  const getFriendDetails = (friend: Friend) => {
    if (!currentUser) return null;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  useEffect(() => {
    const fetchFriend = async () => {
      try {
        const response = await fetch(`/api/friends/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch friend details');
        const data = await response.json();
        setFriend(data);
      } catch (error) {
        console.error('Failed to load friend:', error);
        toast.error('Failed to load friend details');
        router.push('/chat');
      }
    };

    if (currentUser) {
      fetchFriend();
    }
  }, [params.id, currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?recipientId=${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load message history');
      }
    };
    fetchMessages();
  }, [params.id]);

  // Add socket effect for receiving messages
  useEffect(() => {
    if (!socket?.current) return;

    const handleMessage = (data: Message) => {
      if (!currentUser) return;

      const isRelevantMessage = 
        data.sender === params.id || 
        data.recipient === params.id;

      if (isRelevantMessage) {
        setMessages(prev => {
          const exists = prev.some(msg => 
            msg._id === data._id || 
            (msg.content === data.content && 
             msg.sender === data.sender && 
             new Date(msg.timestamp).getTime() === new Date(data.timestamp).getTime())
          );
          
          if (exists) return prev;
          return [...prev, {
            ...data,
            timestamp: data.timestamp,
            isOwn: data.sender === currentUser._id
          }];
        });
      }
    };

    socket.current.on('receive-message', handleMessage);
    
    return () => {
      socket.current?.off('receive-message', handleMessage);
    };
  }, [socket?.current, params.id, currentUser?._id]);

  // Add scroll effect for messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add handleSendMessage function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    const newMessage: Message = {
      content: message,
      sender: currentUser._id,
      recipient: params.id as string,
      status: 'sending',
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    // Immediately add message to UI
    setMessages(prev => [...prev, newMessage]);
    
    // Clear input right away
    setMessage('');

    try {
      // Send through socket
      sendMessage({
        content: message,
        sender: currentUser._id,
        recipient: params.id as string,
      });

      // Save to database
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          recipientId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Update message status to sent
      setMessages(prev => prev.map(msg => 
        msg === newMessage 
          ? { ...msg, status: 'sent' } 
          : msg
      ));
    } catch (error) {
      // Update message status to error
      setMessages(prev => prev.map(msg => 
        msg === newMessage 
          ? { ...msg, status: 'error' } 
          : msg
      ));
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      {friend && currentUser && (
        <div className="h-16 px-4 flex items-center gap-3 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
          {/* Mobile menu button */}
          <button 
            onClick={() => router.push('/chat')}
            className="md:hidden hover:bg-neutral-50 p-2 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-neutral-600" />
          </button>

          {/* Friend details */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getFriendDetails(friend)?.avatar} />
              <AvatarFallback>
                {getFriendDetails(friend)?.name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium leading-none mb-1">
                {getFriendDetails(friend)?.name}
              </h3>
              <p className="text-xs text-neutral-500">
                {getFriendDetails(friend)?.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2.5 
                ${msg.isOwn 
                  ? 'bg-black text-white' 
                  : 'bg-neutral-100'
                }
              `}
            >
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </div>
              <div className={`
                text-[10px] mt-1 flex items-center gap-1
                ${msg.isOwn ? 'text-neutral-300' : 'text-neutral-500'}
              `}>
                {msg.status === 'sending' && '⏳'}
                {msg.status === 'error' && '❌'}
                {msg.status === 'sent' && '✓'}
                {!msg.status && formatMessageDate(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-neutral-100 bg-white">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-12 px-4 bg-neutral-100 border-0 focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0 placeholder:text-neutral-400"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim()}
            className="h-12 w-12 bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Add helper function for formatting dates
function formatMessageDate(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
} 