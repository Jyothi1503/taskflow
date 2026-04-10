import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface StatsCardsProps {
  tasks: Task[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status === "pending"
  ).length;

  const stats = [
    { label: "Total Tasks", value: total, icon: ListTodo, color: "text-primary" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-success" },
    { label: "Pending", value: pending, icon: Clock, color: "text-warning" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border/50 bg-card p-4 shadow-sm animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <p className="mt-2 text-2xl font-bold text-card-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
