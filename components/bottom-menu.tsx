'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut, UserPlus } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
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
            "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50",
            pathname === '/connections' && "text-black",
            pathname !== '/connections' && "text-neutral-400"
          )}
        >
          <Users className="h-5 w-5" />
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