export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  friendshipStatus: 'none' | 'pending' | 'accepted';
  friendshipId: string | null;
  isRequester: boolean;
} 