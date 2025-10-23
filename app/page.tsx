"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogIn, Sparkles, CheckSquare, BarChart3, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      // Redirect to dashboard if user is authenticated
      if (user) {
        router.push("/dashboard");
      }
    };
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI-Prioritized Tasks
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize and prioritize your work with AI
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-2">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Smart Task Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let AI analyze your tasks and automatically prioritize them based on
            impact and effort. Focus on what matters most.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="gap-2">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
            </div>
            <p className="text-muted-foreground">
              Our AI analyzes your tasks and automatically categorizes them by
              impact and effort, helping you focus on high-value work.
            </p>
          </Card>

          <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Priority Matrix</h3>
            </div>
            <p className="text-muted-foreground">
              Visualize your tasks in a priority matrix to see which tasks to do
              first, schedule, delegate, or avoid.
            </p>
          </Card>

          <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Organization</h3>
            </div>
            <p className="text-muted-foreground">
              Switch between list and matrix views, track progress, and get
              insights on your productivity patterns.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to get organized?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users who are already using AI to prioritize
              their work.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="gap-2">
                  Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
