'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export function BottomMenu() {
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
      <div className="border-t border-neutral-100 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/chat')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50 transition-colors ${
              pathname === '/chat' ? 'bg-neutral-50' : ''
            }`}
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-100">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">Chats</span>
          </button>

          <button 
            onClick={() => router.push('/friends')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50 transition-colors ${
              pathname === '/friends' ? 'bg-neutral-50' : ''
            }`}
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-100">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">Friends</span>
          </button>

          <button 
            onClick={() => setShowLogoutDialog(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-100">
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
            <span className="text-xs font-medium text-red-500">Logout</span>
          </button>
        </div>
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