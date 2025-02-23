'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password,
    };

    try {
      const response = await fetch('/api/signup', {
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

      toast.success("Account created successfully! Please check your email to verify your account.");
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-muted-foreground mt-2">
                Enter your information to create your account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="mt-2"
                  required
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-sm text-muted-foreground text-center mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-black hover:text-black/80">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-zinc-50">
          <div className="flex flex-col justify-center items-center w-full p-8">
            <h2 className="text-4xl font-bold text-black max-w-[500px] text-center">
              Join our community today
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-[400px] text-center">
              Start connecting with friends, family, and colleagues in a secure and modern environment.
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 