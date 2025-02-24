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

  if (loading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Friends</h2>
      {friends.length === 0 ? (
        <p className="text-muted-foreground">No friends yet. Add some friends to start chatting!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((friend) => (
            <Card key={friend._id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={friend.recipient.avatar || friend.requester.avatar} />
                  <AvatarFallback>
                    {(friend.recipient.name || friend.requester.name)?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{friend.recipient.name || friend.requester.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {friend.recipient.email || friend.requester.email}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 