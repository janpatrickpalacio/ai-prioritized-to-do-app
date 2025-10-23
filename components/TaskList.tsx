"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { getTasks } from "@/app/actions/tasks";
import TaskCard from "./TaskCard";

interface TaskListProps {
  refreshTrigger?: number;
}

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const result = await getTasks();
      if (result.success && result.tasks) {
        setTasks(result.tasks);
      } else {
        setError(result.error || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  // Group tasks by status
  const incompleteTasks = tasks.filter((task) => task.status !== "completed");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  if (loading) {
    return (
      <Card className="p-12 text-center border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading tasks...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center border-border/50 bg-card/50 backdrop-blur-sm">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center border-border/50 bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground">
          No tasks yet. Add one to get started!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Active Tasks
              <span className="ml-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {incompleteTasks.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {incompleteTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Completed Tasks
              <span className="ml-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                {completedTasks.length}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={handleTaskUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
