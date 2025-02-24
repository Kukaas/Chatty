'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Users, LogOut, Menu } from 'lucide-react';
import { Header } from "@/components/header";
import { toast } from "sonner";
import { getCurrentUser } from '@/utils/auth';
import { useRouter, usePathname } from 'next/navigation';
import { BottomMenu } from "@/components/bottom-menu";

interface Friend {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

interface Message {
  _id?: string;
  content: string;
  sender: string;
  recipient: string;
  status?: 'sending' | 'sent' | 'error';
  timestamp: string | Date;
  isOwn?: boolean;
}

export default function ChatPage() {
  return (
    <div className="flex-1 flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-neutral-400" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium">No conversation selected</h3>
          <p className="text-sm text-neutral-500">
            Choose a friend from the sidebar to start messaging or continue a conversation
          </p>
        </div>
      </div>
    </div>
  );
} 