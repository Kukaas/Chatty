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
import { useSidebar } from '@/contexts/SidebarContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friend, setFriend] = useState<Friend | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, onReceiveMessage, socket } = useSocket();
  const { setSidebarOpen } = useSidebar();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const getFriendDetails = (friend: Friend | null) => {
    if (!currentUser || !friend) return null;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  useEffect(() => {
    const fetchFriend = async () => {
      if (!params?.id || !currentUser) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/friends/${params.id}`, {
          credentials: 'include', // Include cookies
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch friend details');
        }

        if (!data) {
          throw new Error('No friend data received');
        }

        setFriend(data);
      } catch (error) {
        console.error('Failed to load friend:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load friend details');
        router.push('/chat');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriend();
  }, [params?.id, currentUser, router]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    const newMessage: Message = {
      content: message,
      sender: currentUser._id,
      recipient: params.id as string,
      timestamp: new Date(),
      status: 'sending',
      isOwn: true
    };

    // Add message to state immediately
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        {/* Skeleton header */}
        <div className="h-14 sm:h-16 border-b border-neutral-100 px-3 sm:px-6 flex items-center sticky top-0 z-10 bg-white">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(true);
            }}
            className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
          >
            <Menu className="h-5 w-5 text-neutral-400" />
          </button>
          <div className="flex items-center gap-3 ml-2 sm:ml-0">
            <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse" />
            <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Skeleton messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="flex justify-start">
            <div className="w-[250px] h-12 bg-neutral-100 rounded-2xl animate-pulse" />
          </div>
          <div className="flex justify-end">
            <div className="w-[200px] h-10 bg-neutral-100 rounded-2xl animate-pulse" />
          </div>
          <div className="flex justify-start">
            <div className="w-[180px] h-12 bg-neutral-100 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Skeleton input */}
        <div className="p-4 border-t border-neutral-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="h-12 w-12 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const friendDetails = friend ? getFriendDetails(friend) : null;
  if (!friendDetails) {
    return (
      <div className="flex flex-col h-screen">
        <div className="h-14 sm:h-16 border-b border-neutral-100 px-3 sm:px-6 flex items-center sticky top-0 z-10 bg-white">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(true);
            }}
            className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base sm:text-lg font-medium ml-2 sm:ml-0">Chat</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-500">Could not load chat details</p>
            <button 
              onClick={() => router.push('/chat')}
              className="mt-4 text-sm text-black hover:underline"
            >
              Return to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="h-14 sm:h-16 border-b border-neutral-100 px-3 sm:px-6 flex items-center sticky top-0 z-10 bg-white">
        <button 
          onClick={(e) => {
            e.preventDefault();
            setSidebarOpen(true);
          }}
          className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 ml-2 sm:ml-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={friendDetails?.avatar} />
            <AvatarFallback>{friendDetails?.name?.[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-base sm:text-lg font-medium">{friendDetails?.name}</h1>
        </div>
      </div>

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

// Helper function for formatting dates
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