import { Task } from "./types";

export interface PriorityFactors {
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  userPriority: "low" | "medium" | "high" | "urgent";
  hasDueDate: boolean;
  daysUntilDue?: number;
  isOverdue?: boolean;
}

export interface PriorityScore {
  score: number; // 1-5
  reasoning: string;
  factors: PriorityFactors;
}

/**
 * Calculate a sophisticated priority score based on multiple factors
 */
export function calculatePriorityScore(task: Partial<Task>): PriorityScore {
  // Extract impact and effort from AI reasoning
  let impact: "High" | "Medium" | "Low" = "Medium";
  let effort: "High" | "Medium" | "Low" = "Medium";

  if (task.ai_reasoning) {
    const impactMatch = task.ai_reasoning.match(/Impact=(High|Medium|Low)/);
    const effortMatch = task.ai_reasoning.match(/Effort=(High|Medium|Low)/);

    if (impactMatch) impact = impactMatch[1] as "High" | "Medium" | "Low";
    if (effortMatch) effort = effortMatch[1] as "High" | "Medium" | "Low";
  }

  // Calculate days until due date
  let daysUntilDue: number | undefined;
  let isOverdue = false;
  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    isOverdue = daysUntilDue < 0;
  }

  const factors: PriorityFactors = {
    impact,
    effort,
    userPriority: task.priority || "medium",
    hasDueDate: !!task.due_date,
    daysUntilDue,
    isOverdue,
  };

  // Base score from impact/effort matrix
  let baseScore = 2; // Default medium-low
  if (impact === "High" && effort === "Low") {
    baseScore = 5; // Quick wins - highest priority
  } else if (impact === "High" && effort === "Medium") {
    baseScore = 4; // Important but requires planning
  } else if (impact === "Medium" && effort === "Low") {
    baseScore = 3; // Good ROI
  } else if (impact === "High" && effort === "High") {
    baseScore = 3; // Major strategic work
  } else if (impact === "Medium" && effort === "Medium") {
    baseScore = 2; // Standard work
  } else if (impact === "Low" && effort === "Low") {
    baseScore = 2; // Fill-in work
  } else {
    baseScore = 1; // Low priority
  }

  // Adjust based on user priority
  const userPriorityWeight = {
    urgent: 1.5,
    high: 1.3,
    medium: 1.0,
    low: 0.8,
  };

  let adjustedScore = baseScore * userPriorityWeight[factors.userPriority];

  // Adjust based on due date
  if (factors.hasDueDate && factors.daysUntilDue !== undefined) {
    if (factors.isOverdue) {
      adjustedScore = Math.min(5, adjustedScore + 2); // Boost overdue tasks
    } else if (factors.daysUntilDue <= 1) {
      adjustedScore = Math.min(5, adjustedScore + 1.5); // Due today or tomorrow
    } else if (factors.daysUntilDue <= 3) {
      adjustedScore = Math.min(5, adjustedScore + 1); // Due in 3 days
    } else if (factors.daysUntilDue <= 7) {
      adjustedScore = Math.min(5, adjustedScore + 0.5); // Due in a week
    }
  }

  // Ensure score is within bounds and convert to integer
  const finalScore = Math.max(1, Math.min(5, Math.round(adjustedScore)));

  // Generate reasoning - focus on AI-determined factors only
  const reasoningParts: string[] = [];
  reasoningParts.push(`Impact: ${impact}, Effort: ${effort}`);

  if (factors.hasDueDate) {
    if (factors.isOverdue) {
      reasoningParts.push(
        `Overdue by ${Math.abs(factors.daysUntilDue || 0)} days`
      );
    } else if (factors.daysUntilDue !== undefined) {
      reasoningParts.push(`Due in ${factors.daysUntilDue} days`);
    }
  }

  const reasoning = `AI Analysis: ${reasoningParts.join(
    ", "
  )}. Priority Score: ${finalScore}/5`;

  return {
    score: finalScore,
    reasoning,
    factors,
  };
}

/**
 * Convert AI priority score to priority level
 */
export function scoreToPriorityLevel(
  score: number
): "low" | "medium" | "high" | "urgent" {
  if (score >= 5) return "urgent";
  if (score >= 4) return "high";
  if (score >= 3) return "medium";
  return "low";
}

/**
 * Recalculate priority scores for existing tasks
 */
export async function recalculateTaskScores(tasks: Task[]): Promise<Task[]> {
  return tasks.map((task) => {
    const priorityScore = calculatePriorityScore(task);
    return {
      ...task,
      ai_priority_score: priorityScore.score,
      ai_reasoning: priorityScore.reasoning,
    };
  });
}
