'use client';

import { MessageSquare, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function ChatPage() {
  const router = useRouter();
  const { setSidebarOpen } = useSidebar();

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
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
        <h1 className="text-base sm:text-lg font-medium ml-2 sm:ml-0">Messages</h1>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-neutral-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No conversation selected</h3>
            <p className="text-sm text-neutral-500 max-w-sm">
              Choose a friend from the sidebar to start messaging or continue a conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 