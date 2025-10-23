export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  ai_priority_score?: number;
  ai_reasoning?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "todo" | "in_progress" | "completed" | "cancelled";
  due_date?: string;
}

export interface AIPriorityResult {
  priority_score: number;
  reasoning: string;
  suggested_priority: "low" | "medium" | "high" | "urgent";
}
