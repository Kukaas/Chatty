import { Button } from "@/components/ui/button";
import { Features } from "@/components/features";
import { Header } from "@/components/header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 flex-col items-center justify-center space-y-10 px-4 pb-8 pt-24 text-center md:pb-12 md:pt-32 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4">
            <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Connect with anyone,{" "}
              <span className="text-primary">anywhere.</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Experience the future of communication with Chatty. Simple, secure, and designed for modern conversations.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container space-y-8 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to stay connected with your team, friends, and family.
            </p>
          </div>
          <div className="p-6 mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Features />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
              Ready to get started?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of users who trust Chatty for their communication needs.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/signup">Start Chatting Now</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
