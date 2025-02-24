"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User } from "lucide-react";
import { OnlineStatus } from '@/components/online-status';

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
  isLoading?: boolean;
  renderFriend: (friend: Friend) => React.ReactNode;
}

function truncateEmail(email: string) {
  if (email.length > 20) {
    return email.substring(0, 17) + '...';
  }
  return email;
}

export function FriendsList({ isLoading, renderFriend }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [userResponse, friendsResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/friends?type=list')
        ]);
        
        if (!userResponse.ok || !friendsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [userData, friendsData] = await Promise.all([
          userResponse.json(),
          friendsResponse.json()
        ]);

        setCurrentUser(userData);
        setFriends(friendsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const getFriendDetails = (friend: Friend) => {
    if (!currentUser) return null;
    return friend.requester._id === currentUser._id ? friend.recipient : friend.requester;
  };

  if (isLoadingData) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-neutral-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

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

        const truncatedEmail = truncateEmail(friendDetails.email);

        return renderFriend ? (
          renderFriend({
            ...friend,
            recipient: {
              ...friend.recipient,
              email: friend.recipient._id === friendDetails._id ? truncatedEmail : friend.recipient.email
            },
            requester: {
              ...friend.requester,
              email: friend.requester._id === friendDetails._id ? truncatedEmail : friend.requester.email
            }
          })
        ) : (
          <div 
            key={friend._id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50"
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={friendDetails.avatar} alt={friendDetails.name} />
                <AvatarFallback>{friendDetails.name[0]}</AvatarFallback>
              </Avatar>
              <OnlineStatus 
                userId={friendDetails._id} 
                className="absolute bottom-0 right-0 ring-2 ring-white"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-4">
                  <h4 className="text-sm font-medium truncate hover:underline cursor-pointer">
                    {friendDetails.name}
                  </h4>
                  <p className="text-xs text-neutral-500 hidden sm:block">
                    <span className="hidden lg:block">{friendDetails.email}</span>
                    <span className="sm:block lg:hidden">{truncatedEmail}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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