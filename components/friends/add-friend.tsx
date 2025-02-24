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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send friend request');
      }

      toast.success('Friend request sent successfully');
      setEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request');
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