'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from '@/utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import { BottomMenu } from "@/components/bottom-menu";
import { Menu } from "lucide-react";
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

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

// Create a separate Sidebar component to use the context
function Sidebar({ friends, currentUser, pathname, router, getFriendDetails }) {
  const { isSidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white transform transition-transform duration-200 ease-in-out
        border-r border-neutral-100 flex flex-col overflow-hidden
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="sticky top-0 z-10 p-4 border-b border-neutral-100 bg-white flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(false);
            }}
            className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-medium">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.map((friend) => {
            const details = getFriendDetails(friend);
            if (!details) return null;
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
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={details.avatar} />
                  <AvatarFallback>{details.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left truncate flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{details.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{details.email}</p>
                </div>
              </button>
            );
          })}
        </div>

        <BottomMenu />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          // If no user is found, redirect to login
          router.push('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Error in fetchUser:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
    }
  }, [currentUser]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends?type=list', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const getFriendDetails = (friend: Friend) => {
    if (!currentUser) return null;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white">
        <Sidebar 
          friends={friends}
          currentUser={currentUser}
          pathname={pathname}
          router={router}
          getFriendDetails={getFriendDetails}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex md:pl-0 w-full">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 