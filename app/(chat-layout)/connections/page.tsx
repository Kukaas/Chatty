'use client';

import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

interface Friend {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="flex-1 flex flex-col min-w-0">
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
        <h1 className="text-base sm:text-lg font-medium ml-2 sm:ml-0">Connections</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Pending Requests Section */}
        <div className="p-6 border-b border-neutral-100">
          <h3 className="text-xs font-medium text-neutral-400 mb-4">PENDING REQUESTS</h3>
          <div className="space-y-2">
            <FriendRequests />
          </div>
        </div>

        {/* Friends Section */}
        <div className="p-6">
          <h3 className="text-xs font-medium text-neutral-400 mb-4">FRIENDS</h3>
          <div className="space-y-2">
            <FriendsList renderFriend={(friendDetails: Friend) => (
              <Link
                href={`/chat/${friendDetails._id}`}
                key={friendDetails._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friendDetails.avatar} />
                  <AvatarFallback>{friendDetails.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{friendDetails.name}</h4>
                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{friendDetails.email}</p>
                </div>
              </Link>
            )} />
          </div>
        </div>
      </div>
    </div>
  );
} 