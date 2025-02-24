'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { MessageSquare, UserPlus, Clock, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onFriendAction: (user: User, action: 'add' | 'accept' | 'reject' | 'cancel') => void;
  isLoading?: boolean;
}

export function UserProfileModal({ user, isOpen, onClose, onFriendAction, isLoading }: UserProfileModalProps) {
  const router = useRouter();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Profile for {user.name}</DialogTitle>
        </VisuallyHidden>
        
        {/* Header/Banner */}
        <div className="h-24 bg-neutral-100" />
        
        {/* Profile Content */}
        <div className="p-6 pt-0">
          <div className="flex flex-col items-center -mt-12">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
            <p className="text-sm text-neutral-500">{user.email}</p>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 w-full">
              {user.friendshipStatus === 'accepted' ? (
                <button 
                  disabled={isLoading}
                  onClick={() => {
                    router.push(`/chat/${user._id}`);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      <span>Message</span>
                    </>
                  )}
                </button>
              ) : user.friendshipStatus === 'pending' ? (
                user.isRequester ? (
                  <button 
                    disabled={isLoading}
                    onClick={() => onFriendAction(user, 'cancel')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Pending</span>
                        <X className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button 
                      disabled={isLoading}
                      onClick={() => onFriendAction(user, 'accept')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                    <button 
                      disabled={isLoading}
                      onClick={() => onFriendAction(user, 'reject')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </>
                      )}
                    </button>
                  </>
                )
              ) : (
                <button 
                  disabled={isLoading}
                  onClick={() => onFriendAction(user, 'add')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Add Friend</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 