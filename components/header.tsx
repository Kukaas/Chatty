"use client";

import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/friends/check-auth', {
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const data = await response.json();
        setIsAuthenticated(response.ok && data.authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Chatty</span>
        </Link>
        
        <NavigationMenu>
          <NavigationMenuList>
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <>
                <NavigationMenuItem>
                  <Link href="/chat" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Chats
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/friends" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Friends
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
} 