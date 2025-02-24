'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      // Add a small delay to ensure the cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the cookie was set by checking auth status
      const authCheck = await fetch('/api/friends/check-auth');
      if (!authCheck.ok) {
        throw new Error('Authentication failed');
      }

      toast.success("Login successful!");
      router.push('/chat');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen">
        {/* Left Section - Form */}
        <div className="flex w-full lg:w-1/2 h-screen">
          <div className="w-full max-w-[400px] mx-auto flex flex-col justify-center px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground mt-2">
                Enter your email and password to login to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-2"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full mt-6 bg-black text-white hover:bg-black/90" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-sm text-muted-foreground text-center mt-6">
                Don't have an account?{" "}
                <Link href="/signup" className="text-black hover:text-black/80">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-zinc-50">
          <div className="flex flex-col justify-center items-center w-full p-8">
            <h2 className="text-4xl font-bold text-black max-w-[500px] text-center">
              Connect with anyone, anywhere.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-[400px] text-center">
              Experience the future of communication with Chatty. Simple, secure, and designed for modern conversations.
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 