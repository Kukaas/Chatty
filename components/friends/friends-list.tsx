"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User } from "lucide-react";
import { OnlineStatus } from '@/components/online-status';
import { useSocket } from '@/hooks/useSocket';

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
  const { onlineUsers } = useSocket();

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
        localStorage.setItem('userId', userData._id);
        setFriends(friendsData);
        
        console.log('Set current user:', userData._id);
        console.log('Friends data:', friendsData);
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
    
    const currentUserId = currentUser._id || localStorage.getItem('userId');
    
    return String(friend.requester._id) === String(currentUserId) ? friend.recipient : friend.requester;
  };

  // Sort friends by online status and name
  const sortedFriends = [...friends].sort((a, b) => {
    const aDetails = getFriendDetails(a);
    const bDetails = getFriendDetails(b);
    if (!aDetails || !bDetails) return 0;
    
    const aOnline = onlineUsers.has(aDetails._id);
    const bOnline = onlineUsers.has(bDetails._id);
    
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return aDetails.name.localeCompare(bDetails.name);
  });

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
      {sortedFriends.map(friend => {
        const friendDetails = getFriendDetails(friend);
        if (!friendDetails) return null;

        const truncatedEmail = truncateEmail(friendDetails.email);
        const isOnline = onlineUsers.has(friendDetails._id);

        return renderFriend({
          ...friend,
          recipient: {
            ...friend.recipient,
            email: friend.recipient._id === friendDetails._id ? truncatedEmail : friend.recipient.email
          },
          requester: {
            ...friend.requester,
            email: friend.requester._id === friendDetails._id ? truncatedEmail : friend.requester.email
          }
        });
      })}
    </div>
  );
} 