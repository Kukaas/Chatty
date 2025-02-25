'use client';

import { MessageSquare, Users, UserPlus, Clock, X, Menu, Search, Check } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  friendshipStatus: 'none' | 'pending' | 'accepted';
  friendshipId: string | null;
  isRequester: boolean;
}

interface SearchResult {
  users: User[];
  error?: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { setSidebarOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ users: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Add this new state to track sent requests
  const [sentRequests, setSentRequests] = useState<Record<string, 'sent' | 'pending'>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults({ users: [] });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      // When we get search results, for each user with a pending status where the current user is the requester,
      // we should update our sentRequests state to show the correct UI
      const users = Array.isArray(data) ? data : [];
      
      // Update the sent requests state for any pending requests
      const pendingRequests: Record<string, 'pending'> = {};
      users.forEach(user => {
        if (user.friendshipStatus === 'pending' && user.isRequester) {
          pendingRequests[user._id] = 'pending';
        }
      });
      
      // Set pending requests in our local state
      setSentRequests(prev => ({...prev, ...pendingRequests}));
      
      setSearchResults({ users });
    } catch (error) {
      setSearchResults({ users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFriendAction = async (user: User, action: 'add' | 'accept' | 'reject' | 'cancel') => {
    try {
      let endpoint = '/api/friends';
      let body = {};

      // Configure the endpoint and body based on action
      switch (action) {
        case 'add':
          endpoint += '?type=request';
          body = { userId: user._id };
          break;
        case 'accept':
        case 'reject':
          endpoint += '?type=respond';
          body = { requestId: user.friendshipId, status: action === 'accept' ? 'accepted' : 'rejected' };
          break;
        case 'cancel':
          endpoint += '?type=cancel';
          body = { requestId: user.friendshipId };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error cases
        switch (response.status) {
          case 400:
            if (data.status === 'accepted') {
              toast.error('You are already friends with this user');
              // Update the UI to show as friends
              setSearchResults(prev => ({
                ...prev,
                users: prev.users.map(u => 
                  u._id === user._id 
                    ? {...u, friendshipStatus: 'accepted'} 
                    : u
                )
              }));
            } else if (data.status === 'pending') {
              toast.error('A friend request already exists');
              // Update the UI to show as pending
              setSearchResults(prev => ({
                ...prev,
                users: prev.users.map(u => 
                  u._id === user._id 
                    ? {...u, friendshipStatus: 'pending', isRequester: true} 
                    : u
                )
              }));
            } else {
              toast.error(data.message || 'Failed to process friend action');
            }
            break;
          case 404:
            toast.error('User or friend request not found');
            break;
          case 401:
            toast.error('Please log in to manage friend requests');
            break;
          case 503:
            toast.error('Could not connect to the backend server. Please ensure it is running.');
            break;
          default:
            toast.error(data.message || 'Failed to process friend action');
        }
        return;
      }

      // Only on success, update the UI
      if (action === 'add') {
        // Show checkmark/sent state temporarily
        setSentRequests(prev => ({...prev, [user._id]: 'sent'}));
        
        // After 1 second, change to pending state
        setTimeout(() => {
          setSentRequests(prev => ({...prev, [user._id]: 'pending'}));
          
          // Update the search results to reflect the pending status
          setSearchResults(prev => ({
            ...prev,
            users: prev.users.map(u => 
              u._id === user._id 
                ? {...u, friendshipStatus: 'pending', isRequester: true, friendshipId: data.request?._id} 
                : u
            )
          }));
        }, 1000);
      } else {
        // For other actions, refresh results to get updated statuses
        handleSearch(new Event('submit') as any);
      }

      toast.success(`Friend request ${action === 'add' ? 'sent' : action}ed successfully`);
      
    } catch (error) {
      console.error('Friend action error:', error);
      toast.error('Failed to process friend action. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-14 sm:h-16 border-b border-neutral-100 px-3 sm:px-6 flex items-center sticky top-0 z-10 bg-white">
        <button 
          onClick={(e) => {
            e.preventDefault();
            setSidebarOpen(true);
          }}
          className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-medium ml-2 sm:ml-0">Add Friends</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search people by name or email"
                className="pl-4 pr-10 h-11 bg-neutral-50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors hidden sm:block"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <button 
              type="submit"
              className="sm:hidden h-11 w-11 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex items-center justify-center"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Search Results */}
          <div className="space-y-2">
            {searchQuery ? (
              isSearching ? (
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg 
                      className="animate-spin h-7 w-7 text-neutral-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium mb-2">Searching</h2>
                  <p className="text-sm text-neutral-500">
                    Looking for people matching "{searchQuery}"
                  </p>
                </div>
              ) : searchResults.users.length > 0 ? (
                searchResults.users.map(user => (
                  <div 
                    key={user._id} 
                    className="bg-white rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium truncate">{user.name}</h4>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {user.friendshipStatus === 'accepted' ? (
                      <button 
                        onClick={() => router.push(`/chat/${user._id}`)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex-shrink-0"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                    ) : user.friendshipStatus === 'pending' || sentRequests[user._id] ? (
                      user.isRequester || sentRequests[user._id] ? (
                        <button 
                          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 flex-shrink-0"
                        >
                          {sentRequests[user._id] === 'sent' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">
                            {sentRequests[user._id] === 'sent' ? 'Sent' : 'Pending'}
                          </span>
                          {(user.friendshipStatus === 'pending' && !sentRequests[user._id]) && (
                            <X 
                              className="h-4 w-4 sm:ml-1" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFriendAction(user, 'cancel');
                              }}
                            />
                          )}
                        </button>
                      ) : (
                        <div className="flex gap-2 flex-shrink-0">
                          <button 
                            onClick={() => handleFriendAction(user, 'accept')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Accept</span>
                          </button>
                          <button 
                            onClick={() => handleFriendAction(user, 'reject')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline">Decline</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <button 
                        onClick={() => handleFriendAction(user, 'add')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors flex-shrink-0"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Friend</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 text-neutral-400" />
                  </div>
                  <h2 className="text-lg font-medium mb-2">No users found</h2>
                  <p className="text-sm text-neutral-500">
                    Try searching with a different name or email
                  </p>
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-neutral-400" />
                </div>
                <h2 className="text-lg font-medium mb-2">Search for People</h2>
                <p className="text-sm text-neutral-500">
                  Find people by their name or email to connect with them
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 