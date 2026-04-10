import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Edit2, Trash2, Clock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  low: { label: "Low", className: "bg-secondary text-secondary-foreground" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning border-warning/30" },
  high: { label: "High", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const priority = priorityConfig[task.priority];
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  return (
    <Card className={`group animate-slide-up transition-all duration-200 hover:shadow-md ${isCompleted ? "opacity-60" : ""}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggleStatus(task.id, task.status)}
          className="mt-1 h-5 w-5 rounded-full"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium text-sm leading-snug ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priority.className}`}>
              {priority.label}
            </Badge>
            {task.due_date && (
              <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
