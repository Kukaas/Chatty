import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Sign Up - Chatty",
  description: "Create a new Chatty account",
};

export default function SignUpPage() {
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

            <div className="space-y-4">
              <div>
                <Label 
                  htmlFor="name"
                  className="text-sm font-medium"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="mt-2"
                  required
                />
              </div>
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
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label 
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  className="mt-2"
                  required
                />
              </div>

              <Button className="w-full mt-6 bg-black text-white hover:bg-black/90" size="lg">
                Create Account
              </Button>

              <div className="text-sm text-muted-foreground text-center mt-6">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-black hover:text-black/80"
                >
                  Login
                </Link>
              </div>
            </div>
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