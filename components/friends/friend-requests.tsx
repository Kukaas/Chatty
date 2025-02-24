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
    <div className="space-y-1">
      {requests.length === 0 ? (
        <div className="px-3 py-2 text-sm text-neutral-400">
          No pending requests
        </div>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="px-3 py-1.5 hover:bg-neutral-50">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={request.requester.avatar} />
                <AvatarFallback>
                  {request.requester.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  {request.requester.name || 'Unknown'}
                </p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleResponse(request._id, 'accepted')} 
                  className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 