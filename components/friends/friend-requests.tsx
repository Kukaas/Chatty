"use client";

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
}

export function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

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

  if (requests.length === 0) {
    return (
      <div className="text-sm text-neutral-500 py-2">
        No pending requests
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {requests.map((request) => (
        <div 
          key={request._id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={request.requester.avatar} />
            <AvatarFallback>{request.requester.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium truncate">{request.requester.name}</h4>
            <p className="text-xs text-neutral-500 truncate">{request.requester.email}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleRequest(request._id, 'accept')}
              className="p-1 rounded-md hover:bg-neutral-100"
            >
              <Check className="h-4 w-4 text-green-600" />
            </button>
            <button
              onClick={() => handleRequest(request._id, 'reject')}
              className="p-1 rounded-md hover:bg-neutral-100"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 