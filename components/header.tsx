"use client";

import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold ml-5">Chatty</span>
        </Link>
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
      </div>
    </header>
  );
} 