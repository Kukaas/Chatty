"use client";

import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export function Header({ showAuthButtons = true }: { showAuthButtons?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold ml-5">Chatty</span>
        </Link>
        {showAuthButtons && (
          <NavigationMenu className="mr-5">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
        {!showAuthButtons && (
          <NavigationMenu className="mr-5">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
    </header>
  );
} 