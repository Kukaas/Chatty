'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut, Search, Menu, UserPlus, Clock, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";
import { toast } from "sonner";
import { BottomMenu } from "@/components/bottom-menu";
import { useState, useEffect } from 'react';
import { UserSearch } from "@/components/friends/user-search";

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
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ users: [] });
  const [suggestedPeople, setSuggestedPeople] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSuggestedPeople = async () => {
      try {
        const response = await fetch('/api/users/suggested');
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSuggestedPeople(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestedPeople();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    
    if (!searchQuery.trim()) {
      setSearchResults({ users: [] });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults({ users: Array.isArray(data) ? data : [] });
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

      if (!response.ok) throw new Error('Failed to process friend action');

      // Refresh the search results
      handleSearch(new Event('submit') as any);
    } catch (error) {
      console.error('Friend action error:', error);
    }
  };

  const renderFriendshipButton = (user: User) => {
    switch (user.friendshipStatus) {
      case 'accepted':
        return (
          <button 
            onClick={() => router.push(`/chat/${user._id}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </button>
        );
      
      case 'pending':
        return user.isRequester ? (
          <button 
            onClick={() => handleFriendAction(user, 'cancel')}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200"
          >
            <Clock className="h-4 w-4" />
            <span>Pending</span>
            <X className="h-4 w-4 ml-1" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => handleFriendAction(user, 'accept')}
              className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Accept
            </button>
            <button 
              onClick={() => handleFriendAction(user, 'reject')}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Decline
            </button>
          </div>
        );
      
      default:
        return (
          <button 
            onClick={() => handleFriendAction(user, 'add')}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Friend
          </button>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-20 w-full max-w-[320px] bg-white transform transition-transform duration-200 ease-in-out
        border-r border-neutral-100 flex flex-col
        md:relative md:translate-x-0 md:w-80
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Search */}
        <div className="p-4">
          <form onSubmit={handleSearch} className="relative flex gap-2">
            <Input
              placeholder="Search people"
              className="pl-4 pr-4 h-10 bg-neutral-50 border-0 rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="h-10 w-10 flex items-center justify-center bg-black text-white rounded-lg hover:bg-black/90 transition-colors shrink-0 md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>
            <button 
              type="submit"
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors hidden md:block"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Lists Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <h3 className="text-xs font-medium text-neutral-400 mb-2">PENDING REQUESTS</h3>
            <FriendRequests />
          </div>
          <div className="px-4 py-2">
            <h3 className="text-xs font-medium text-neutral-400 mb-2">FRIENDS</h3>
            <FriendsList />
          </div>
        </div>

        <BottomMenu />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50">
        {/* Header */}
        <div className="h-14 sm:h-16 border-b border-neutral-100 px-3 sm:px-6 flex items-center sticky top-0 z-10 bg-white">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-neutral-50 rounded-lg -ml-2"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base sm:text-lg font-medium ml-2 sm:ml-0">People</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="max-w-2xl mx-auto">
            {searchQuery ? (
              isSearching ? (
                <div className="bg-white rounded-xl p-6 sm:p-12 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg 
                      className="animate-spin h-7 w-7 sm:h-8 sm:w-8 text-neutral-400" 
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
                <div className="space-y-2">
                  {searchResults.users.map(user => (
                    <div 
                      key={user._id} 
                      className="bg-white rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:p-4 sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 sm:flex-initial">
                          <h3 className="font-medium truncate text-sm">{user.name}</h3>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex mt-3 sm:mt-0 sm:ml-4">
                        {user.friendshipStatus === 'accepted' ? (
                          <button 
                            onClick={() => router.push(`/chat/${user._id}`)}
                            className="w-full sm:w-auto text-xs font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                          >
                            Message
                          </button>
                        ) : user.friendshipStatus === 'pending' ? (
                          user.isRequester ? (
                            <span className="text-xs text-neutral-400">Pending</span>
                          ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => handleFriendAction(user, 'accept')}
                                className="flex-1 sm:flex-initial text-xs font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleFriendAction(user, 'reject')}
                                className="flex-1 sm:flex-initial text-xs px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          )
                        ) : (
                          <button 
                            onClick={() => handleFriendAction(user, 'add')}
                            className="w-full sm:w-auto text-xs font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 sm:p-12 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 sm:h-8 sm:w-8 text-neutral-400" />
                  </div>
                  <h2 className="text-lg font-medium mb-2">No users found</h2>
                  <p className="text-sm text-neutral-500">
                    Try searching with a different name or email
                  </p>
                </div>
              )
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-xl p-6 sm:p-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                  </div>
                  <h2 className="text-base sm:text-lg font-medium mb-2">Find People</h2>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                    Search for people by their name or email to connect with them
                  </p>
                </div>

                {/* Suggested People */}
                {suggestedPeople.length > 0 && (
                  <div className="bg-white rounded-xl p-4 sm:p-6">
                    <h3 className="text-xs font-medium text-neutral-400 mb-4">
                      SUGGESTED PEOPLE
                    </h3>
                    <div className="space-y-3">
                      {suggestedPeople.map(user => (
                        <div 
                          key={user._id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-medium truncate">{user.name}</h3>
                              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleFriendAction(user, 'add')}
                            className="w-full sm:w-auto text-xs font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                          >
                            Add Friend
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}