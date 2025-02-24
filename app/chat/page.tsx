'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Users, LogOut, Menu } from 'lucide-react';
import { Header } from "@/components/header";
import { toast } from "sonner";
import { getCurrentUser } from '@/utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import { BottomMenu } from "@/components/bottom-menu";

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

interface Message {
  _id?: string;
  content: string;
  sender: string;
  recipient: string;
  status?: 'sending' | 'sent' | 'error';
  timestamp: string | Date;
  isOwn?: boolean;
}

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

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, onReceiveMessage, socket } = useSocket();
  const [friendDetails, setFriendDetails] = useState<{ [key: string]: any }>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchMessageHistory = async (friendId: string) => {
    try {
      const response = await fetch(`/api/messages?recipientId=${friendId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load message history');
    }
  };

  useEffect(() => {
    if (!socket?.current) return;

    const handleMessage = (data: Message) => {
      if (!selectedFriend || !currentUser) return;

      const isRelevantMessage = 
        data.sender === selectedFriend.recipient._id || 
        data.sender === selectedFriend.requester._id;

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
  }, [socket?.current, selectedFriend?._id, currentUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const fetchFriends = async () => {
    try {
      console.log('Fetching friends...');
      const response = await fetch('/api/friends?type=list');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      console.log('Received friends data:', JSON.stringify(data, null, 2));
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFriend = async (friend: Friend) => {
    setSelectedFriend(friend);
    setMessages([]); // Clear previous messages
    
    const recipientId = friend.requester._id === currentUser?._id
      ? friend.recipient._id
      : friend.requester._id;
      
    await fetchMessageHistory(recipientId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedFriend || !currentUser) return;

    const recipientId = selectedFriend.requester._id === currentUser._id
      ? selectedFriend.recipient._id
      : selectedFriend.requester._id;

    const newMessage: Message = {
      content: message,
      sender: currentUser._id,
      recipient: recipientId,
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
        recipient: recipientId,
      });

      // Save to database
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          recipientId,
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

  const getFriendDetails = useCallback(async (friend: Friend) => {
    if (!currentUser) return friend.recipient;
    
    const isRequester = friend.requester._id === currentUser._id;
    const details = isRequester ? friend.recipient : friend.requester;
    
    setFriendDetails(prev => ({
      ...prev,
      [friend._id]: details
    }));
  }, [currentUser]);

  useEffect(() => {
    friends.forEach(friend => {
      getFriendDetails(friend);
    });
  }, [friends, getFriendDetails]);

  useEffect(() => {
    // Cleanup function
    return () => {
      setMessages([]);
      setSelectedFriend(null);
    };
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`
        fixed inset-y-0 left-0 z-20 w-72 bg-white transform transition-transform duration-200 ease-in-out
        border-r border-neutral-100 flex flex-col
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Messages Header */}
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-lg font-medium">Messages</h2>
        </div>

        {/* Friends List - with flex-1 to push menu to bottom */}
        <div className="flex-1 overflow-y-auto">
          {friends.map((friend) => (
            <button
              key={friend._id}
              onClick={() => {
                handleSelectFriend(friend);
                // Close sidebar on mobile after selecting a friend
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors ${
                selectedFriend?._id === friend._id ? 'bg-neutral-50' : ''
              }`}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={friendDetails[friend._id]?.avatar} />
                <AvatarFallback>{friendDetails[friend._id]?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left truncate">
                <p className="text-sm font-medium truncate">{friendDetails[friend._id]?.name}</p>
                <p className="text-xs text-neutral-500 truncate">{friendDetails[friend._id]?.email}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Replace menu with component */}
        <BottomMenu />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white w-full">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-neutral-100 px-4 flex items-center">
              {/* Menu button for mobile */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="mr-3 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friendDetails[selectedFriend._id]?.avatar} />
                  <AvatarFallback>
                    {friendDetails[selectedFriend._id]?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium">{friendDetails[selectedFriend._id]?.name}</h3>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2 text-sm ${
                      msg.isOwn 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-100'
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-[10px] mt-1 opacity-70">
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
            <form
              onSubmit={handleSendMessage}
              className="border-t border-neutral-100 px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 md:h-11 px-3 md:px-4 bg-neutral-100 border-0 focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0 placeholder:text-neutral-400 text-sm"
              />
              <Button 
                type="submit" 
                size="icon"
                className="h-10 w-10 md:h-11 md:w-11 bg-black text-white hover:bg-neutral-800 transition-colors"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm p-4 text-center">
            {/* Show different messages for mobile/desktop */}
            <span className="md:hidden">
              {isSidebarOpen ? 'Select a conversation' : (
                <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Open conversations
                </button>
              )}
            </span>
            <span className="hidden md:block">
              Select a conversation to start messaging
            </span>
          </div>
        )}
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 