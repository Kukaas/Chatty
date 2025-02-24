import { Header } from "@/components/header";
import { UserSearch } from "@/components/friends/user-search";
import { FriendsList } from "@/components/friends/friends-list";
import { FriendRequests } from "@/components/friends/friend-requests";

export default function FriendsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto py-6 space-y-8">
        <UserSearch />
        <FriendRequests />
        <FriendsList />
      </main>
    </>
  );
}