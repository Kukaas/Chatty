'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';
import { Header } from "@/components/header";
import { toast } from "sonner";
import { getCurrentUser } from '@/utils/auth';

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
    <>
      <Header />
      <div className="flex h-screen bg-gray-50 pt-16">
        {/* Sidebar with Friends List */}
        <div className="w-64 bg-white border-r">
          <div className="p-4">
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          <div className="overflow-y-auto">
            {friends.map((friend) => (
              <button
                key={friend._id}
                onClick={() => handleSelectFriend(friend)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedFriend?._id === friend._id ? 'bg-gray-100' : ''
                }`}
              >
                <Avatar>
                  <AvatarImage src={friendDetails[friend._id]?.avatar} />
                  <AvatarFallback>{friendDetails[friend._id]?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{friendDetails[friend._id]?.name}</p>
                  <p className="text-sm text-muted-foreground">{friendDetails[friend._id]?.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b bg-white px-6 flex items-center">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={friendDetails[selectedFriend._id]?.avatar} />
                    <AvatarFallback>
                      {friendDetails[selectedFriend._id]?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{friendDetails[selectedFriend._id]?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {friendDetails[selectedFriend._id]?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      msg.isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="break-words">{msg.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {msg.status === 'sending' && '⏳ Sending...'}
                        {msg.status === 'error' && '❌ Failed to send'}
                        {msg.status === 'sent' && '✓ Sent'}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a friend to start chatting
            </div>
          )}
        </div>
      </div>
    </>
  );
} 