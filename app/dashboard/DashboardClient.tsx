"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import TaskMatrix from "@/components/TaskMatrix";
import ViewToggle from "@/components/ViewToggle";
import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeToggle from "@/components/ThemeToggle";
import { ToastContainer } from "@/components/ui/toast";
import { ANIMATIONS, TRANSITIONS } from "@/lib/animations";
import { ARIA_LABELS } from "@/lib/accessibility";
import { Task } from "@/lib/types";

interface DashboardClientProps {
  user: User;
  initialTasks: Task[];
}

type ViewMode = "list" | "matrix";

export default function DashboardClient({
  user,
  initialTasks,
}: DashboardClientProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleTaskCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <header
        className={`border-b border-border/50 bg-card/50 backdrop-blur-sm ${ANIMATIONS.fadeIn}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI-Prioritized Tasks
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Organize and prioritize your work with AI
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span className="truncate max-w-32">{user.email}</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <ViewToggle onViewChange={handleViewChange} />
              <ThemeToggle />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className={`gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 ${TRANSITIONS.standard} hidden sm:flex`}
              aria-label={ARIA_LABELS.signOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>

            {/* Mobile sign out button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className={`gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 ${TRANSITIONS.standard} sm:hidden`}
              aria-label={ARIA_LABELS.signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 ${ANIMATIONS.fadeIn}`}
      >
        {/* Add Task Form */}
        <div className="mb-6 sm:mb-10">
          <ErrorBoundary>
            <TaskInput onTaskCreated={handleTaskCreated} />
          </ErrorBoundary>
        </div>

        {/* Tasks Display */}
        <div className="space-y-4 sm:space-y-6">
          <ErrorBoundary>
            {view === "list" ? (
              <TaskList refreshTrigger={refreshTrigger} />
            ) : (
              <TaskMatrix refreshTrigger={refreshTrigger} />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
