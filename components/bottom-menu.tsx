'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Users, LogOut } from 'lucide-react';
import { toast } from "sonner";

export function BottomMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
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
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-neutral-100">
            <LogOut className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-xs font-medium text-red-500">Logout</span>
        </button>
      </div>
    </div>
  );
} 