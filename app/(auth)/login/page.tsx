import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Login - Chatty",
  description: "Login to your Chatty account",
};

export default function LoginPage() {
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

            <div className="space-y-4">
              <div>
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-2"
                  required
                />
              </div>

              <Button className="w-full mt-6 bg-black text-white hover:bg-black/90" size="lg">
                Login
              </Button>

              <div className="text-sm text-muted-foreground text-center mt-6">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-black hover:text-black/80"
                >
                  Sign up
                </Link>
              </div>
            </div>
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