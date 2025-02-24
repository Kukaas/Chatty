"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

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

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const getFriendDetails = (friend: Friend) => {
    if (!friend) return null;
    return friend.requester || friend.recipient;
  };

  if (loading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="space-y-1">
      {friends.length === 0 ? (
        <div className="px-3 py-2 text-sm text-neutral-400">
          No friends yet
        </div>
      ) : (
        friends.map((friend) => {
          const details = getFriendDetails(friend);
          return (
            <div key={friend._id} className="px-3 py-1.5 hover:bg-neutral-50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={details?.avatar} />
                  <AvatarFallback>
                    {details?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {details?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {details?.email}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
} 