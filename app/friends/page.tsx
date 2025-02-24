'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut, Search, Menu } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";
import { toast } from "sonner";
import { BottomMenu } from "@/components/bottom-menu";
import { useState } from 'react';

export default function FriendsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast.error('Failed to logout');
    }
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
        {/* Search */}
        <div className="p-3 border-b border-neutral-100">
          <div className="relative">
            <Input
              placeholder="Find people"
              className="pl-9 h-9 bg-neutral-50 border-0"
            />
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Lists Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Friend Requests */}
          <div className="py-2">
            <div className="px-3 py-1.5">
              <span className="text-xs font-medium text-neutral-400">PENDING REQUESTS</span>
            </div>
            <FriendRequests />
          </div>

          {/* Friends List */}
          <div className="py-2">
            <div className="px-3 py-1.5">
              <span className="text-xs font-medium text-neutral-400">FRIENDS</span>
            </div>
            <FriendsList />
          </div>
        </div>

        <BottomMenu />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-white w-full">
        <div className="h-14 border-b border-neutral-100 px-4 flex items-center md:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="mr-3"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-medium">Friends</h1>
        </div>

        <div className="flex-1 flex items-center justify-center text-sm text-neutral-400 p-4 text-center">
          <span className="md:hidden">
            {isSidebarOpen ? 'Select a friend' : (
              <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Open friends list
              </button>
            )}
          </span>
          <span className="hidden md:block">
            Select a friend to view their profile
          </span>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}