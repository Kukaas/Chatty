'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut, UserPlus } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BottomMenuProps {
  onNavigate?: () => void;
}

export function BottomMenu({ onNavigate }: BottomMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Fetch pending requests count
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('/api/friends?type=requests');
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        setPendingRequests(data.length);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchPendingRequests();
    
    // Optional: Set up an interval to periodically check for new requests
    const interval = setInterval(fetchPendingRequests, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <div className="h-16 border-t border-neutral-100 grid grid-cols-4 items-center px-2">
        <Link
          href="/chat"
          onClick={onNavigate}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50",
            pathname.startsWith('/chat') && "text-black",
            !pathname.startsWith('/chat') && "text-neutral-400"
          )}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Chat</span>
        </Link>
        
        <Link
          href="/friends"
          onClick={onNavigate}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50",
            pathname === '/friends' && "text-black",
            pathname !== '/friends' && "text-neutral-400"
          )}
        >
          <UserPlus className="h-5 w-5" />
          <span className="text-xs">Add</span>
        </Link>

        <Link
          href="/connections"
          onClick={onNavigate}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50 relative",
            pathname === '/connections' && "text-black",
            pathname !== '/connections' && "text-neutral-400"
          )}
        >
          <div className="relative">
            <Users className="h-5 w-5" />
            {pendingRequests > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {pendingRequests}
              </div>
            )}
          </div>
          <span className="text-xs">Friends</span>
        </Link>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50 text-neutral-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs">Logout</span>
        </button>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 