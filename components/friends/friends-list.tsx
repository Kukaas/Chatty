"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User } from "lucide-react";

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

interface FriendsListProps {
  renderFriend: (friend: Friend) => React.ReactNode;
}

export function FriendsList({ renderFriend }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends?type=list');
        if (!response.ok) throw new Error('Failed to fetch friends');
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const getFriendDetails = (friend: Friend) => {
    if (!currentUser) return null;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  if (friends.length === 0) {
    return (
      <div className="text-sm text-neutral-500 py-2">
        No friends yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {friends.map(friend => {
        const friendDetails = getFriendDetails(friend);
        if (!friendDetails) return null;

        return renderFriend ? (
          renderFriend(friend)
        ) : (
          <div 
            key={friend._id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50"
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={friendDetails.avatar} />
              <AvatarFallback>{friendDetails.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium truncate hover:underline cursor-pointer">
                    {friendDetails.name}
                  </h4>
                  <p className="text-xs text-neutral-500 truncate hidden sm:block">
                    {friendDetails.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 