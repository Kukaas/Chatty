"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { UserProfileModal } from '@/components/users/user-profile-modal';
import { User } from '@/types/user';

interface FriendRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/friends?type=requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/friends?type=respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: action === 'accept' ? 'accepted' : 'rejected' }),
      });

      if (!response.ok) throw new Error('Failed to process request');
      
      toast.success(`Friend request ${action}ed`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error('Failed to process request');
    }
  };

  const handleFriendAction = async (user: User, action: 'accept' | 'reject') => {
    await handleRequest(user.friendshipId!, action);
    setSelectedUser(null);
  };

  if (requests.length === 0) {
    return (
      <div className="text-sm text-neutral-500 py-2">
        No pending requests
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {requests.map((request) => (
          <div 
            key={request._id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-2 hover:bg-neutral-50"
          >
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
              onClick={() => setSelectedUser({
                _id: request.requester._id,
                name: request.requester.name,
                email: request.requester.email,
                avatar: request.requester.avatar,
                friendshipStatus: 'pending',
                friendshipId: request._id,
                isRequester: false
              })}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={request.requester.avatar} />
                <AvatarFallback>{request.requester.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium truncate hover:underline">
                  {request.requester.name}
                </h4>
                <p className="text-xs text-neutral-500 truncate hidden sm:block">
                  {request.requester.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-13 sm:ml-0 mt-2 sm:mt-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequest(request._id, 'accept');
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-black/90 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequest(request._id, 'reject');
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-neutral-100 text-sm rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <UserProfileModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onFriendAction={handleFriendAction}
      />
    </>
  );
} 