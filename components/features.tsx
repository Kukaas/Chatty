import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Lock, Zap } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Experience seamless conversations with instant message delivery.",
  },
  {
    icon: Users,
    title: "Group Chats",
    description: "Create and manage group conversations with ease.",
  },
  {
    icon: Lock,
    title: "Secure",
    description: "End-to-end encryption keeps your conversations private.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Built with the latest technology for optimal performance.",
  },
];

export function Features() {
  return (
    <>
      {features.map((feature) => (
        <Card key={feature.title} className="border-2 p-6 rounded-lg">
          <CardHeader className="space-y-1 p-0">
            <feature.icon className="h-12 w-12 text-primary" />
            <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent className="mt-2 p-0">
            <CardDescription className="text-base">{feature.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </>
  );
} 