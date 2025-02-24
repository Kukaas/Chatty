import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

interface OnlineStatusProps {
  userId: string;
  className?: string;
}

export function OnlineStatus({ userId, className }: OnlineStatusProps) {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.has(userId);

  return (
    <div 
      className={cn(
        "w-2.5 h-2.5 rounded-full",
        isOnline ? "bg-green-500" : "bg-neutral-300",
        className
      )}
    />
  );
} 