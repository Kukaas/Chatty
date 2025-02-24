'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Menu } from 'lucide-react';
import { toast } from "sonner";
import { getCurrentUser } from '@/utils/auth';
import { useParams, useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { OnlineStatus } from '@/components/online-status';

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

// Add this helper function at the top of the file, outside the component
function formatMessageTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
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
  const { socket, onlineUsers, sendMessage, onReceiveMessage } = useSocket();
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

  // Memoize the message handler
  const handleMessage = useCallback((data: Message) => {
    if (!currentUser) return;

    const isRelevantMessage = 
      data.sender === params.id || 
      data.recipient === params.id;

    if (isRelevantMessage) {
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(msg => 
          (msg._id && msg._id === data._id) || 
          (msg.content === data.content && 
           msg.sender === data.sender && 
           new Date(msg.timestamp).getTime() === new Date(data.timestamp).getTime())
        );
        
        if (exists) return prev;

        return [...prev, {
          ...data,
          isOwn: data.sender === currentUser._id,
          status: 'sent'
        }];
      });

      // Scroll to bottom when new message arrives
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentUser, params.id]);

  // Set up socket message listener
  useEffect(() => {
    if (!socket) return;

    const cleanup = onReceiveMessage(handleMessage);
    return cleanup;
  }, [socket, handleMessage, onReceiveMessage]);

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
      // Send via socket first for real-time delivery
      sendMessage({
        content: message,
        sender: currentUser._id,
        recipient: params.id as string,
        timestamp: new Date()
      });

      // Then persist to database
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

      const savedMessage = await response.json();
      
      // Update message status to sent and add server-generated ID
      setMessages(prev => prev.map(msg => 
        msg === newMessage 
          ? { ...msg, status: 'sent', _id: savedMessage._id } 
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
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={friendDetails.avatar} alt={friendDetails.name} />
              <AvatarFallback>{friendDetails.name[0]}</AvatarFallback>
            </Avatar>
            <OnlineStatus 
              userId={friendDetails._id} 
              className="absolute bottom-0 right-0 ring-2 ring-white"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-medium">{friendDetails.name}</h1>
            <p className="text-xs text-neutral-500">
              {onlineUsers.has(friendDetails._id) ? 'Online' : 'Offline'}
            </p>
          </div>
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
                text-[10px] mt-1
                ${msg.isOwn ? 'text-neutral-300' : 'text-neutral-500'}
              `}>
                {msg.status === 'sending' && 'Sending...'}
                {msg.status === 'error' && 'Failed to send'}
                {(msg.status === 'sent' || !msg.status) && `Sent at ${formatMessageTime(msg.timestamp)}`}
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