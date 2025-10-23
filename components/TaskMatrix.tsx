"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { getTasks, updateTask } from "@/app/actions/tasks";
import TaskCard from "./TaskCard";
import {
  TrendingUp,
  Zap,
  Clock,
  Users,
  Target,
  Lightbulb,
  Calendar,
  X,
} from "lucide-react";

interface TaskMatrixProps {
  refreshTrigger?: number;
}

interface MatrixCell {
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  tasks: Task[];
}

export default function TaskMatrix({ refreshTrigger }: TaskMatrixProps) {
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

  // Create matrix cells
  const createMatrixCells = (): MatrixCell[] => {
    const cells: MatrixCell[] = [];
    const impacts: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"];
    const efforts: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"];

    impacts.forEach((impact) => {
      efforts.forEach((effort) => {
        const cellTasks = tasks.filter((task) => {
          // Map AI priority score to impact/effort
          const aiScore = task.ai_priority_score || 3;
          const taskImpact =
            aiScore >= 4 ? "High" : aiScore >= 3 ? "Medium" : "Low";
          const taskEffort =
            task.priority === "urgent"
              ? "High"
              : task.priority === "high"
              ? "Medium"
              : "Low";

          return taskImpact === impact && taskEffort === effort;
        });

        cells.push({ impact, effort, tasks: cellTasks });
      });
    });

    return cells;
  };

  const getCellColor = (impact: string, effort: string) => {
    if (impact === "High" && effort === "Low") {
      return "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-300 dark:border-green-800 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900 dark:hover:to-green-800 shadow-sm"; // Do first
    } else if (impact === "High" && effort === "Medium") {
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-300 dark:border-yellow-800 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-900 dark:hover:to-yellow-800 shadow-sm"; // Schedule
    } else if (impact === "High" && effort === "High") {
      return "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-300 dark:border-orange-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900 dark:hover:to-orange-800 shadow-sm"; // Delegate
    } else if (impact === "Medium" && effort === "Low") {
      return "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-300 dark:border-blue-800 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800 shadow-sm"; // Quick wins
    } else if (impact === "Medium" && effort === "Medium") {
      return "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-300 dark:border-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900 dark:hover:to-purple-800 shadow-sm"; // Consider
    } else if (impact === "Medium" && effort === "High") {
      return "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-300 dark:border-pink-800 hover:from-pink-100 hover:to-pink-200 dark:hover:from-pink-900 dark:hover:to-pink-800 shadow-sm"; // Maybe later
    } else if (impact === "Low" && effort === "Low") {
      return "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-300 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 shadow-sm"; // Fill time
    } else if (impact === "Low" && effort === "Medium") {
      return "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-300 dark:border-slate-700 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-700 shadow-sm"; // Avoid
    } else if (impact === "Low" && effort === "High") {
      return "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-300 dark:border-red-800 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900 dark:hover:to-red-800 shadow-sm"; // Don't do
    }
    return "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-300 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 shadow-sm";
  };

  const getCellLabel = (impact: string, effort: string) => {
    if (impact === "High" && effort === "Low")
      return { text: "Do First", icon: Zap };
    if (impact === "High" && effort === "Medium")
      return { text: "Schedule", icon: Calendar };
    if (impact === "High" && effort === "High")
      return { text: "Delegate", icon: Users };
    if (impact === "Medium" && effort === "Low")
      return { text: "Quick Wins", icon: Target };
    if (impact === "Medium" && effort === "Medium")
      return { text: "Consider", icon: Lightbulb };
    if (impact === "Medium" && effort === "High")
      return { text: "Maybe Later", icon: Clock };
    if (impact === "Low" && effort === "Low")
      return { text: "Fill Time", icon: TrendingUp };
    if (impact === "Low" && effort === "Medium")
      return { text: "Avoid", icon: X };
    if (impact === "Low" && effort === "High")
      return { text: "Don't Do", icon: X };
    return { text: `${impact} Impact, ${effort} Effort`, icon: null };
  };

  if (loading) {
    return (
      <Card className="p-12 text-center border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading matrix...</p>
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

  const matrixCells = createMatrixCells();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Task Priority Matrix
        </h2>
        <p className="text-sm text-muted-foreground">
          Organize tasks by impact and effort to focus on what matters most
        </p>
      </div>

      {/* Mobile-friendly alternative view for small screens */}
      <div className="block sm:hidden">
        <div className="space-y-4">
          {matrixCells.map((cell, index) => (
            <Card
              key={`mobile-${index}`}
              className={`p-4 border-2 transition-all duration-200 ${getCellColor(
                cell.impact,
                cell.effort
              )}`}
            >
              <div className="text-center mb-3">
                <Badge
                  variant="outline"
                  className="text-sm font-medium flex items-center gap-1 justify-center"
                >
                  {(() => {
                    const label = getCellLabel(cell.impact, cell.effort);
                    const Icon = label.icon;
                    return (
                      <>
                        {Icon && <Icon className="h-3 w-3" />}
                        {label.text}
                      </>
                    );
                  })()}
                </Badge>
              </div>
              <div className="space-y-2">
                {cell.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-md p-2 border border-white/20 dark:border-white/10 shadow-sm"
                  >
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            task.status === "completed"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1 py-0 ${
                              task.priority === "urgent"
                                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800"
                                : task.priority === "high"
                                ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800"
                                : task.priority === "medium"
                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800"
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {cell.tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Matrix Container - Desktop view */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[800px] mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
            <div className="flex items-center justify-center">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Impact ↓ / Effort →
              </span>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                Low Effort
              </div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                Medium Effort
              </div>
            </div>
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                High Effort
              </div>
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2 sm:space-y-4">
            {/* High Impact Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="flex items-center justify-center">
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                  High Impact
                </div>
              </div>
              {matrixCells.slice(0, 3).map((cell, index) => (
                <Card
                  key={`high-${index}`}
                  className={`p-2 sm:p-3 min-h-[250px] sm:min-h-[300px] border-2 transition-all duration-200 ${getCellColor(
                    cell.impact,
                    cell.effort
                  )}`}
                >
                  <div className="text-center mb-2 sm:mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs font-medium flex items-center gap-1 justify-center"
                    >
                      {(() => {
                        const label = getCellLabel(cell.impact, cell.effort);
                        const Icon = label.icon;
                        return (
                          <>
                            {Icon && <Icon className="h-3 w-3" />}
                            {label.text}
                          </>
                        );
                      })()}
                    </Badge>
                  </div>
                  <div className="space-y-1 sm:space-y-2 max-h-[200px] sm:max-h-[240px] overflow-y-auto">
                    {cell.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-md p-1.5 sm:p-2 border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <div className="shrink-0 mt-0.5 sm:mt-1">
                            <div
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                task.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                task.status === "completed"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs px-1 py-0 ${
                                  task.priority === "urgent"
                                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800"
                                    : task.priority === "high"
                                    ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800"
                                }`}
                              >
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {cell.tasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6 sm:py-8">
                        No tasks
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Medium Impact Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="flex items-center justify-center">
                <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                  Medium Impact
                </div>
              </div>
              {matrixCells.slice(3, 6).map((cell, index) => (
                <Card
                  key={`medium-${index}`}
                  className={`p-2 sm:p-3 min-h-[250px] sm:min-h-[300px] border-2 transition-all duration-200 ${getCellColor(
                    cell.impact,
                    cell.effort
                  )}`}
                >
                  <div className="text-center mb-2 sm:mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs font-medium flex items-center gap-1 justify-center"
                    >
                      {(() => {
                        const label = getCellLabel(cell.impact, cell.effort);
                        const Icon = label.icon;
                        return (
                          <>
                            {Icon && <Icon className="h-3 w-3" />}
                            {label.text}
                          </>
                        );
                      })()}
                    </Badge>
                  </div>
                  <div className="space-y-1 sm:space-y-2 max-h-[200px] sm:max-h-[240px] overflow-y-auto">
                    {cell.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-md p-1.5 sm:p-2 border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <div className="shrink-0 mt-0.5 sm:mt-1">
                            <div
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                task.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                task.status === "completed"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs px-1 py-0 ${
                                  task.priority === "urgent"
                                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800"
                                    : task.priority === "high"
                                    ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800"
                                }`}
                              >
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {cell.tasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6 sm:py-8">
                        No tasks
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Low Impact Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="flex items-center justify-center">
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium">
                  Low Impact
                </div>
              </div>
              {matrixCells.slice(6, 9).map((cell, index) => (
                <Card
                  key={`low-${index}`}
                  className={`p-2 sm:p-3 min-h-[250px] sm:min-h-[300px] border-2 transition-all duration-200 ${getCellColor(
                    cell.impact,
                    cell.effort
                  )}`}
                >
                  <div className="text-center mb-2 sm:mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs font-medium flex items-center gap-1 justify-center"
                    >
                      {(() => {
                        const label = getCellLabel(cell.impact, cell.effort);
                        const Icon = label.icon;
                        return (
                          <>
                            {Icon && <Icon className="h-3 w-3" />}
                            {label.text}
                          </>
                        );
                      })()}
                    </Badge>
                  </div>
                  <div className="space-y-1 sm:space-y-2 max-h-[200px] sm:max-h-[240px] overflow-y-auto">
                    {cell.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-md p-1.5 sm:p-2 border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <div className="shrink-0 mt-0.5 sm:mt-1">
                            <div
                              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                task.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium truncate ${
                                task.status === "completed"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs px-1 py-0 ${
                                  task.priority === "urgent"
                                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800"
                                    : task.priority === "high"
                                    ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                                    : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800"
                                }`}
                              >
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {cell.tasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-6 sm:py-8">
                        No tasks
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
