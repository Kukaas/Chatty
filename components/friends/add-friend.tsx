"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";

export function AddFriend() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/friends?type=request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        switch (response.status) {
          case 400:
            if (data.status === 'accepted') {
              toast.error('You are already friends with this user');
            } else if (data.status === 'pending') {
              toast.error('A friend request already exists');
            } else {
              toast.error(data.message || 'Failed to send friend request');
            }
            break;
          case 404:
            toast.error('User not found');
            break;
          case 401:
            toast.error('Please log in to send friend requests');
            break;
          case 503:
            toast.error('Could not connect to the backend server. Please ensure it is running.');
            break;
          default:
            toast.error(data.message || 'Failed to send friend request');
        }
        return;
      }

      toast.success('Friend request sent successfully');
      setEmail('');
    } catch (error) {
      toast.error('Failed to send friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Friend</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter friend's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'Sending...' : 'Find'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 