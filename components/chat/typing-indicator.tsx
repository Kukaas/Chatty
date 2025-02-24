'use client';

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  _id: string;
  name: string;
  avatar: string;
}

interface TypingIndicatorProps {
  className?: string;
  typingUser?: User;
}

export function TypingIndicator({ className, typingUser }: TypingIndicatorProps) {
  if (!typingUser) return null;
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-6 w-6">
        <AvatarImage src={typingUser.avatar} alt={typingUser.name} />
        <AvatarFallback>{typingUser.name[0]}</AvatarFallback>
      </Avatar>
      <div className="bg-neutral-100 py-2 px-3 rounded-full inline-flex items-center">
        <div className="flex space-x-1">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
} 