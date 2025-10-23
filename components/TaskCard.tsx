"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import { Task } from "@/lib/types";
import { updateTask, deleteTask, toggleComplete } from "@/app/actions/tasks";
import { ANIMATIONS, TRANSITIONS } from "@/lib/animations";
import { ARIA_LABELS, announceToScreenReader } from "@/lib/accessibility";

interface TaskCardProps {
  task: Task;
  onUpdate?: (updatedTask?: Task) => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );
  const [editPriority, setEditPriority] = useState(task.priority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localTask, setLocalTask] = useState(task);

  const handleToggleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await toggleComplete(task.id);
      if (result.success) {
        // Only update state after server confirmation
        const newStatus = task.status === "completed" ? "todo" : "completed";
        const action = newStatus === "completed" ? "completed" : "incomplete";

        announceToScreenReader(`Task "${task.title}" marked as ${action}`);
        onUpdate?.();
      } else {
        setError(result.error || "Failed to update task");
        announceToScreenReader(
          `Error: ${result.error || "Failed to update task"}`
        );
      }
    } catch (err) {
      setError("An unexpected error occurred");
      announceToScreenReader("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
      });

      if (result.success) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        setError(result.error || "Failed to update task");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setIsEditing(false);
    setError("");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteTask(task.id);
      if (result.success) {
        onUpdate?.();
      } else {
        setError(result.error || "Failed to delete task");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "High":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Low":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card
      className={`flex items-center gap-4 p-5 animate-in slide-in-from-bottom-2 zoom-in-95 duration-400 ${
        TRANSITIONS.standard
      } border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:shadow-md hover:border-primary/30 group cursor-pointer ${
        loading ? "opacity-60 pointer-events-none" : ""
      }`}
      role="listitem"
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        <Checkbox
          checked={localTask.status === "completed"}
          onCheckedChange={handleToggleComplete}
          disabled={loading}
          className={`h-5 w-5 ${TRANSITIONS.standard} ${
            loading ? "opacity-0" : ""
          }`}
          aria-label={
            localTask.status === "completed"
              ? ARIA_LABELS.incompleteTask
              : ARIA_LABELS.completeTask
          }
        />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary/50"
              disabled={loading}
            />
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)"
              className="bg-background/50 border-border/50 focus:border-primary/50"
              disabled={loading}
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-border/50 rounded-md bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        ) : (
          <div>
            <p
              className={`text-foreground transition-all duration-200 ${
                localTask.status === "completed"
                  ? "line-through text-muted-foreground"
                  : "font-medium"
              }`}
            >
              {localTask.title}
            </p>
            {localTask.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {localTask.description}
              </p>
            )}
            {localTask.ai_reasoning && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {localTask.ai_reasoning}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {!isEditing ? (
          <>
            <Badge
              className={`${getPriorityColor(
                task.priority
              )} border-0 text-xs font-medium`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-50 text-red-600 text-xs p-2 rounded-t-md border-b">
          {error}
        </div>
      )}
    </Card>
  );
}
