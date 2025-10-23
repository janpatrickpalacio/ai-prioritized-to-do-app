"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import { CreateTaskInput } from "@/lib/types";
import { showToast } from "@/components/ui/toast";
import { ANIMATIONS, TRANSITIONS } from "@/lib/animations";
import { ARIA_LABELS, announceToScreenReader } from "@/lib/accessibility";

interface TaskInputProps {
  onTaskCreated?: () => void;
}

export default function TaskInput({ onTaskCreated }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      };

      const result = await createTask(input);

      if (result.success) {
        setTitle("");
        setDescription("");
        setPriority("medium");
        showToast({
          type: "success",
          title: "Task created successfully",
          message: "Your task has been analyzed and prioritized by AI",
        });
        onTaskCreated?.();
      } else {
        const errorMessage = result.error || "Failed to create task";
        setError(errorMessage);
        showToast({
          type: "error",
          title: "Failed to create task",
          message: errorMessage,
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl ${TRANSITIONS.standard}`}
    >
      <h2 className="mb-5 text-lg font-semibold text-foreground">
        Add New Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`bg-background/50 border-border/50 focus:border-primary/50 ${TRANSITIONS.standard}`}
            disabled={loading}
            aria-label={ARIA_LABELS.taskTitle}
            aria-describedby="title-help"
          />
        </div>

        <div>
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`bg-background/50 border-border/50 focus:border-primary/50 ${TRANSITIONS.standard}`}
            disabled={loading}
            aria-label={ARIA_LABELS.taskDescription}
            aria-describedby="description-help"
          />
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-border/50 rounded-md bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {loading ? "Creating..." : "Add Task"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}
      </form>
    </Card>
  );
}
