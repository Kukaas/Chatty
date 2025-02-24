"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search users');
      }
      
      setUsers(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search users');
      toast.error(error instanceof Error ? error.message : 'Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends?type=request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send friend request');
      }

      toast.success('Friend request sent successfully');
      // Remove user from the list
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find People</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {!error && users.length === 0 && searchTerm && !loading && (
          <p className="text-sm text-muted-foreground">No users found matching your search.</p>
        )}

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendFriendRequest(user._id)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 