"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LogIn, Plus } from "lucide-react"

interface Task {
  id: string
  text: string
  completed: boolean
  impact: "High" | "Medium" | "Low"
  effort: "High" | "Medium" | "Low"
}

export default function TodoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Refactor the API",
      completed: false,
      impact: "High",
      effort: "High",
    },
    {
      id: "2",
      text: "Update documentation",
      completed: true,
      impact: "Medium",
      effort: "Low",
    },
    {
      id: "3",
      text: "Fix authentication bug",
      completed: false,
      impact: "High",
      effort: "Medium",
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const addTask = () => {
    if (inputValue.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: inputValue,
        completed: false,
        impact: "Medium",
        effort: "Medium",
      }
      setTasks([...tasks, newTask])
      setInputValue("")
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return ""
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "High":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Low":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Task Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Organize and prioritize your work</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary transition-all duration-200"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Add Task Form */}
        <Card className="mb-10 p-6 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Add New Task</h2>
          <div className="flex gap-3">
            <Input
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
            />
            <Button
              onClick={addTask}
              className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Tasks
              <span className="ml-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {tasks.length}
              </span>
            </h2>
          </div>
          {tasks.length === 0 ? (
            <Card className="p-12 text-center border-border/50 bg-card/50 backdrop-blur-sm">
              <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className="flex items-center gap-4 p-5 transition-all duration-200 border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:shadow-md hover:border-primary/30 group cursor-pointer"
                >
                  <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-foreground transition-all duration-200 ${
                        task.completed ? "line-through text-muted-foreground" : "font-medium"
                      }`}
                    >
                      {task.text}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Badge className={`${getImpactColor(task.impact)} border-0 text-xs font-medium`}>
                      {task.impact}
                    </Badge>
                    <Badge className={`${getEffortColor(task.effort)} border-0 text-xs font-medium`}>
                      {task.effort}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
