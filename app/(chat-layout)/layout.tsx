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

interface SidebarProps {
  friends: Friend[];
  currentUser: any;
  pathname: string;
  router: any;
  getFriendDetails: (friend: Friend) => {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
}

// Update the Sidebar component with proper types and fix the routing
function Sidebar({ friends, currentUser, pathname, router, getFriendDetails }: SidebarProps) {
  const { isSidebarOpen, setSidebarOpen } = useSidebar();
  
  const handleFriendClick = (friendId: string) => {
    // Only navigate if we're clicking a different friend
    if (pathname !== `/chat/${friendId}`) {
      router.push(`/chat/${friendId}`);
    }
    
    // Close sidebar on mobile regardless of navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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
                onClick={() => handleFriendClick(details._id)}
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

function LoadingSidebar() {
  const { isSidebarOpen, setSidebarOpen } = useSidebar();
  
  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white transform transition-transform duration-200 ease-in-out
        border-r border-neutral-100 flex flex-col overflow-hidden
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Skeleton Header */}
        <div className="sticky top-0 z-10 p-4 border-b border-neutral-100 bg-white flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
          >
            <Menu className="h-5 w-5 text-neutral-400" />
          </button>
          <h2 className="text-lg font-medium">Messages</h2>
        </div>

        {/* Skeleton Friend List */}
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-40 bg-neutral-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Menu */}
        <BottomMenu />
      </div>

      {/* Mobile Header - Always visible when sidebar is closed */}
      <div className={`
        md:hidden fixed top-0 left-0 right-0 h-14 sm:h-16 
        border-b border-neutral-100 px-3 sm:px-6 
        flex items-center bg-white z-20
        ${isSidebarOpen ? 'translate-x-[-100%]' : 'translate-x-0'}
        transition-transform duration-200
      `}>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-neutral-50 rounded-lg -ml-2"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-medium ml-2">Messages</h2>
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

function LoadingLayout() {
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-white">
      <LoadingSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex md:pl-0 w-full">
        <div className="w-full flex items-center justify-center">
          <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoadingUser(true);
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        console.error('Error in fetchUser:', error);
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingFriends(true);
        const response = await fetch('/api/friends?type=list', {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch friends');
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Failed to load friends:', error);
      } finally {
        setIsLoadingFriends(false);
        setIsLoadingUser(false);
      }
    };

    if (currentUser) {
      fetchFriends();
    }
  }, [currentUser]);

  const getFriendDetails = (friend: Friend) => {
    if (!currentUser) return null;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  if (isLoadingUser || isLoadingFriends) {
    return (
      <SidebarProvider>
        <LoadingLayout />
      </SidebarProvider>
    );
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