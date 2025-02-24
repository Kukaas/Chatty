'use client';

import { useEffect, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from '@/utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import { BottomMenu } from "@/components/bottom-menu";
import { toast } from "sonner";
import { Menu } from 'lucide-react';

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

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends?type=list');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
      toast.error('Failed to load friends');
    }
  };

  const getFriendDetails = (friend: Friend) => {
    if (!currentUser) return friend.recipient;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-20 w-72 bg-white transform transition-transform duration-200 ease-in-out
        border-r border-neutral-100 flex flex-col
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-lg font-medium">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.map((friend) => {
            const details = getFriendDetails(friend);
            return (
              <button
                key={friend._id}
                onClick={() => {
                  router.push(`/chat/${details._id}`);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors ${
                  pathname === `/chat/${details._id}` ? 'bg-neutral-50' : ''
                }`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={details.avatar} />
                  <AvatarFallback>{details.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left truncate">
                  <p className="text-sm font-medium truncate">{details.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{details.email}</p>
                </div>
              </button>
            );
          })}
        </div>

        <BottomMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="w-full">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 