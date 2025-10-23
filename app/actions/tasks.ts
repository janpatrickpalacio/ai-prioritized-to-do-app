"use server";

import { createClient } from "@/lib/supabase/server";
import { categorizeTask } from "@/lib/openai";
import {
  calculatePriorityScore,
  scoreToPriorityLevel,
} from "@/lib/priorityScoring";
import { CreateTaskInput, UpdateTaskInput, Task } from "@/lib/types";
import { revalidatePath } from "next/cache";
import {
  sanitizeInput,
  validateTaskInput,
  rateLimitCheck,
} from "@/lib/security";
import {
  getCachedOpenAIResponse,
  cacheOpenAIResponse,
} from "@/lib/performance";

export async function createTask(
  input: CreateTaskInput
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Rate limiting check
    if (!rateLimitCheck(user.id, "create_task", 60000, 10)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      };
    }

    // Input validation and sanitization
    const sanitizedInput = {
      title: sanitizeInput(input.title),
      description: input.description
        ? sanitizeInput(input.description)
        : undefined,
      priority: input.priority,
    };

    const validation = validateTaskInput(sanitizedInput);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(", ") };
    }

    // Check for cached AI response
    let categorization = getCachedOpenAIResponse(sanitizedInput.title);

    if (!categorization) {
      // Get AI categorization
      categorization = await categorizeTask(sanitizedInput.title);

      // Cache the response
      cacheOpenAIResponse(sanitizedInput.title, categorization);
    }

    // Create a temporary task object to calculate priority score
    const tempTask = {
      title: sanitizedInput.title,
      description: sanitizedInput.description,
      priority: sanitizedInput.priority,
      due_date: input.due_date,
      ai_reasoning: `AI Analysis: Impact=${categorization.impact}, Effort=${categorization.effort}`,
    };

    // Calculate sophisticated priority score
    const priorityResult = calculatePriorityScore(tempTask);

    // Convert AI score to priority level
    const aiPriorityLevel = scoreToPriorityLevel(priorityResult.score);

    // Insert task with AI categorization and sophisticated scoring
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title: sanitizedInput.title,
        description: sanitizedInput.description,
        priority: aiPriorityLevel, // Use AI-determined priority instead of user input
        due_date: input.due_date,
        user_id: user.id,
        ai_priority_score: priorityResult.score,
        ai_reasoning: priorityResult.reasoning,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  id: string,
  updates: Partial<UpdateTaskInput>
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Update task
    const { data: task, error } = await supabase
      .from("tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the task
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Delete task
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns the task

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

export async function toggleComplete(
  id: string
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get current task status
    const { data: currentTask, error: fetchError } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Toggle status
    const newStatus = currentTask.status === "completed" ? "todo" : "completed";

    const { data: task, error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return { success: false, error: "Failed to toggle task completion" };
  }
}

export async function getTasks(filters?: {
  status?: "todo" | "in_progress" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  limit?: number;
}): Promise<{ success: boolean; tasks?: Task[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Build query
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data: tasks, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, tasks: tasks || [] };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function getTaskById(
  id: string
): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, task };
  } catch (error) {
    console.error("Error fetching task:", error);
    return { success: false, error: "Failed to fetch task" };
  }
}
