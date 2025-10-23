"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { List, Grid3X3 } from "lucide-react";

type ViewMode = "list" | "matrix";

interface ViewToggleProps {
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ onViewChange }: ViewToggleProps) {
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    // Load saved preference from localStorage
    const savedView = localStorage.getItem("task-view-mode") as ViewMode;
    if (savedView && (savedView === "list" || savedView === "matrix")) {
      setView(savedView);
      onViewChange(savedView);
    }
  }, [onViewChange]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("task-view-mode", newView);
    onViewChange(newView);
  };

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/50">
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("list")}
        className="gap-2 transition-all duration-200"
      >
        <List className="h-4 w-4" />
        List
      </Button>
      <Button
        variant={view === "matrix" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("matrix")}
        className="gap-2 transition-all duration-200"
      >
        <Grid3X3 className="h-4 w-4" />
        Matrix
      </Button>
    </div>
  );
}
