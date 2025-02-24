'use client';

import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Menu, User, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useState } from 'react';
import { UserProfileModal } from '@/components/users/user-profile-modal';
import { User as UserType } from '@/types/user';
import { Input } from "@/components/ui/input";

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
  status: string;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const { setSidebarOpen } = useSidebar();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getFriendDetails = (friend: Friend) => {
    const currentUserId = localStorage.getItem('userId');
    return friend.requester._id === currentUserId ? friend.recipient : friend.requester;
  };

  const handleFriendAction = async (user: UserType, action: 'add' | 'accept' | 'reject' | 'cancel') => {
    try {
      let endpoint = '/api/friends';
      let body = {};

      switch (action) {
        case 'add':
          endpoint += '?type=request';
          body = { userId: user._id };
          break;
        case 'accept':
        case 'reject':
          endpoint += '?type=respond';
          body = { requestId: user.friendshipId, status: action === 'accept' ? 'accepted' : 'rejected' };
          break;
        case 'cancel':
          endpoint += '?type=cancel';
          body = { requestId: user.friendshipId };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to process friend action');

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error('Friend action error:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Header */}
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
        <div className="px-4 sm:px-6 py-4">
          <h3 className="text-xs font-medium text-neutral-400 mb-3">PENDING REQUESTS</h3>
          <div className="space-y-1">
            <FriendRequests />
          </div>
        </div>

        {/* Friends Section */}
        <div className="px-4 sm:px-6 py-4 border-t border-neutral-100">
          <h3 className="text-xs font-medium text-neutral-400 mb-3">FRIENDS</h3>
          <div>
            <FriendsList renderFriend={(friend: Friend) => {
              const friendDetails = getFriendDetails(friend);
              
              return (
                <div 
                  key={friend._id} 
                  className="flex items-center gap-3 py-2 hover:bg-neutral-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friendDetails.avatar} />
                    <AvatarFallback>{friendDetails.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium truncate">{friendDetails.name}</h4>
                        <p className="text-xs text-neutral-500 truncate">{friendDetails.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedUser({
                              _id: friendDetails._id,
                              name: friendDetails.name,
                              email: friendDetails.email,
                              avatar: friendDetails.avatar,
                              friendshipStatus: 'accepted',
                              friendshipId: friend._id,
                              isRequester: false
                            });
                          }}
                          className="p-2 hover:bg-neutral-100 rounded-lg"
                        >
                          <User className="h-4 w-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/chat/${friendDetails._id}`);
                          }}
                          className="p-2 hover:bg-neutral-100 rounded-lg"
                        >
                          <MessageSquare className="h-4 w-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }} />
          </div>
        </div>
      </div>

      <UserProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onFriendAction={handleFriendAction}
      />
    </div>
  );
} 