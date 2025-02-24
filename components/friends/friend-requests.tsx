"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface FriendRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: 'pending';
}

export function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/friends?type=requests');
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/friends?type=respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, status }),
      });

      if (!response.ok) throw new Error('Failed to respond to friend request');

      toast.success(`Friend request ${status}`);
      setRequests(requests.filter(request => request._id !== requestId));
    } catch (error) {
      toast.error('Failed to process friend request');
    }
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Friend Requests</h2>
      {requests.length === 0 ? (
        <p className="text-muted-foreground">No pending friend requests</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={request.requester.avatar} />
                  <AvatarFallback>{request.requester.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{request.requester.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{request.requester.email}</p>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleResponse(request._id, 'accepted')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleResponse(request._id, 'rejected')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Decline
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 